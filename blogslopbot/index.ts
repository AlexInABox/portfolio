import TelegramBot from 'node-telegram-bot-api';
import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { spawnSync } from 'node:child_process';

dotenv.config();

interface BlogEntry {
    id: number;
    date: string;
    html?: string[];
    image?: string;
    blurhash?: string;
    width?: number;
    height?: number;
}

const repositoryPath = '/tmp/portfolio';
const telegramToken = process.env.TELEGRAM_BOT_TOKEN!;
const allowedFromId = Number(process.env.TELEGRAM_ALLOWED_FROM_ID!);
const repositoryUrl = process.env.GIT_REPOSITORY_URL!;
const gitUserName = process.env.GIT_USER_NAME!;
const gitUserEmail = process.env.GIT_USER_EMAIL!;

const quoteShell = (v: string) => `'${v.replace(/'/g, "'\\''")}'`;
const gitEnv = {
    ...process.env,
    GIT_SSH_COMMAND: `ssh -i ${quoteShell(process.env.GIT_SSH_PRIVATE_KEY_PATH!)} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`
};

const blogsPath = path.join(repositoryPath, 'frontend', 'public', 'blogslop', 'blogs');
const blogsFile = path.join(blogsPath, 'blogs.json');

const bot = new TelegramBot(telegramToken, { polling: true });

const readBlogs = (): BlogEntry[] => fs.existsSync(blogsFile) ? JSON.parse(fs.readFileSync(blogsFile, 'utf8')) : [];
const writeBlogs = (blogs: BlogEntry[]) => fs.writeFileSync(blogsFile, JSON.stringify(blogs, null, 4));
const getLatestBlogId = (): number => readBlogs().reduce((max, blog) => Math.max(max, blog.id), 0);

const formatDate = (): string => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};

function runGit(args: string[], cwd?: string) {
    const result = spawnSync('git', args, { cwd, encoding: 'utf8', env: gitEnv });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'git failed');
}

function prepareRepository() {
    fs.rmSync(repositoryPath, { recursive: true, force: true });
    runGit(['clone', repositoryUrl, repositoryPath]);
    runGit(['config', 'user.name', gitUserName], repositoryPath);
    runGit(['config', 'user.email', gitUserEmail], repositoryPath);
}

function commitAndPush(id: number) {
    runGit(['add', '.'], repositoryPath);
    runGit(['commit', '--no-gpg-sign', '-m', `Add blog ${id}`], repositoryPath);
    runGit(['push'], repositoryPath);
}

async function saveBlog(id: number, content: string) {
    const blogs = readBlogs();
    blogs.push({ id, date: formatDate(), html: content.split('\n') });
    writeBlogs(blogs);
}

async function savePhoto(id: number, photo: TelegramBot.PhotoSize[]) {
    const largest = photo.reduce((a, b) => (a.width * a.height > b.width * b.height ? a : b));
    const tempFile = path.join(blogsPath, `${id}.tmp`);
    const avifFile = path.join(blogsPath, `${id}.avif`);

    const url = await bot.getFileLink(largest.file_id);
    const res = await fetch(url);
    fs.writeFileSync(tempFile, Buffer.from(await res.arrayBuffer()));

    const imgSharp = sharp(tempFile);
    const meta = await imgSharp.metadata();
    const width = meta.width ?? largest.width;
    const height = meta.height ?? largest.height;

    const { data, info } = await imgSharp
        .resize(32, 32, { fit: 'inside' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);

    await imgSharp.avif({ quality: 50, effort: 6 }).toFile(avifFile);
    fs.unlinkSync(tempFile);

    const blogs = readBlogs();
    blogs.push({ id, date: formatDate(), image: `${id}.avif`, blurhash, width, height });
    writeBlogs(blogs);
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    console.log(`Received ${msg.from?.id}: ${msg.text || msg.caption || '[media]'}`);

    if (msg.from?.id !== allowedFromId) {
        await bot.sendMessage(chatId, 'Who tf are you?');
        return;
    }

    if (!msg.text && !msg.caption && !msg.photo) {
        await bot.sendMessage(chatId, 'Unsupported message type.');
        return;
    }

    if (msg.text?.startsWith('/')) return;

    try {
        prepareRepository();
        const id = getLatestBlogId() + 1;

        if (msg.photo) await savePhoto(id, msg.photo);
        if (msg.text || msg.caption) await saveBlog(id, msg.text || msg.caption!);

        commitAndPush(id);

        await bot.setMessageReaction(chatId, msg.message_id, {
            reaction: [{ type: 'emoji', emoji: '❤' }],
            is_big: false
        });
    } catch (error) {
        console.error(error);
        await bot.sendMessage(chatId, 'Something went wrong.');
    }
});
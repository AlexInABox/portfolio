import TelegramBot = require('node-telegram-bot-api');
import process = require('process');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const sharp = require('sharp');
const { spawnSync } = require('node:child_process');

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const repositoryPath = '/tmp/portfolio';
const telegramToken = process.env.TELEGRAM_BOT_TOKEN!;
const allowedFromId = Number(process.env.TELEGRAM_ALLOWED_FROM_ID!);
const repositoryUrl = process.env.GIT_REPOSITORY_URL!;
const gitUserName = process.env.GIT_USER_NAME!;
const gitUserEmail = process.env.GIT_USER_EMAIL!;
const gitEnvironment = buildGitEnvironment();

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(telegramToken, { polling: true });


bot.on('message', async (msg: TelegramBot.Message) => {
    console.log(`Received message from ${msg.from?.id}: ${msg.text || msg.caption || '[non-text message]'}`);
    const chatId: TelegramBot.ChatId = msg.chat.id;
    if (msg.from!.id !== allowedFromId) {
        bot.sendMessage(chatId, 'Who tf are you?');
        return;
    }

    if (!msg.text && !msg.caption && !msg.photo) {
        await bot.sendMessage(chatId, 'Unsupported message type.');
        return;
    }

    if (msg.text && msg.text.startsWith('/')) {
        // Ignore commands!
        return;
    }

    // Clone a fresh copy so each message is applied against the current repo state.
    try {
        fs.rmSync(repositoryPath, { recursive: true, force: true });
        runGit(['clone', repositoryUrl, repositoryPath]);
        runGit(['config', 'user.name', gitUserName], repositoryPath);
        runGit(['config', 'user.email', gitUserEmail], repositoryPath);
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, 'Sorry, there was an error cloning the repository.');
        return;
    }

    const blogId = getLatestBlogId() + 1;

    if (msg.text) {
        await saveMessageToFile(msg.message_id, blogId, msg.text, bot, chatId);
    }

    if (msg.caption) {
        await saveMessageToFile(msg.message_id, blogId, msg.caption, bot, chatId);
    }

    if (msg.photo) {
        await savePhotoToFile(msg.message_id, blogId, msg.photo, bot, chatId);
    }

    // Now we need to commit and push the changes to the repository.
    try {
        runGit(['add', '.'], repositoryPath);
        runGit(['commit', '--no-gpg-sign', '-m', `Add blog ${blogId}`], repositoryPath);
        runGit(['push'], repositoryPath);
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, 'Sorry, there was an error pushing the changes to the repository.');
        return;
    }
    console.log(`Successfully added blog ${blogId} and pushed to repository.`);
});


async function saveMessageToFile(messageId: number, blogId: number, message: string, bot: TelegramBot, chatId: TelegramBot.ChatId): Promise<void> {
    const jsonData = {
        date: formatDate(),
        html: message.split('\n')
    }

    try {
        await fs.promises.writeFile(path.join(repositoryPath, 'frontend', 'public', 'blogs', `${blogId}.json`), JSON.stringify(jsonData, null, 4));
        await bot.setMessageReaction(chatId, messageId, {
            reaction: [{ type: 'emoji', emoji: '❤' }],
            is_big: false
        });
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, 'Sorry, there was an error saving your message to a file.');
    }
}

async function savePhotoToFile(messageId: number, blogId: number, photo: TelegramBot.PhotoSize[], bot: TelegramBot, chatId: TelegramBot.ChatId): Promise<void> {
    const largestPhoto = photo.reduce((largest, current) => {
        return (current.height * current.width) > (largest.height * largest.width) ? current : largest;
    });

    try {
        const fileLink = await bot.getFileLink(largestPhoto.file_id);
        const pngPath = path.join(repositoryPath, 'frontend', 'public', 'blogs', `${blogId}.png`);
        const webpPath = path.join(repositoryPath, 'frontend', 'public', 'blogs', `${blogId}.webp`);

        await new Promise<void>((resolve, reject) => {
            const fileStream = fs.createWriteStream(pngPath);
            const request = require('https').get(fileLink, (response: any) => {
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve();
                });
            });

            request.on('error', (err: any) => {
                reject(err);
            });

            fileStream.on('error', (err: any) => {
                reject(err);
            });
        });

        await sharp(pngPath)
            .webp({ quality: 90 })
            .toFile(webpPath);

        await bot.setMessageReaction(chatId, messageId, {
            reaction: [{ type: 'emoji', emoji: '❤' }],
            is_big: false
        });
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, 'Sorry, there was an error processing the photo.');
    }
}

function formatDate(date = new Date()) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();

    return `${d}.${m}.${y}`;
}

function getLatestBlogId(repoPath = repositoryPath): number {
    const files = fs.readdirSync(path.join(repoPath, 'frontend', 'public', 'blogs'));

    const blogIds = files
        .filter((file: any) => path.extname(file) === '.json') // only .json
        .map((file: any) => Number(path.basename(file, '.json')))
        .filter(Number.isFinite);

    return blogIds.length ? Math.max(...blogIds) : 0;
}

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function parseChatId(value: string): TelegramBot.ChatId {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        throw new Error('TELEGRAM_ALLOWED_CHAT_ID must be an integer');
    }

    return parsed as TelegramBot.ChatId;
}

function buildGitEnvironment(): NodeJS.ProcessEnv {
    const privateKeyPath = process.env.GIT_SSH_PRIVATE_KEY_PATH!;

    return {
        GIT_SSH_COMMAND: `ssh -i ${quoteForShell(privateKeyPath)} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`,
    };
}

function quoteForShell(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`;
}

function runGit(args: string[], cwd?: string): void {
    const result = spawnSync('git', args, {
        cwd,
        encoding: 'utf8',
        env: {
            ...process.env,
            ...gitEnvironment,
        },
    });

    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || `git ${args.join(' ')} failed`);
    }
}
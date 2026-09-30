import { decodeBlurhash } from '/_scripts/blurhash.js';

export function mount() {
  const blogContent = document.getElementById('blogslopContainer');
  const td = blogContent.parentElement.parentElement;
  const observer = new ResizeObserver(() => {
    blogContent.style.maxHeight = td.clientHeight * 0.85 + 'px';
  });

  observer.observe(td);

  function isToday(dateString) {
    const [day, month, year] = dateString.split('.').map(Number);
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
  }

  function isYesterday(dateString) {
    const [day, month, year] = dateString.split('.').map(Number);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return day === yesterday.getDate() && month === yesterday.getMonth() + 1 && year === yesterday.getFullYear();
  }

  async function loadBlogs() {
    try {
      const res = await fetch('/blogslop/blogs/blogs.json');
      if (!res.ok) return;
      const blogs = await res.json();

      const blogList = [...blogs].reverse();

      for (const blog of blogList) {
        const blogContainer = document.createElement('div');
        blogContainer.className = 'singleBlogContainer';

        if (blog.image) {
          const wrapper = document.createElement('div');
          wrapper.className = 'blogImageWrapper';

          if (blog.width && blog.height) {
            wrapper.style.aspectRatio = `${blog.width} / ${blog.height}`;
          }

          let canvas = null;
          if (blog.blurhash) {
            canvas = document.createElement('canvas');
            const w = blog.width || 32;
            const h = blog.height || 24;
            const scale = Math.min(1, 32 / w);
            const cWidth = Math.max(1, Math.round(w * scale));
            const cHeight = Math.max(1, Math.round(h * scale));

            canvas.width = cWidth;
            canvas.height = cHeight;
            canvas.className = 'blogBlurhashCanvas';

            const ctx = canvas.getContext('2d');
            if (ctx) {
              const pixels = decodeBlurhash(blog.blurhash, cWidth, cHeight);
              const imgData = ctx.createImageData(cWidth, cHeight);
              imgData.data.set(pixels);
              ctx.putImageData(imgData, 0, 0);
            }
            wrapper.appendChild(canvas);
          }

          const img = document.createElement('img');
          img.src = `/blogslop/blogs/${blog.image}`;
          img.className = 'blogImage' + (blog.blurhash ? ' has-blurhash' : '');
          img.alt = 'blog image';

          img.onload = () => {
            img.classList.add('loaded');
            if (canvas) {
              setTimeout(() => {
                canvas.style.opacity = '0';
              }, 400);
            }
          };

          img.onerror = () => {
            wrapper.remove();
          };

          img.onclick = () => {
            window.open(`/blogslop/blogs/${blog.image}`, '_blank');
          };

          wrapper.appendChild(img);
          blogContainer.appendChild(wrapper);
        }

        if (blog.html && blog.html.length > 0) {
          const blogTextContainer = document.createElement('div');
          blogTextContainer.className = 'blogTextContainer';

          let dateHeading = blog.date;
          if (isToday(blog.date)) dateHeading = 'Today';
          if (isYesterday(blog.date)) dateHeading = 'Yesterday';

          blogTextContainer.innerHTML += `<h1 class="blogHtml">${dateHeading}</h1>`;

          for (const paragraph of blog.html) {
            blogTextContainer.innerHTML += `<p class="blogHtml">${paragraph}</p>`;
          }
          blogContainer.appendChild(blogTextContainer);
        }

        blogContent.appendChild(blogContainer);
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
    }
  }

  loadBlogs();
}

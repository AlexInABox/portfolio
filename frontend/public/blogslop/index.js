const MASTODON_BASE_URL = 'https://mastodon.zeitvertreib.vip/api/v1';
const MASTODON_ACCOUNT_ID = '117382301019209994';

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

  async function loadPosts() {
    try {
      const res = await fetch(
        MASTODON_BASE_URL + '/accounts/' + MASTODON_ACCOUNT_ID + '/statuses?exclude_replies=true&exclude_reblogs=true',
      );
      if (!res.ok) return;
      const posts = await res.json();

      for (const post of posts) {
        const blogContainer = document.createElement('div');
        blogContainer.className = 'singleBlogContainer';

        if (post.media_attachments[0]) {
          const wrapper = document.createElement('div');
          wrapper.className = 'blogImageWrapper';

          wrapper.style.aspectRatio = `${post.media_attachments[0].meta.original.width} / ${post.media_attachments[0].meta.original.height}`;

          const img = document.createElement('img');
          img.src = post.media_attachments[0].url;
          img.className = 'blogImage';
          img.alt = 'blog image';

          img.onerror = () => {
            wrapper.remove();
          };

          img.onclick = () => {
            window.open(post.uri, '_blank');
          };

          wrapper.appendChild(img);
          blogContainer.appendChild(wrapper);
        }

        const blogTextContainer = document.createElement('div');
        blogTextContainer.className = 'blogTextContainer';

        const date = new Date(post.created_at);
        let formatted_date = date.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        if (isToday(formatted_date)) formatted_date = 'Today';
        if (isYesterday(formatted_date)) formatted_date = 'Yesterday';

        blogTextContainer.innerHTML += `<h1 class="blogHtml"> <a href="${post.uri}" target="_blank">${formatted_date}</a></h1>`;

        if (post.content) {
          blogTextContainer.innerHTML += `<p class="blogHtml">${post.content}</p>`;
        }
        blogContainer.appendChild(blogTextContainer);

        blogContent.appendChild(blogContainer);
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
    }
  }

  loadPosts();
}

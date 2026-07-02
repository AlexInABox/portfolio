const blogbloatContainer = document.getElementById('content3');
const blogBloatContent = document.getElementById('blogBloatContent');
const blogBloatEntryList = document.getElementById('blogBloatEntryList');


var blogbloatContainerObserver = new MutationObserver(function () {
    if (blogbloatContainer.classList.contains('hidden')) {
        return;
    }
    loadBlogbloatEntries();
});

blogbloatContainerObserver.observe(blogbloatContainer, { attributes: true, attributeFilter: ["class"] });



async function loadBlogbloatEntries() {
    const data = await fetch('blogbloat/all.json').then(res => res.json());

    var oldEntries = document.getElementsByClassName('blogbloat-entry');
    while (oldEntries[0]) {
        oldEntries[0].parentNode.removeChild(oldEntries[0]);
    }

    data.entries.sort((a, b) => new Date(b.date) - new Date(a.date));


    data.entries.forEach((entry) => {
        const entryElement = document.createElement('div');
        entryElement.classList.add('blogbloat-entry');
        entryElement.innerHTML = `<h3>${entry.title}</h3> <p class="blogbloat-date">${entry.date}</p>`;

        // TODO: instead of opening the markdown, replace the blogBloatContent innerHtml with the marked version of the markdown file!
        entryElement.addEventListener('click', () => {
            window.location.href = entry.path;
        });

        blogBloatEntryList.appendChild(entryElement);
    });
}
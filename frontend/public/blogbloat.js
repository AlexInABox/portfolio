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

if (!blogbloatContainer.classList.contains('hidden')) {
    loadBlogbloatEntries();
}

async function loadBlogbloatEntries() {
    const data = await fetch('blogbloat/all.json').then(res => res.json());

    var oldEntries = document.getElementsByClassName('blogbloat-entry');
    while (oldEntries[0]) {
        oldEntries[0].parentNode.removeChild(oldEntries[0]);
    }

    data.entries.sort((a, b) => {
        const parse = (s) => {
            const p = s.split('.');
            return p.length === 3 ? new Date(p[2], p[1] - 1, p[0]) : new Date(s);
        };
        return parse(b.date) - parse(a.date);
    });


    data.entries.forEach((entry) => {
        const entryElement = document.createElement('div');
        entryElement.classList.add('blogbloat-entry');
        entryElement.innerHTML = `<h3>${entry.title}</h3> <p class="blogbloat-date">${entry.date}</p>`;

        entryElement.addEventListener('click', () => {
            loadBlogbloatEntry(entry.path);
        });

        blogBloatEntryList.appendChild(entryElement);
    });
}

async function loadBlogbloatEntry(path) {
    const data = await fetch(path).then(res => res.text());
    if (!data) {
        window.alert("The blog entry you are trying to open is broken or empty! Sorry.");
        return;
    }

    document.getElementById("blogBloatContent").innerHTML = DOMPurify.sanitize(marked.parse(data)) + "<hr />";
}

if (window.location.hash.split('#')[1] == "blogbloat" && window.location.hash.split('#')[2] != undefined) {
    loadBlogbloatEntry("blogbloat/" + window.location.hash.split('#')[2] + ".md");
}
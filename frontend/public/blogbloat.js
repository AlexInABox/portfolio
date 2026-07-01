const blogbloatContainer = document.getElementById('content3');


var blogbloatContainerObserver = new MutationObserver(function () {
    if (blogbloatContainer.classList.contains('hidden')) {
        return;
    }

});

blogbloatContainerObserver.observe(blogbloatContainer, { attributes: true, childList: true });
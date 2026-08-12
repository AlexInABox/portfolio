let currentContextStyle = null;

async function checkContextSwitch() {
  const pathName = window.location.pathname;
  const musicPlayingNow = document.getElementById("musicPlayingNow");

  document.getElementById("contentContainer").querySelector('h1').innerHTML = `${pathName}`;
  document.getElementById("contentContainer").querySelector('h1').appendChild(musicPlayingNow);


  const container = document.getElementById("contentContainer").querySelector('div');

  if (pathName === '/') return; //TODO: restore base / content if this isnt first load.


  // CLEANUP EARLIER CONTEXT
  container.innerHTML = `<h1>Loading...</h1>`;
  currentContextStyle?.remove();
  currentContextStyle = null;


  // LOAD NEW CONTEXT
  const [htmlRes, cssRes, jsRes] = await Promise.all([
    fetch(pathName + "/index.html"),
    fetch(pathName + "/index.css")
  ]);

  if (!htmlRes.ok) {
    container.innerHTML = "<h1>NOT FOUND</h1>";
    return;
  }

  container.innerHTML = await htmlRes.text();

  if (cssRes.ok) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${pathName}/index.css`;
    document.head.appendChild(link);

    currentContextStyle = link;
  }

  try {
    const contextModule = await import(`${pathName}/index.js`);

    if (contextModule.mount) {
      contextModule.mount(container);
    }

    currentContextScript = contextModule;

  } catch (err) {
    // index.js does not exist or failed
  }
}
checkContextSwitch();


function gotoPage(newPageString) {
  window.history.pushState('', '', newPageString);
  if (newPageString === '/') {
    window.location.reload();
    return; //Return wont call probably, but just in case :3
  }
  checkContextSwitch();
}
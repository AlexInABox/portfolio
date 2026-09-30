/// This file handles all logic related to displaying music statistics about me with data taken from ListenBrainz.org :3

const profileUrl = 'https://listenbrainz.org/user/alexinabox/';
const apiBaseUrl = 'https://api.listenbrainz.org/1/user/alexinabox/';
const musicElement = document.getElementById('musicPlayingNow');
const musicElementBaseText = musicElement.textContent;

async function updateNowPlaying() {
  const response = await fetch(apiBaseUrl + 'playing-now');
  if (!response.ok) {
    console.warn(
      'I was not able to query the ListenBrainz API sucessfully. This is terrible! RESPONSE: ' + response.status,
    );
    musicElement.textContent = musicElementBaseText;
    return;
  }

  const data = await response.json();
  if (data.payload.listens[0] == undefined) {
    // NO MUSIC NO LOGS LOL
    musicElement.textContent = musicElementBaseText;
    return;
  }

  musicElement.textContent =
    '\u{1F3A7}\u{FE0E} ' +
    data.payload.listens[0].track_metadata.track_name +
    ' – ' +
    data.payload.listens[0].track_metadata.artist_name;
}

updateNowPlaying();
setInterval(() => updateNowPlaying(), 5 * 1000); //5 seconds

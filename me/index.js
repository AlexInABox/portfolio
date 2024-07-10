var data;
var withOrWithoutBy = Math.floor(Math.random() * 2) + 1; //random number between 1 and 2
var localData = {
    "district": "Mitte",
    "city": "Berlin",
    "latitude": 52.5167,
    "longitude": 13.3833,
}

var lastNetflixShowId = "";
var lastPlexName = "";
initialize();
async function initialize() {
    selectRandomMemoji();
    data = await fetchData();
    await patchLiveContent();
    getLatestPositionSnapshot();
    getLatestNetflixInformation();
    getLatestValorantInformation();
    getLatestYouTubeVideoInformation();
    getLatestYouTubeMusicInformation();
    getLatestPlexInformation();
    getLatestDuolingoInformation();
    setLastUpdatedTime();
    main();
}
setInterval(function () { main() }, 5000);


async function main() {
    data = await fetchData();
    await patchLiveContent();
    await patchRegularContent();
    updateAllMeters();
    reorderElements();
}

function reorderElements() {
    var wrapper = document.getElementsByClassName('wrapper')[0]
    var cards = wrapper.getElementsByClassName('card')

    var cardsArray = Array.from(cards);

    cardsArray.sort(function (a, b) {
        return parseInt(b.getAttribute('timestamp')) - parseInt(a.getAttribute('timestamp'));
    });

    cardsArray.forEach(function (box) {
        wrapper.appendChild(box);
    });
}

async function fetchData() {
    console.log("getting data");
    return new Promise((obj) => {
        fetch('./custom-hds/presence.json', { cache: "no-store" })
            .then(res => res.json())
            .then(data => {
                return obj(data)
            })
    })
}

async function patchLiveContent() {
    console.log("patching content");
    document.getElementById("heartRateValue").innerHTML = data.health.heartRate + " BPM";
    document.getElementById("heartRate").setAttribute('timestamp', data.health.lastUpdate.heartRate)

    updateOxygenSaturationBar(data.health.oxygenSaturation);
    document.getElementById("speedValue").innerHTML = data.health.speed + " m/s";
    document.getElementById("speed").setAttribute('timestamp', data.health.lastUpdate.speed)

}

async function patchRegularContent() {
    if (data.location.district !== localData.district || data.location.city !== localData.city) {
        localData.district = data.location.district;
        localData.city = data.location.city;
        getLatestPositionSnapshot();
        console.log("location changed");
    }
    if (data.netflix.lastWatched.showId !== lastNetflixShowId) {
        lastNetflixShowId = data.netflix.lastWatched.showId;
        getLatestNetflixInformation();
        console.log("netflix changed");
    }
    if (data.plex.lastWatched.title !== lastPlexName) {
        lastPlexName = data.plex.lastWatched.title;
        getLatestPlexInformation();
        console.log("plex changed");
    }
    if (data.valorant.username !== document.getElementById("valorant.username").innerHTML || data.valorant.rank + " - " + data.valorant.rr + " RR" !== document.getElementById("valorant.rank").innerHTML) {
        getLatestValorantInformation();
        console.log("valorant changed");
    }
    if (data.youtube.video.url !== document.getElementById("youtubeVideoURL").href) {
        getLatestYouTubeVideoInformation();
        console.log("youtube video changed");
    }
    if (data.youtube.music.url !== document.getElementById("youtubeMusicURL").href) {
        getLatestYouTubeMusicInformation();
        console.log("youtube music changed");
    }

    setLastUpdatedTime();
}

function updateOxygenSaturationBar(value) {

    value = value * 100;
    value = Math.round(value);
    //animate the transition to the new value
    var elem = document.getElementById("oxygenSaturation-bar");
    var width = document.getElementById("oxygenSaturation-bar").style.width;
    var width = width.substring(0, width.length - 1);
    var id = setInterval(frame, 10);
    function frame() {
        if (width > value) {
            width--;
            elem.style.width = (width) + '%';
            document.getElementById("oxygenSaturation-bar").innerHTML = elem.style.width;
        }
        else if (width < value) {
            width++;
            elem.style.width = (width) + '%';
            document.getElementById("oxygenSaturation-bar").innerHTML = elem.style.width;
        }
        else {
            clearInterval(id);
        }

    }

    document.getElementById("oxygenSaturation").setAttribute('timestamp', data.health.lastUpdate.oxygenSaturation)
}

function updateAllMeters() {
    // Get all the Meters
    const meters = document.querySelectorAll('svg[data-value] .meter');

    meters.forEach((path) => {
        // Get the length of the path
        let length = path.getTotalLength();

        // console.log(length);

        // Just need to set this once manually on the .meter element and then can be commented out
        // path.style.strokeDashoffset = length;
        // path.style.strokeDasharray = length;

        // Get the value of the meter
        let value = parseInt(path.parentNode.getAttribute('data-value'));
        // Calculate the percentage of the total length
        let to = length * ((100 - value) / 100);
        // Trigger Layout in Safari hack https://jakearchibald.com/2013/animated-line-drawing-svg/
        path.getBoundingClientRect();
        // Set the Offset
        path.style.strokeDashoffset = Math.max(0, to); path.nextElementSibling.textContent = `${value}%`;
    });
}
function getLatestPositionSnapshot() {
    //set src of mapbox id to mapbox api server location using the longitude and latitude in the localData object
    document.getElementById("mapbox").src = `https://api.mapbox.com/styles/v1/alexinabox/clgw8e3rx003j01qth2z003ms/draft/static/${data.location.longitude},${data.location.latitude},11.3,0,35/500x500?access_token=pk.eyJ1IjoiYWxleGluYWJveCIsImEiOiJjbGd3ODh2YmswOTd1M2hwZ2RyY3E1Nnh6In0.YT0f1GOC9fGnLpS67CAOIw`;

    if (data.location.district) { //check if the district is defined or not null (empty string)
        document.getElementById("locationText").innerHTML = `📍 ${data.location.district}, ${data.location.country}`;
    }
    else {
        document.getElementById("locationText").innerHTML = `📍 ${data.location.city}, ${data.location.country}`;
    }

    document.getElementById("location").setAttribute('timestamp', data.location.lastUpdate)
}

function selectRandomMemoji() {
    var randomMemoji = Math.floor(Math.random() * 4) + 1; //random number between 1 and 4
    document.getElementById("memoji").src = `./assets/memoji_${randomMemoji}.png`;
}

function getLatestNetflixInformation() {
    document.getElementById("netflixShowName").innerHTML = `🎬 ${data.netflix.lastWatched.title}`;
    document.getElementById("netflixShowName").href = `https://www.netflix.com/title/${data.netflix.lastWatched.showId}`;
    document.getElementById("netflixCover").src = data.netflix.lastWatched.defaultImage;
    document.getElementById("netflixCoverLink").href = `https://www.netflix.com/title/${data.netflix.lastWatched.showId}`;
    document.getElementById("netflix").setAttribute('timestamp', data.netflix.lastWatched.lastUpdate);

}

function getLatestPlexInformation() {
    document.getElementById("plexShowName").innerHTML = `🎬 ${data.plex.lastWatched.title}`;
    document.getElementById("plexCover").src = "./custom-hds" + data.plex.lastWatched.cover;
    document.getElementById("plexCoverLink").href = data.plex.lastWatched.publicURL;
    document.getElementById("plex").setAttribute('timestamp', data.plex.lastWatched.lastUpdate);
}

async function getLatestValorantInformation() {
    document.getElementById("valorant.username").innerHTML = `${data.valorant.username}`;
    var rr = (data.valorant.rr);
    console.log(rr);
    document.getElementById("valorant.progress").setAttribute("data-value", rr);
    document.getElementById("valorant.rank").innerHTML = `${data.valorant.rank} - ${data.valorant.rr} RR`;
    document.getElementById("valorant.rankIcon").setAttribute("xlink:href", await fetchRankIcon(data.valorant.rank));
    document.getElementById("valorant.mmrMeter").style.stroke = getColorForRank(data.valorant.rank);
    document.getElementById("valorant").setAttribute('timestamp', data.valorant.lastUpdate);
}

function getLatestDuolingoInformation() {
    document.getElementById("duolingoUsername").innerHTML = data.duolingo.username;
    document.getElementById("duolingoAvatar").src = data.duolingo.avatar;


    document.getElementById("duolingoLanguageFlag").src = data.duolingo.language_icon_URL;

    document.getElementById("duolingoStreakXP").innerHTML = `${data.duolingo.streak}🔥 - ${data.duolingo.xp} XP`;
    document.getElementById("duolingo").setAttribute('timestamp', data.duolingo.lastUpdate);
}

async function fetchRankIcon(rank) {
    //Send a request to the valorant api to get all the ranks with their icons
    //then return the icon for the rank that is passed in as a parameter
    //API url to get all the ranks: https://valorant-api.com/v1/competitivetiers
    var rankList;
    return new Promise((obj) => {
        fetch('https://valorant-api.com/v1/competitivetiers')
            .then(res => res.json())
            .then(data => {
                rankList = data;
                for (var i = 0; i < rankList.data[rankList.data.length - 1].tiers.length; i++) {
                    if (rankList.data[rankList.data.length - 1].tiers[i].tierName.toLowerCase() === rank.toLowerCase()) {
                        return obj(rankList.data[rankList.data.length - 1].tiers[i].largeIcon);
                    }
                }
            })
    })
}

function getColorForRank(rank) {
    //Special case for radiant
    if (rank.toLowerCase() === "radiant") {
        return "#ECE0B5";
    }
    var rank = rank.toLowerCase().substring(0, rank.length - 2); //Gold 1 -> gold
    switch (rank) {
        case "iron":
            return "#3D3D3D";
        case "bronze":
            return "#A4845C";
        case "silver":
            return "#FEFEFE";
        case "gold":
            return "#DB8E21";
        case "platinum":
            return "#3597A7";
        case "diamond":
            return "#A770F1";
        case "ascendant":
            return "#23A361";
        case "immortal":
            return "#8A1940";
        default:
            return "#000000";
    }
}

//on scroll, call the function to change the background position
//but using $ to select the window object requires jquery that we dont have therefore we need to use vanilla js
/*
window.addEventListener('scroll', function (e) {
    // only do this if in portrait mode
    if (window.innerWidth > window.innerHeight) { //landscape
        return;
    }
    scrolledY();
});
function scrolledY() {
    var scrolledY = window.pageYOffset;
    document.body.style.backgroundPosition = '0 ' + scrolledY + 'px';
}
*/

function setLastUpdatedTime() {
    var dateNow = new Date();
    var locationDate = new Date(data.location.lastUpdate);
    var netflixDate = new Date(data.netflix.lastWatched.lastUpdate);
    var valorantDate = new Date(data.valorant.lastUpdate);
    var youtubeVideoDate = new Date(data.youtube.video.lastUpdate);
    var youtubeMusicDate = new Date(data.youtube.music.lastUpdate);
    var plexDate = new Date(data.plex.lastWatched.lastUpdate);
    var duolingoDate = new Date(data.duolingo.lastUpdate);

    var locationDiff = Math.abs(dateNow - locationDate);
    var netflixDiff = Math.abs(dateNow - netflixDate);
    var valorantDiff = Math.abs(dateNow - valorantDate);
    var youtubeVideoDiff = Math.abs(dateNow - youtubeVideoDate);
    var youtubeMusicDiff = Math.abs(dateNow - youtubeMusicDate);
    var plexDiff = Math.abs(dateNow - plexDate);
    var duolingoDiff = Math.abs(dateNow - duolingoDate);


    var locationDiffSeconds = Math.floor(locationDiff / 1000);
    var netflixDiffSeconds = Math.floor(netflixDiff / 1000);
    var valorantDiffSeconds = Math.floor(valorantDiff / 1000);
    var youtubeVideoDiffSeconds = Math.floor(youtubeVideoDiff / 1000);
    var youtubeMusicDiffSeconds = Math.floor(youtubeMusicDiff / 1000);
    var plexDiffSeconds = Math.floor(plexDiff / 1000);
    var duolingoDiffSeconds = Math.floor(duolingoDiff / 1000);


    setLastUpdateTimeForLiveData();

    if (locationDiffSeconds < 60) {
        document.getElementById("locationLastUpdated").innerHTML = `${locationDiffSeconds} seconds ago`;
    }
    else if (locationDiffSeconds < 3600) {
        document.getElementById("locationLastUpdated").innerHTML = `${Math.floor(locationDiffSeconds / 60)} minutes ago`;
    }
    else if (locationDiffSeconds < 86400) {
        document.getElementById("locationLastUpdated").innerHTML = `${Math.floor(locationDiffSeconds / 3600)} hours ago`;
    }
    else {
        document.getElementById("locationLastUpdated").innerHTML = `${Math.floor(locationDiffSeconds / 86400)} days ago`;
    }

    if (netflixDiffSeconds < 60) {
        document.getElementById("netflixLastUpdated").innerHTML = `${netflixDiffSeconds} seconds ago`;
    }
    else if (netflixDiffSeconds < 3600) {
        document.getElementById("netflixLastUpdated").innerHTML = `${Math.floor(netflixDiffSeconds / 60)} minutes ago`;
    }
    else if (netflixDiffSeconds < 86400) {
        document.getElementById("netflixLastUpdated").innerHTML = `${Math.floor(netflixDiffSeconds / 3600)} hours ago`;
    }
    else {
        document.getElementById("netflixLastUpdated").innerHTML = `${Math.floor(netflixDiffSeconds / 86400)} days ago`;
    }

    if (plexDiffSeconds < 60) {
        document.getElementById("plexLastUpdated").innerHTML = `${plexDiffSeconds} seconds ago`;
    }
    else if (plexDiffSeconds < 3600) {
        document.getElementById("plexLastUpdated").innerHTML = `${Math.floor(plexDiffSeconds / 60)} minutes ago`;
    }
    else if (plexDiffSeconds < 86400) {
        document.getElementById("plexLastUpdated").innerHTML = `${Math.floor(plexDiffSeconds / 3600)} hours ago`;
    }
    else {
        document.getElementById("plexLastUpdated").innerHTML = `${Math.floor(plexDiffSeconds / 86400)} days ago`;
    }

    if (valorantDiffSeconds < 60) {
        document.getElementById("valorantLastUpdated").innerHTML = `${valorantDiffSeconds} seconds ago`;
    }
    else if (valorantDiffSeconds < 3600) {
        document.getElementById("valorantLastUpdated").innerHTML = `${Math.floor(valorantDiffSeconds / 60)} minutes ago`;
    }
    else if (valorantDiffSeconds < 86400) {
        document.getElementById("valorantLastUpdated").innerHTML = `${Math.floor(valorantDiffSeconds / 3600)} hours ago`;
    }
    else {
        document.getElementById("valorantLastUpdated").innerHTML = `${Math.floor(valorantDiffSeconds / 86400)} days ago`;
    }

    if (youtubeVideoDiffSeconds < 60) {
        document.getElementById("youtubeVideoLastUpdated").innerHTML = `${youtubeVideoDiffSeconds} seconds ago`;
    }
    else if (youtubeVideoDiffSeconds < 3600) {
        document.getElementById("youtubeVideoLastUpdated").innerHTML = `${Math.floor(youtubeVideoDiffSeconds / 60)} minutes ago`;
    }
    else if (youtubeVideoDiffSeconds < 86400) {
        document.getElementById("youtubeVideoLastUpdated").innerHTML = `${Math.floor(youtubeVideoDiffSeconds / 3600)} hours ago`;
    }
    else {
        document.getElementById("youtubeVideoLastUpdated").innerHTML = `${Math.floor(youtubeVideoDiffSeconds / 86400)} days ago`;
    }

    if (youtubeMusicDiffSeconds < 60) {
        document.getElementById("youtubeMusicLastUpdated").innerHTML = `${youtubeMusicDiffSeconds} seconds ago`;
    }
    else if (youtubeMusicDiffSeconds < 3600) {
        document.getElementById("youtubeMusicLastUpdated").innerHTML = `${Math.floor(youtubeMusicDiffSeconds / 60)} minutes ago`;
    }
    else if (youtubeMusicDiffSeconds < 86400) {
        document.getElementById("youtubeMusicLastUpdated").innerHTML = `${Math.floor(youtubeMusicDiffSeconds / 3600)} hours ago`;
    }
    else {
        document.getElementById("youtubeMusicLastUpdated").innerHTML = `${Math.floor(youtubeMusicDiffSeconds / 86400)} days ago`;
    }

    if (duolingoDiffSeconds < 60) {
        document.getElementById("duolingoLastUpdated").innerHTML = `${duolingoDiffSeconds} seconds ago`;
    } else if (duolingoDiffSeconds < 3600) {
        document.getElementById("duolingoLastUpdated").innerHTML = `${Math.floor(duolingoDiffSeconds / 60)} minutes ago`;
    } else if (duolingoDiffSeconds < 86400) {
        document.getElementById("duolingoLastUpdated").innerHTML = `${Math.floor(duolingoDiffSeconds / 3600)} hours ago`;
    } else {
        document.getElementById("duolingoLastUpdated").innerHTML = `${Math.floor(duolingoDiffSeconds / 86400)} days ago`;
    }
}

function setLastUpdateTimeForLiveData() {
    var dateNow = new Date();
    var heartRateDate = new Date(data.health.lastUpdate.heartRate);
    var oxygenSaturationDate = new Date(data.health.lastUpdate.oxygenSaturation);
    var speedDate = new Date(data.health.lastUpdate.speed);

    var heartRateDiff = Math.abs(dateNow - heartRateDate);
    var oxygenSaturationDiff = Math.abs(dateNow - oxygenSaturationDate);
    var speedDiff = Math.abs(dateNow - speedDate);

    var heartRateDiffSeconds = Math.floor(heartRateDiff / 1000);
    var oxygenSaturationDiffSeconds = Math.floor(oxygenSaturationDiff / 1000);
    var speedDiffSeconds = Math.floor(speedDiff / 1000);

    if (heartRateDiffSeconds < 60) {
        document.getElementById("heartRateLastUpdated").innerHTML = `${heartRateDiffSeconds} seconds ago`;
    }
    else if (heartRateDiffSeconds < 3600) {
        document.getElementById("heartRateLastUpdated").innerHTML = `${Math.floor(heartRateDiffSeconds / 60)} minutes ago`;
    }
    else if (heartRateDiffSeconds < 86400) {
        document.getElementById("heartRateLastUpdated").innerHTML = `${Math.floor(heartRateDiffSeconds / 3600)} hours ago`;
    }
    else {
        document.getElementById("heartRateLastUpdated").innerHTML = `${Math.floor(heartRateDiffSeconds / 86400)} days ago`;
    }

    if (oxygenSaturationDiffSeconds < 60) {
        document.getElementById("oxygenSaturationLastUpdated").innerHTML = `${oxygenSaturationDiffSeconds} seconds ago`;
    }
    else if (oxygenSaturationDiffSeconds < 3600) {
        document.getElementById("oxygenSaturationLastUpdated").innerHTML = `${Math.floor(oxygenSaturationDiffSeconds / 60)} minutes ago`;
    }
    else if (oxygenSaturationDiffSeconds < 86400) {
        document.getElementById("oxygenSaturationLastUpdated").innerHTML = `${Math.floor(oxygenSaturationDiffSeconds / 3600)} hours ago`;
    }
    else {
        document.getElementById("oxygenSaturationLastUpdated").innerHTML = `${Math.floor(oxygenSaturationDiffSeconds / 86400)} days ago`;
    }

    if (speedDiffSeconds < 60) {
        document.getElementById("speedLastUpdated").innerHTML = `${speedDiffSeconds} seconds ago`;
    }
    else if (speedDiffSeconds < 3600) {
        document.getElementById("speedLastUpdated").innerHTML = `${Math.floor(speedDiffSeconds / 60)} minutes ago`;
    }
    else if (speedDiffSeconds < 86400) {
        document.getElementById("speedLastUpdated").innerHTML = `${Math.floor(speedDiffSeconds / 3600)} hours ago`;
    }
    else {
        document.getElementById("speedLastUpdated").innerHTML = `${Math.floor(speedDiffSeconds / 86400)} days ago`;
    }
}

async function getLatestYouTubeVideoInformation() {
    document.getElementById("youtubeVideoTitle").innerHTML = `${data.youtube.video.title}`;
    if (withOrWithoutBy === 1) {
        document.getElementById("youtubeVideoChannel").innerHTML = `by: ${data.youtube.video.channel}`;
    } else {
        document.getElementById("youtubeVideoChannel").innerHTML = `${data.youtube.video.channel}`;
    }
    document.getElementById("youtubeVideoURL").href = data.youtube.video.url;
    document.getElementById("youtubeVideoThumbnail").src = data.youtube.video.thumbnail;

    document.getElementById("youtube video").setAttribute('timestamp', data.youtube.video.lastUpdate);
}

async function getLatestYouTubeMusicInformation() {
    document.getElementById("youtubeMusicTitle").innerHTML = `${data.youtube.music.title}`;
    if (withOrWithoutBy === 1) {
        document.getElementById("youtubeMusicArtist").innerHTML = `by: ${data.youtube.music.artist}`;
    } else {
        document.getElementById("youtubeMusicArtist").innerHTML = `${data.youtube.music.artist}`;
    }
    document.getElementById("youtubeMusicURL").href = data.youtube.music.url;
    document.getElementById("youtubeMusicThumbnail").src = data.youtube.music.thumbnail;

    document.getElementById("youtube music").setAttribute('timestamp', data.youtube.music.lastUpdate);
}

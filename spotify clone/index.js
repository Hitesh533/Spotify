let currentSong = new Audio();
let songs;
let currFolder;

function SecondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds with leading zeros
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
  currFolder = folder;
  // let a = await fetch("http://127.0.0.1:3000/songs/");
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  // let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  // console.log(response);

  let elements = document.createElement("div");
  elements.innerHTML = response;
  let tds = elements.getElementsByTagName("a");
  // console.log(tds);

  songs = [];
  for (let i = 0; i < tds.length; i++) {
    const element = tds[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }

  // show all the songs in the playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
        <div>Song Artist</div>
        </div>
        <div class="playnow">
        <span>Play now</span>
        <img  class="invert" style="width:24px; height:24px;" src="play-circle-fill-svgrepo-com.svg" alt="">
        </div>        
        </li>`;
  }

  // Attach an EventListener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);
  // audio.play();
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  // let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let elements = document.createElement("div");
  elements.innerHTML = response;
  let anchors = elements.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      // get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      // let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
      <div class="play">
        <img class="playbtn" src="playbutton.svg" alt="playbutton">
      </div>
      <img src="/songs/${folder}/StencilPoster.jpg" alt="">
      <img src="/songs/${folder}/SoftLight.jpg" alt="">
      <h2>${response.title}</h2>
      <p>${response.discription}</p>
      </div>`;

      // load data whenever card is clicked
      Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {
          songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
          playMusic(songs[0]);
        });
      });
    }
  }
}

async function main() {
  await getsongs("songs/ncs");
  playMusic(songs[0], true);

  // display all the albums on the page
  displayAlbums();

  // var audio = new Audio(songs[0]);
  // audio.play();
  // audio.addEventListener("loadeddata", () => {
  //   let duration = audioElement.duration;
  //   console.log(duration);
  //   console.log(audio.duration, audio.currentTime, audio.currentSrc);
  // });
  // console.log("checking...........................");

  // Attach an EventListener to play next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(
      ".songtime"
    ).innerHTML = `${SecondsToMinutesAndSeconds(
      currentSong.currentTime
    )}/${SecondsToMinutesAndSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add an eventlistener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // add an eventlistener to hamburger
  document
    .querySelector(".hamburgerContainer")
    .addEventListener("click", () => {
      document.querySelector(".left").style.left = "0";
    });

  // add an eventlistener to close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add an eventlistener to previous and next buttons
  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
      console.log(currentSong);
    }
  });

  // add an eventlistener to previous and next buttons
  next.addEventListener("click", () => {
    console.log("next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }

    // console.log(songs, index);
    // console.log(songs);
  });

  play.addEventListener("click", () => {
    console.log("play clicked");
  });

  // add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("click", (e) => {
      console.log(e, e.target, e.target.value);
      currentSong.volume = parseInt(e.target.value / 100);
    });

  // add an event to mute the volume
  document.querySelector(".volume img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
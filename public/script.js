const socket = io("/");

const peer = new Peer({
  path: "/peerjs",
  host: "/",
  port: 8080
});

// creating DOM Element
const videoElement = document.createElement("video");
videoElement.muted = true;

// Getting the video div
const videoDiv = document.querySelector("#video-grid");

let videoStream;
// Getting the video and audio stream from users Device
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(stream => {
    videoStream = stream;

    // Appending into DOM
    addVideoStream(videoElement, stream);

    // Responing on new user join
    peer.on("call", call => {
      call.answer(stream);
      call.on("stream", userVideoStream =>
        addVideoStream(document.createElement("video"), userVideoStream)
      );
    });

    // Emiting the socket from client side
    socket.on("user-connected", id => connectingToUser(id, stream));
  })
  .catch(err => window.alert(err));

peer.on("open", id => {
  socket.emit("join-room", roomId, id);
});

const connectingToUser = (id, stream) => {
  const call = peer.call(id, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (DOMVideoElement, stream) => {
  DOMVideoElement.srcObject = stream;

  // Adding event Listener
  DOMVideoElement.addEventListener("loadedmetadata", () =>
    DOMVideoElement.play()
  );

  videoDiv.append(DOMVideoElement);
};

// Using jQuery to get value from input
let text = $("input");

// Emiting to server on user enter
$("html").keydown(e => {
  if (e.which === 13 && text.val().length !== 0) {
    socket.emit("message", text.val());
    text.val("");
  }
});

// recieving the messging from server
socket.on("createMessage", message => {
  $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  let scr = $(".main__chat__window");
  scr.scrollTop(scr.prop("scrollHeight"));
};

// Mute the audio
const muteUnmute = () => {
  const enabled = videoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    videoStream.getAudioTracks()[0].enabled = false;
    setUnmutedButton();
  } else {
    setMutedButton();
    videoStream.getAudioTracks()[0].enabled = true;
  }
};
const setUnmutedButton = () =>
  (document.querySelector(".main__mute__button").innerHTML = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `);

const setMutedButton = () =>
  (document.querySelector(".main__mute__button").innerHTML = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `);

// Stop the video
const stopVideo = () => {
  const enabled = videoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    videoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    videoStream.getVideoTracks()[0].enabled = true;
  }
};
const setPlayVideo = () =>
  (document.querySelector(".main__video__button").innerHTML = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `);

const setStopVideo = () =>
  (document.querySelector(".main__video__button").innerHTML = `
    <i class="fas fa-video"></i>
    <span>Stop</span>
  `);

// content script code is injected into the host page, allows us to modify the content of the tab the extension is running on
(() => {
  // initialize variables for the youtube video player, controls, and video ID
  let ytRightControls, ytStream, currVideoId;

  // event listener for skipping to timestamp and initialization of stamp button in player
  chrome.runtime.onMessage.addListener((req, sender, res) => {
    // console.log("content onMessage");
    const { type, videoId, time } = req;
    switch (type) {
      case "NEW":
        // console.log('type = new');
        currVideoId = videoId;
        // initialize the stamp button
        newVideoLoaded().then(() => {
          res("success");
        });
        break;
      case "PLAY":
        // console.log('type = play');
        // called by the play button for a given timestamp in the popup html, set the time fo the youtube video to the requested timestamp
        try {
          ytStream.currentTime = time;
        } catch (error) {
          console.error(`error setting YT steam time: ${error.message}`);
        }
        break;

      default:
        break;
    }
    return true;
  });

  // function that add the Stamp button to the youtube video controls
  async function newVideoLoaded() {
    // console.log("in newVideoLoaded");
    try {
      if (!document.getElementsByClassName("stamp-btn")[0]) {
        const stampBtn = document.createElement("img");

        stampBtn.src = chrome.runtime.getURL("../assets/stampBtn.PNG");
        stampBtn.className = "ytp-button " + "stamp-btn";
        stampBtn.title = "Save current timestamp";

        ytRightControls =
          document.getElementsByClassName("ytp-right-controls")[0];
        ytStream = document.getElementsByClassName("video-stream")[0];

        ytRightControls.prepend(stampBtn);
        stampBtn.addEventListener("click", addNewStamp);
      }
    } catch (error) {
      console.error(`error in newVideoLoaded: ${error.message}`);
    }
  }

  // event handler to be called when the Stamp button on the YT Video is clicked, sends a request to the worker to add a new stamp to storage
  async function addNewStamp() {
    console.log("in NewStampHandler");
    // build new Stamp request
    const req = {
      type: "STAMP",
      time: ytStream.currentTime,
      videoId: currVideoId,
    };
    // send request to the service worker
    const currStamps = await sendMessagePromise(req);
    // console.log(currStamps);
  }
})();

// abstracted function to send message to the worker
function sendMessagePromise(req) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(req, (response) => {
      if (response) {
        resolve(response);
      } else {
        reject("no response received");
      }
    });
  });
}

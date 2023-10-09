// main js script for the popup html
import getCurrentTab from "./utils.js";

// adding a new stamp row to the popup html
const addNewStamp = (stampsHolder, stamp) => {
  // console.log('in addNewStamp');
  // create needed elements for the stamp, its description, and its controls
  const stampComponent = document.createElement("div");
  const stampDescription = document.createElement("div");
  const mediaParent = document.createElement("div");

  // add the timestamp description and its styling
  stampDescription.textContent = stamp.desc;
  stampDescription.className = "stamp-desc";

  // add styling for the controls
  mediaParent.className = "stamp-controls";

  // add id, styling, and store the timestamp itself in an attribute of the stamp
  stampComponent.id = `stamp-${stamp.time}`;
  stampComponent.className = "stamp";
  stampComponent.setAttribute("timestamp", stamp.time);

  // make the actual buttons for the stamp
  setStampAttributes("play", onPlay, mediaParent, stamp.time);
  setStampAttributes("delete", onDelete, mediaParent, stamp.time);

  // add the description and buttons to the stamp element, then add that to the parent holder
  stampComponent.appendChild(stampDescription);
  stampComponent.appendChild(mediaParent);
  stampsHolder.appendChild(stampComponent);
};

// function that creates button elements for the stamps
const setStampAttributes = (type, eventListener, mediaParent, stampTime) => {
  // console.log('in setStampAttributes');
  // create button and icon
  const mediaBtn = document.createElement("button");
  const mediaIcon = document.createElement("i");

  mediaBtn.title = type;
  // add event listener for the button, and set the timestamp attribute
  mediaBtn.addEventListener("click", eventListener);
  mediaBtn.setAttribute("timestamp", stampTime);
  mediaIcon.setAttribute("timestamp", stampTime);
  // if a play button, add teh appropiate styling
  if (type === "play") {
    mediaBtn.className = "play-btn";
    mediaIcon.className = "fa-solid fa-play";
    // if a delete button, add teh appropiate styling
  } else {
    mediaBtn.className = "del-btn";
    mediaIcon.className = "fa-solid fa-trash";
  }
  // add icons to button, and add button to the holder
  mediaParent.appendChild(mediaBtn);
  mediaBtn.appendChild(mediaIcon);
};

// construct the overall stamp HTML and add them to the popup
const renderStamps = (currStamps, videoId) => {
  // console.log('in RenderStamps');
  // create a parent holder for all stamps
  const stampsHolder = document.getElementById("stamps");
  stampsHolder.setAttribute("videoId", videoId);

  // reset the holder HTML
  stampsHolder.innerHTML = "";

  // if we have stamps sort and render them
  if (Object.keys(currStamps).length > 0) {
    // turn stamps object into an array and sort them
    let sortStamps = [];
    for (let time in currStamps) {
      sortStamps.push(currStamps[time]);
    }
    sortStamps = sortStamps.sort((a, b) => a.time - b.time);
    // call the addNewStamp function, making stamp HTML for each stamp object
    sortStamps.map((stamp) => {
      addNewStamp(stampsHolder, stamp);
    });
  } else {
    // if we have no stamps, render an appropriate message
    stampsHolder.innerHTML = '<i class="row">No Stamps for this video</i>';
  }
};

// onPlay event handler for the play button
const onPlay = async (e) => {
  // console.log("in onPlay");
  // grab the stamp time from the attribute
  const stampTime = e.target.getAttribute("timestamp");
  // get the current tab using the utility function
  const activeTab = await getCurrentTab();
  // send message to the content script to jump the video to the given stamptime
  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    time: stampTime,
  });
};

// onDelete event handler for the delete button
const onDelete = async (e) => {
  // console.log("in onDelete");
  // get the corresponding timestamp and video Id, and build the request object
  const time = e.target.getAttribute("timestamp");
  const videoId = document.getElementById("stamps").getAttribute("videoId");
  const req = {
    type: "DELETE",
    videoId,
    time,
  };
  // call the service worker to remove the stamp from storage
  const response = await chrome.runtime.sendMessage(req);
  // console.log(response);

  // remove the stamp HTML from the popup
  const stampToDelete = document.getElementById(`stamp-${time}`);
  stampToDelete.remove();
};

// this gets called when the DOM is loaded,
document.addEventListener("DOMContentLoaded", async () => {
  // console.log('in popup: DOMContentLoaded');
  // get the current tab with the imported utility
  const activeTab = await getCurrentTab();
  // get the video ID from the tab url, which is denoted by the "v" key always for YT
  const queryParams = activeTab.url.split("?")[1];
  const urlParams = new URLSearchParams(queryParams);
  const videoId = urlParams.get("v");
  // confirm we are indeed on a youtube video page
  if (activeTab.url.includes("youtube.com/watch") && videoId) {
    // if so, load the previously made stamps for the current video from chrome storage
    const currStamps = await getCurrentStamps(videoId);
    renderStamps(currStamps, videoId);
  } else {
    // if not a YT page, change the HTML to show a simple message
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML = '<div class="title">Not a YouTube video page</div>';
  }
});

// function that send a request to the service worker to get all the stamps for a given videoID
async function getCurrentStamps(videoId) {
  // console.log(`in popup: getCurrentStamps for ${videoId}`);
  // build the request object
  const req = {
    type: "GET",
    videoId,
  };
  // send the request message to the worker
  const currStamps = await sendMessagePromise(req);
  return currStamps;
}

// function to abstract the sending of the message to the service worker
function sendMessagePromise(req) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(req, (response) => {
      if (response) {
        resolve(response);
      } else {
        reject("no response recieved");
      }
    });
  });
}

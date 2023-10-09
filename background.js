// this is the extensions service-worker, it runs in the background and responds to events to perform tasks for the extension, it does not have access to the DOM so can't modify the webpage
// here we see it is used as an event listener, we call the worker with different event types and perform tass such as adding or removing or fetching stamps to storage,
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // console.log("background onUpdated listener");

  // all youtube videos have a /watch substring, so this lets us activate only if we are watching a video
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    // get the part of url after ?, which is the parameters, includes the video ID
    const queryParams = tab.url.split("?")[1];
    // makes a URLSearchParam object out of the params string, so we can extract specific key/values
    const urlParams = new URLSearchParams(queryParams);
    const videoId = urlParams.get("v");

    // send message wit extracted video ID ("v") from URLSP object
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId,
    });
  }
});

chrome.runtime.onMessage.addListener((req, sender, res) => {
  // console.log("background onMessage handler");
  const { type, time, videoId } = req;
  switch (type) {
    case "STAMP":
      // console.log('type = stamp');
      makeNewStamp(videoId, time).then((data) => {
        res("response from add stamp background");
      });
      break;
    case "GET":
      // console.log('type = get');
      getAllStamps(videoId).then((data) => {
        res(data);
      });
      break;
    case "DELETE":
      // console.log('type = delete');
      deleteStamp(videoId, time).then((data) => {
        res(data);
      });
    default:
      break;
  }
  // console.log('end of onMessage from background');

  // we have to return either True, or a Promise from the event listener to keep the message port open, or the send response "res" callback above loses is scope, and we end up with undefined as the return in the script that called this worker
  return true;
});

// function to get all stamps for the provided video ID
async function getAllStamps(videoId) {
  // console.log("in getAllStamps");
  return new Promise((resolve) => {
    chrome.storage.sync.get([videoId], (obj) => {
      resolve(obj[videoId] ? JSON.parse(obj[videoId]) : {});
    });
  });
}

// function to add a new stamp to the storage for the provided video ID
async function makeNewStamp(videoId, time) {
  // console.log('in makeNewStamp');
  const newStamp = {
    time: time,
    desc: `${formatTime(time)}`,
  };
  const currStamps = await getAllStamps(videoId);
  const jsonStamps = await JSON.stringify({
    ...currStamps,
    [newStamp.time]: newStamp,
  });
  chrome.storage.sync.set({
    [videoId]: jsonStamps,
  });
  return currStamps;
}

// function to delete stamp from storage for the provided video ID and time
async function deleteStamp(videoId, time) {
  // console.log('in deleteStamp');
  const currStamps = await getAllStamps(videoId);
  delete currStamps[[time]];
  const jsonStamps = await JSON.stringify(currStamps);
  chrome.storage.sync.set({ [videoId]: jsonStamps });

  return currStamps;
}

// function to format timestamp times
function formatTime(seconds) {
  let date = new Date(0);
  date.setSeconds(seconds);

  return date.toISOString().substring(11, 19);
}

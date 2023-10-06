console.log('background');
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    console.log("onUpdated");
    console.log(tabId);
    console.log(tab);
    // all youtube videos have a /watch substring, so this lets us activate only if we are watching
    if (tab.url && tab.url.includes("youtube.com/watch")){
        // get the part of url after ?, which is the parameters, includes the video ID
        const queryParams = tab.url.split("?")[1]
        console.log(queryParams);
        // makes a URLSearchParam object out of the params string, so we can extract specific key/values
        const urlParams = new URLSearchParams(queryParams)
        console.log(urlParams);
        const videoId = urlParams.get("v")

        // send message wit extracted video ID ("v") from URLSP object
        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId,
        });
    }
});

chrome.runtime.onMessage.addListener((req, sender, res) => {
    console.log("background onMessage");
    console.log(res);
    const { type, time, videoId } = req;
    switch (type) {
        case "STAMP":
            console.log('type = stamp');
            makeNewStamp(videoId, time).then((data) => {
                res('response from add stamp background')
            });
            console.log("Stamp Added")
            break;
        case "GET":
            console.log('type = get');
            // getAllStamps(videoId).then()
            // response = JSON.stringify(currStamps)
            // console.log(currStamps);
            // console.log(response);

            getAllStamps(videoId).then((data) => {
                res(data)
            });
            break;
        case "PLAY":
            console.log('type = play');
            console.log(time);
            ytStream.currentTime = time;
            break;
        case "DELETE":
            console.log('type = delete');
            deleteStamp(videoId, time).then((data) => {
                res(data)
            })
        default:
            break;
    }
    console.log('end of onMessage from background');
    return true
});

async function getAllStamps(videoId) {
    console.log("in getAllStamps");
    // const jsonStamps = await chrome.storage.sync.get([videoId])
    // const currStamps = JSON.parse(jsonStamps[videoId])
    // console.log(currStamps);
    // return currStamps
    return new Promise((resolve) => {
        chrome.storage.sync.get([videoId], (obj) => {
            resolve(obj[videoId] ? JSON.parse(obj[videoId]) : {})
        });
    });
};

async function makeNewStamp(videoId, time) {
    const newStamp = {
        time: time,
        desc: `${formatTime(time)}`
    };

    const currStamps = await getAllStamps(videoId);

    console.log(newStamp);
    console.log(currStamps);
    console.log(videoId);
    const jsonStamps = await JSON.stringify({...currStamps, [newStamp.time] : newStamp});
    console.log(jsonStamps);
    
    chrome.storage.sync.set({
        [videoId]: jsonStamps
    });
    return currStamps
}

async function deleteStamp(videoId, time) {
    console.log(time);
    console.log(videoId);

    const currStamps = await getAllStamps(videoId);
    console.log(currStamps);
    
    delete currStamps[[time]]
    console.log(currStamps);

    const jsonStamps = await JSON.stringify(currStamps);
    console.log(jsonStamps);

    chrome.storage.sync.set({[videoId]: jsonStamps})
    
    return currStamps
};

function formatTime(seconds) {
    let date = new Date(0);
    date.setSeconds(seconds);

    return date.toISOString().substring(11, 19);
};
  
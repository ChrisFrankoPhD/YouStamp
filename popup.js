import getCurrentTab from "./utils.js";

// adding a new bookmark row to the popup
const addNewStamp = (stampsHolder, stamp) => {
    const stampDescription = document.createElement("div");
    const stampComponent = document.createElement("div");
    const mediaParent = document.createElement("div");

    stampDescription.textContent = stamp.desc;
    stampDescription.className = "stamp-desc";

    mediaParent.className = "stamp-controls";

    stampComponent.id = `stamp-${stamp.time}`
    stampComponent.className = "stamp"
    stampComponent.setAttribute("timestamp", stamp.time)

    
    setStampAttributes("play", onPlay, mediaParent, stamp.time)
    setStampAttributes("delete", onDelete, mediaParent, stamp.time)

    stampComponent.appendChild(stampDescription);
    stampComponent.appendChild(mediaParent);
    stampsHolder.appendChild(stampComponent);
};

const renderStamps = (currStamps, videoId) => {
    console.log('render stamps');
    const stampsHolder = document.getElementById("stamps");
    stampsHolder.setAttribute("videoId", videoId);
    
    stampsHolder.innerHTML = ""
    if (Object.keys(currStamps).length > 0) {
        console.log('currStamp > 0');
        let sortStamps = [];
        for (let time in currStamps) {
            sortStamps.push(currStamps[time])
        }
        console.log(sortStamps);
        sortStamps = sortStamps.sort((a, b) => a.time - b.time);
        console.log(sortStamps);
        sortStamps.map((stamp) => {
            addNewStamp(stampsHolder, stamp)
        });
    } else {
        stampsHolder.innerHTML = '<i class="row">No Stamps for this video</i>';
    }
};

const onPlay = async e => {
    console.log("onPlay");
    const stampTime = e.target.getAttribute("timestamp");
    const activeTab = await getCurrentTab();
    console.log(stampTime);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        time: stampTime
    })
};

const onDelete = async e => {
    const time = e.target.getAttribute("timestamp");
    const videoId = document.getElementById("stamps").getAttribute("videoId")

    const req = {
        type: 'DELETE',
        videoId,
        time
    }
    const response = await chrome.runtime.sendMessage(req)
    console.log(response);

    const stampToDelete = document.getElementById(`stamp-${time}`)
    stampToDelete.remove()

    // console.log(response);
    // const newStamps = JSON.parse(response);
    // console.log(newStamps);
    // renderStamps(newStamps);
};

const setStampAttributes =  (type, eventListener, mediaParent, stampTime) => {
    const mediaBtn = document.createElement("button");
    const mediaIcon = document.createElement("i");
    mediaBtn.title = type;
    mediaBtn.addEventListener("click", eventListener);
    mediaBtn.setAttribute("timestamp", stampTime);
    mediaIcon.setAttribute("timestamp", stampTime);
    if (type === "play") {
        mediaBtn.className = "play-btn";
        mediaIcon.className = "fa-solid fa-play";
        // mediaBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
    } else {
        mediaBtn.className = "del-btn";
        mediaIcon.className = "fa-solid fa-trash";
        // mediaBtn.innerHTML = '<i class="fa-solid fa-trash"></i>'
    }
    mediaParent.appendChild(mediaBtn);
    mediaBtn.appendChild(mediaIcon);
};

// this gets called when the DOM is loaded, 
document.addEventListener("DOMContentLoaded", async () => {
    console.log('popup: DOMContentLoaded');
    // get the current tab with the imported utility
    const activeTab = await getCurrentTab();
    // get the video ID from the tab url, which is denoted by the "v" key always for YT
    const queryParams = activeTab.url.split("?")[1];
    const urlParams = new URLSearchParams(queryParams);
    const videoId = urlParams.get("v");
    console.log(videoId);
    // confirm we are indeed on a youtube video page
    if (activeTab.url.includes("youtube.com/watch") && videoId) {
        // if so, load the previously made stamps for the current video from chrome storage
        const currStamps = await getCurrentStamps(videoId)
        console.log(currStamps);
        renderStamps(currStamps, videoId)
    } else {
        // if not a YT page, change the HTML to show a simple message
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">Not a YouTube video page</div>'
    }
});

async function getCurrentStamps(videoId) {
    console.log(`popup: getCurrentStamps for ${videoId}`);
    const req = {
        type: "GET",
        videoId
    }

    // const currStamps = await chrome.runtime.sendMessage((req));
    // console.log(currStamps);

    const currStamps = await sendMessagePromise(req)

    console.log(currStamps);
    return currStamps;
}

function sendMessagePromise(req) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage((req), response => {
            if (response) {
                resolve(response);
            } else {
                reject("no response recieved");
            };
        });
    });
};
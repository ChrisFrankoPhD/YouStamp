(() => {
    let ytRightControls, ytStream;
    let currentVideo = "";
    let currentVideoStamps = []

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoID } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        }
    });

    function getAllStamps() {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [])
            });
        });
    };

    async function newVideoLoaded() {
        console.log("new video loaded");
        currentVideoStamps = await getAllStamps();

        if (!document.getElementsByClassName("stamp-btn")[0]) {
            const stampBtn = document.createElement("img");

            stampBtn.src = chrome.runtime.getURL("../assets/stampBtn.PNG");
            stampBtn.className = "ytp-button " + "stamp-btn";
            stampBtn.title = "Save current timestamp";

            ytRightControls = document.getElementsByClassName("ytp-right-controls")[0];
            ytStream = document.getElementsByClassName("video-stream")[0];

            ytRightControls.prepend(stampBtn); 
            // stampBtn.addEventListener("click" )
            stampBtn.addEventListener("click", addNewStampHandler);
        }
    }

    async function addNewStampHandler() {
        const currentTime = ytStream.currentTime;
        const newStamp = {
            time: currentTime,
            desc: `Stamp @ ${formatTime(currentTime)}`
        };

        currentVideoStamps = await getAllStamps();

        console.log(newStamp);
        console.log(currentVideoStamps);

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoStamps, newStamp].sort((a, b) => a.time - b.time))
        });
    }


    newVideoLoaded();
})();

function formatTime(seconds) {
    let date = new Date(0);
    date.setSeconds(seconds);

    return date.toISOString().substring(11, 19);
};


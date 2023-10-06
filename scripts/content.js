(() => {
    let ytRightControls, ytStream, currVideoId;

    chrome.runtime.onMessage.addListener((req, sender, res) => {
        console.log("content onMessage");
        const { type, videoId, time } = req;
        switch (type) {
            case "NEW":
                console.log('type = new');
                currVideoId = videoId
                newVideoLoaded().then(() => {res("success")})
                break;
            case "PLAY":
                console.log('type = play');
                console.log(time);
                try {
                    ytStream.currentTime = time;
                    console.log(`ytStream.currentTime set to ${time}`);
                } catch (error) {
                    console.error(`error setting YT steam time: ${error.message}`);
                }
                break;

            default:
                break;
        }
        return true
    });

    async function newVideoLoaded() {
        console.log("new video loaded");
        try {
            if (!document.getElementsByClassName("stamp-btn")[0]) {
                console.log('document has no stamp button');
                const stampBtn = document.createElement("img");
    
                stampBtn.src = chrome.runtime.getURL("../assets/stampBtn.PNG");
                stampBtn.className = "ytp-button " + "stamp-btn";
                stampBtn.title = "Save current timestamp";
    
                ytRightControls = document.getElementsByClassName("ytp-right-controls")[0];
                ytStream = document.getElementsByClassName("video-stream")[0];
    
                ytRightControls.prepend(stampBtn); 
                // stampBtn.addEventListener("click" )
                stampBtn.addEventListener("click", addNewStampHandler);
            } else {
                console.log('document already has a stamp button');
            }
        } catch (error) {
            console.error(`error in newVideoLoaded: ${error.message}`);
        }
        console.log("newVideoLoaded finished successfully");        
    } 

    async function addNewStampHandler() {
        console.log("stamp Clicked");
        const req = {
            type: "STAMP",
            time: ytStream.currentTime,
            videoId: currVideoId
        };
        const currStamps = await sendMessagePromise(req)
        console.log(currStamps);
    }

    newVideoLoaded();
})();

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


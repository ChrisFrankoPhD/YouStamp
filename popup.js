import getCurrentTab from "./utils.js";

// adding a new bookmark row to the popup
const addNewBookmark = () => {};

const viewStamps = (currStamps=[]) => {
    const stampsElement = document.getElementById("stamps");
    stampsElement.innerHTML = ""
    if (currStamps.length > 0) {
        currStamps.map((stamp) => {
            addNewStamp(stampsElement, stamp)
        });
    } else {
        stampsElement.innerHTML = '<i class="row">No Stamps for this video</i>';
    }
};

const onPlay = e => {};

const onDelete = e => {};

const setBookmarkAttributes =  () => {};

// this gets called when the DOM is loaded, 
document.addEventListener("DOMContentLoaded", async () => {
    // get the current tab with the imported utility
    const activeTab = await getCurrentTab();
    // get the video ID from the tab url, which is denoted by the "v" key always for YT
    const queryParams = activeTab.url.split("?")[1];
    const urlParams = new URLSearchParams(queryParams);
    const currVidId = urlParams.get("v");
    // confirm we are indeed on a youtube video page
    if (activeTab.url.includes("youtube.com/watch") && currVidId) {
        // if so, load the previously made stamps for the current video from chrome storage
        chrome.storage.sync.get([currVidId], (data) => {
            const currVidStamps = data[currVidId] ? JSON.parse(data[currVidId]) : [];

            viewStamps(currVidStamps)
            
        })
    } else {
        // if not a YT page, change the HTML to show a simple message
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">Not a YouTube video page</div>'
    }
});

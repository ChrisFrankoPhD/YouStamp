console.log('background');
chrome.tabs.onUpdated.addListener((tabId, tab) => {
    // all youtube videos have a /watch substring, so this lets us activate only if we are watching
    if (tab.url && tab.url.includes("youtube.com/watch")){
        // get the part of url after ?, which is the parameters, includes the video ID
        const queryParams = tab.url.split("?")[1]
        // makes a URLSearchParam object out of the params string, so we can extract specific key/values
        const urlParams = new URLSearchParams(queryParams)
        console.log(urlParams);
        // send message wit extracted video ID ("v") from URLSP object
        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParams.get("v")
        });
    }
});
  
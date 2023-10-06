console.log('background');
chrome.tabs.onUpdated.addListener((tabId, tab) => {
    // all youtube videos have a /watch substring, so this lets us activate only if we are watching
    if (tab.url && tab.url.includes("youtube.com/watch")){
        const queryParams = tab.url.split("?")[1]
        const urlParams = new URLSearchParams(queryParams)
        console.log(urlParams);

        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParams.get("v")
        });
    }
});
  
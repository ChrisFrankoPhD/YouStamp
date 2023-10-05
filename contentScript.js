chrome.tabs.onUpdated.addListener((tabId, tab) => {
    // all youtube videos have a /watch substring, so this lets us actate only if we are watching
    if (tab.url && tab.url.includes("youtube.com/watch"))
})
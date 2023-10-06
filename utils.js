export default async function getCurrentTab() {
    console.log('get current tab');
    // chrome.tabs calls chromes tabs API, allowing us to interact with the browsers tab system, these are options we can pass to the query to get the current window
    let queryOptions = { active: true, currentWindow: true };
    let tabs = await chrome.tabs.query(queryOptions);
    console.log(tabs);
    return tabs[0]
}
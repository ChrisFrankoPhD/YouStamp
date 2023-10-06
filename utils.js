export default async function getCurrentTab() {
    // chrome.tabs calls chromes tabs API, allowing us to interact with the browsers tab system, these are options we can pass to the query to get the current window
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab
}
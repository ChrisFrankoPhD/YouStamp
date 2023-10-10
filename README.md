# YouStamp: Saving Particular Timestamps on Youtube Videos

- I often find myself wanting to find a particular section of a youtube video when sharing it, or referencing something I previously saw, and thought this would be a good idea for a first chrome extension project.
- The extension has been submitted fo review to the chrome store, but please feel free to download and test the extension yourself by navigating to chrome://extensions/, turning on developer mode, and clicking the "Load Unpacked" button to upload the YouStamp directory. 
- This README will function as a repository for what I have learned about building extensions trhoughout the build process
- chrome has a nice getting started guide here: https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/

## Usage

- once the extension has been uploaded to chrome, navigate to any youtube video link hosted on the YouTube website (for example: https://www.youtube.com/watch?v=6Q6qHRHTTPg)
- The YouStamp time line button should appear in the video control buttons in the youtube player once the page has loaded:

    ![image](https://i.ibb.co/7KLwsCm/you-Stamp-Video-Player.png "YouStamp Video Player")

- click the timeline button to save a new Stamp at the current video time
- after you have saved a time stamp, you can open the extension pupup by clicking on the extensions toolbar in chrome, and either pinning the YouStamp extension icon, or opening it directly from the extensions dropdown

    ![image](https://i.ibb.co/qmnNCnJ/you-Stamp-Popup.png "YouStamp Popup")

- in the YouStamp popup, click the play button of the given extension to make the YouTube video immediately jump to the given timestamp
- You may also delete Stamps with the delete button
- each YouTube video page will remember the Stamps you have saved for that particular video, even after closing and reopening later

## Development

### Chrome Extension Architecture  

- the extension is separated into 4 main file types: the manifest file, the service-worker, the content scripts, and the popup files
    - The popup files build the actual extension interface. It includes the HTML and CSS for the extension popup, as well as the javascript files that will deal with the interactivity of the popup. 
    - The content script file is javascript that is injected into the page we are interacting with. Through this file we can add elements to the pages HTML, and take information from the page to be used by our extension.
    - The service worker is javascript that runs in the background, it responds to incoming events from both our popup and content scripts and performs tasks correspondingly. All of the actual work done by our extension should be here
    - The manifest file is JSON that gives the browser information about what the extension does, what it has access to, and what files it uses for what purposes
- so for example, a quick guide of he architecture for some this extension:
    - in this extension, the service-worker listens for when a chrome tab is updated, and when it is it checks the URL to see if the tab is a YouTube video, if it is then it sends a message to the content-script which calls a function to add the YouStamp button to the page HTML, including an event listener for that button. When the button is pressed, the content-script sends a request to the service-worker to add the timestamp to storage. 
    - We also see that when we open our popup, a call by popup.js is made to the service-worker to grab all Stamps from storage for the current YT video, and the popup builds the needed HTML to show the Stamps, if we click "play" on a stamp, a request is sent to the content-script to alter the page by setting the YT player's time to the time of the Stamp. 
    - If we click delete on one of the popup's Stamps, then a request is made to the service-worker to delete that stamp from storage, and we then rerender the popup HTML with the new set of Stamps
- we see in this way that each file type has its own responsibilities in the extension, and we want to make sure that the popup only deals with the interactivity of the popup, and does not try to directly access storage for example, and same with the content-script, we want it to deal with all things that have to do with interacting with the page, and if we need something on that page to access storage, we go through the service-worker running in the background to do so 
- as usual, we want to boil down large processes into single step actions that each component can deal with individually

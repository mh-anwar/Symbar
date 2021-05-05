console.log("Service Worker (a.k.a Background Script) is running SIR!");
var onOrOff = 1;
var states_of_buttons = {};
states_of_buttons['toolbar_state'] = onOrOff;

chrome.runtime.onInstalled.addListener((details) => {
    const currentVersion = chrome.runtime.getManifest().version
    const previousVersion = details.previousVersion
    const reason = details.reason

    console.log('Previous Version: ${previousVersion }')
    console.log('Current Version: ${currentVersion }')

    switch (reason) {
        case 'install':
            chrome.tabs.create({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
            //replace with tutorial
            break;
        case 'update':
            console.log('User has updated their extension.')
            chrome.tabs.create({ url: "https://github.com/mh-anwar/CopyThat/releases" })
            chrome.tabs.create({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
            //remove after t-(rick)-rolling eseer
            break;
        // case 'chrome_update':
        //wanna detect when chrome has updated? Yuse dat^
    }
    chrome.storage.sync.set(states_of_buttons, function () {
        console.log("On Install: state is set to 1")
    });
});

chrome.runtime.setUninstallURL("https://forms.gle/MC9oZ2kpMdz8w2Me8")

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request == "Toolbar State.") {
            sendResponse(onOrOff);
            onOrOff++;
            states_of_buttons['toolbar_state'] = onOrOff;
            chrome.storage.sync.set(states_of_buttons, function () {
                //console.log("Worker set toolbar_state to " + onOrOff);
            });
        }
        else if (request == "Onload - Toolbar State.") {
            states_of_buttons['toolbar_state'] = onOrOff;
            chrome.storage.sync.set(states_of_buttons, function () { });
        }
        else if (request == "Content Script - Toolbar State Changed.") {
            //states_of_buttons['toolbar_state'] = onOrOff;]
            sendResponse("message recieved")
            chrome.storage.sync.get(states_of_buttons, function () { });
        }
        else {
            sendResponse({ result: "error", message: `Invalid 'cmd'` });
        }

        return true;
    });

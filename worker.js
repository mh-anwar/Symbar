console.log("Service Worker (a.k.a Background Script) is running SIR!");
var onOrOff = 1;
var stateOfButton = {};
stateOfButton['buttonState'] = onOrOff;
chrome.runtime.onInstalled.addListener(() => {
    console.log('Add greeting page with tutorial here');
    chrome.storage.sync.set(stateOfButton, function () {
        // this called after the save
        console.log("On Install: state is set to 1")
    });
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        //if (sender) -- check sender
        console.log("test");
        if (request == "Toolbar State.") {
            sendResponse({ response: onOrOff });
            onOrOff++;
            stateOfButton['buttonState'] = onOrOff;
            chrome.storage.sync.set(stateOfButton, function () {
                // this called after the save
                console.log("worker set buttonState to " + onOrOff);
            });
        }
        if (request == "Onload - Toolbar State.") {
            sendResponse({ response: onOrOff });
            stateOfButton['buttonState'] = onOrOff;
            chrome.storage.sync.set(stateOfButton, function () {
                // this called after the save
                console.log("worker set buttonState to " + onOrOff);
            });
        }
        else {
            sendResponse({ result: "error", message: `Invalid 'cmd'` });
        }

        return true;
    });

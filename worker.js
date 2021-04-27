console.log("Service Worker (a.k.a Background Script) is running SIR!");
var onOrOff = 1;
var stateOfButton = {};
stateOfButton['buttonState'] = onOrOff;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Add greeting page with tutorial here');
    chrome.storage.sync.set(stateOfButton, function () {
        console.log("On Install: state is set to 1")
    });
});
chrome.runtime.setUninstallURL("https://forms.gle/MC9oZ2kpMdz8w2Me8")

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request == "Toolbar State.") {
            sendResponse({ response: onOrOff });
            onOrOff++;
            stateOfButton['buttonState'] = onOrOff;
            chrome.storage.sync.set(stateOfButton, function () {
                console.log("Worker set buttonState to " + onOrOff);
            });
        }
        if (request == "Onload - Toolbar State.") {
            stateOfButton['buttonState'] = onOrOff;
            chrome.storage.sync.set(stateOfButton, function () {
            });
        }
        else {
            sendResponse({ result: "error", message: `Invalid 'cmd'` });
        }

        return true;
    });

console.log("Service Worker (a.k.a Background Script) is running SIR!");
var onOrOff = 1;
var states_of_buttons = {};
states_of_buttons['toolbar_state'] = onOrOff;

chrome.runtime.onInstalled.addListener(() => {
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

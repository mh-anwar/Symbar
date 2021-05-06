console.log("Service Worker (a.k.a Background Script) is running SIR!");
var onOrOff = 1;
var states_of_buttons = {};
states_of_buttons['toolbar_state'] = onOrOff;

chrome.runtime.onInstalled.addListener((details) => {
    const reason = details.reason
    switch (reason) {
        case 'install':
            chrome.tabs.create({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
            //replace with tutorial
            break;
        case 'update':
            //chrome.tabs.create({ url: "https://github.com/mh-anwar/CopyThat/releases" })
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
        //sender parameter is MANDATORY
        if (request == "toolbar_state") {
            sendResponse(onOrOff);
            onOrOff++;
            states_of_buttons['toolbar_state'] = onOrOff;
            chrome.storage.sync.set(states_of_buttons, function () { });
        }
        if (request == "popup_loaded_send_toolbar_state") {
            console.log("Sending stuff to you know who")
            sendResponse("saving state")
            states_of_buttons['toolbar_state'] = onOrOff;
            chrome.storage.sync.set(states_of_buttons, function () { });
        }
        else if (request == "toolbar_state_changed") {
            sendResponse("message recieved")
            chrome.storage.sync.get(states_of_buttons, function () { });
        }
        else {
            sendResponse({ result: "error", message: `Invalid 'cmd'` });
        }
        return true;
    });

/*
https://developer.chrome.com/docs/extensions/reference/commands/
chrome.commands.onCommand.addListener(function (command) {
if (command === "toggle-toolbar") {
    console.log('Command:');

}
console.log('Command:');
"commands": {
    "toggle-toolbar": {
      "suggested_key": {
        "default": "Ctrl+Shift+O",
        "windows": "Ctrl+Shift+O"
      },
      "description": "Toggle feature foo",
      "global": true
    }
  }
});
*/
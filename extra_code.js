
let toolbar = document.getElementById('open_toolbar');
//Code that sets the toolbar opening button to either Close or Open (etc)
function toolbar_button_text_modifier() {
    chrome.storage.sync.get('toolbar_state', function (data) {
        toolbar_state = data['toolbar_state'];
        if (toolbar_state % 2 == 1) {
            toolbar.textContent = 'Close Toolbar';
        }
        if (toolbar_state % 2 == 0) {
            toolbar.textContent = 'Open Toolbar (CTRL+Q)';
        }
    });
}
window.onload = function () {
    toolbar_button_text_modifier();
};
toolbar.addEventListener('click', toolbar_state_notifier);
function toolbar_state_notifier() {
    chrome.storage.sync.get('toolbar_state', function (data) {
        chrome.storage.sync.set({ 'toolbar_state': data.toolbar_state += 1 })
        toolbar_button_text_modifier();
    });
}

//worker
console.log('Service Worker (a.k.a Background Script) is running SIR!');

chrome.runtime.onInstalled.addListener((details) => {
    const reason = details.reason
    switch (reason) {
        case 'install':
            chrome.tabs.create({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
            //replace with tutorial
            break;
        case 'update':
            //chrome.tabs.create({ url: 'https://github.com/mh-anwar/CopyThat/releases' })
            //add once rollout occurs
            break;
        // case 'chrome_update':
        //^^^^^wanna detect when chrome has updated? Yuse dat^
    }
    var states_of_buttons = {
        'toolbar_state': 0
    };
    chrome.storage.sync.set(states_of_buttons);
    //Above we set the state of the toolbar to 0 (on install, that is)
});
chrome.runtime.setUninstallURL('https://forms.gle/MC9oZ2kpMdz8w2Me8')

chrome.storage.onChanged.addListener((changes, area) => {
    console.log(area)
    console.log(changes)
    if (area === 'sync' && changes.options?.newValue) {
        const debugMode = Boolean(changes.options.newValue.debug);
        console.log('enable debug mode?', debugMode);
        setDebugMode(debugMode);
    }
});

function toolbar_button_text_modifier() {
    chrome.storage.sync.get('toolbar_state', function (data) {
        toolbar_state = data['toolbar_state'];
        if (toolbar_state % 2 == 0) {
            toolbar.textContent = 'Close Toolbar';
        }
        if (toolbar_state % 2 == 1) {
            toolbar.textContent = 'Open Toolbar (CTRL+Q)';
        }
    });
}
/*
window.onload = function () {
  toolbar_button_text_modifier()
};
*/
//Code to send message from popup to content to open toolbar #WIP
toolbar.addEventListener('click', worker_messenger);
function worker_messenger() {
    chrome.storage.sync.get('toolbar_state', function (data) {
        chrome.storage.sync.set({ 'toolbar_state': data.toolbar_state += 1 })
        toolbar_state = data['toolbar_state'];
        toolbar_state += 1
        toolbar_button_text_modifier()
    });
};

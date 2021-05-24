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
            //Add once extension rolls out
            break;
        //case 'chrome_update':
        //^^^Yuse that case to detect when a user has updated their chrome browser
    }
    var states_of_buttons = {
        'toolbar_state': 0
    };
    chrome.storage.sync.set(states_of_buttons);
    //Above we set the state of the toolbar to 0 (on install, that is)
    chrome.storage.sync.set({ 'toolbar_height': 20 })
    //Above we set the toolbar height
});

chrome.runtime.setUninstallURL('https://forms.gle/MC9oZ2kpMdz8w2Me8');

//Code for toolbar to open with CTRL + Q (currently, does not work!!)
//https://developer.chrome.com/docs/extensions/reference/commands/
/*
chrome.commands.onCommand.addListener(function (command) {
if (command === 'toggle-toolbar') {
    console.log('Command:');

}
console.log('Command:');
'commands': {
    'toggle-toolbar': {
      'suggested_key': {
        'default': 'Ctrl+Shift+O',
        'windows': 'Ctrl+Shift+O'
      },
      'description': 'Toggle feature foo',
      'global': true
    }
  }
});
*/
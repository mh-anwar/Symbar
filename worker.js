console.log('Service Worker (a.k.a Background Script) is running SIR!');

chrome.runtime.onInstalled.addListener((details) => {
  const reason = details.reason;
  switch (reason) {
    case 'install':
      chrome.tabs.create({ url: 'https://google.com' });
      //replace with tutorial
      chrome.storage.sync.set({ toolbar_height: 20 });
      //Above we set the inital toolbar height
      chrome.storage.sync.set({ recently_used: [] });
      //Settings the inital state of recently used buttons
      break;
    case 'update':
      //chrome.tabs.create({ url: 'https://github.com/mh-anwar/CopyThat/releases' })
      //Add once extension rolls out
      //TODO Add greeting page with warning to reload all pages
      break;
    //case 'chrome_update':
    //^^^Yuse that case to detect when a user has updated their chrome browser
  }
  var states_of_buttons = {
    toolbar_state: 0,
  };
  chrome.storage.sync.set(states_of_buttons);
  //Above we set the state of the toolbar to 0 (on install, that is)
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

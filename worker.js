chrome.runtime.onInstalled.addListener((details) => {
  const reason = details.reason;
  switch (reason) {
    case 'install':
      chrome.tabs.create({
        url: './welcome/welcome.html',
      });

      chrome.storage.sync.set({ toolbar_height: 20 });
      //Above we set the inital toolbar height
      chrome.storage.sync.set({ recently_used: [] });
      //Settings the inital state of recently used buttons
      break;
    case 'update':
      //chrome.tabs.create({ url: 'https://github.com/mh-anwar/CopyThat/releases' })
      //Add once extension rolls out
      break;
    //case 'chrome_update': use to detect browser update
  }
  var states_of_buttons = {
    toolbar_state: 0,
  };
  chrome.storage.sync.set(states_of_buttons);
  //Above we set the state of the toolbar to 0 (on install, that is)
});

chrome.runtime.setUninstallURL('https://forms.gle/mxBWcvDvmx1zgqeaA');

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
chrome.action.onClicked.addListener((tab_info) => {
  content_script_messenger(tab_info);
});

function open_toolbar(response, tabs_info) {
  if (response.state === 0) {
    chrome.tabs.sendMessage(tabs_info.id, 'toolbar_on');
  } else if (response.state === 1) {
    chrome.tabs.sendMessage(tabs_info.id, 'toolbar_off');
  }
}
async function content_script_messenger(tab_info) {
  //Make sure that this is not running on chrome native tabs
  if (tab_info.url.match('^chrome:') === null) {
    //First get the state of the toolbar, then open/close it
    chrome.tabs.sendMessage(tab_info.id, 'state_of_toolbar', (response) => {
      open_toolbar(response, tab_info);
    });
  }
}

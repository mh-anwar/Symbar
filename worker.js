chrome.runtime.onInstalled.addListener((details) => {
  const reason = details.reason;
  switch (reason) {
    case 'install':
      chrome.tabs.create({
        url: './welcome/welcome.html',
      });
      chrome.storage.sync.set({
        toolbar_height: 25,
        recently_used: [],
        mode: 'dark',
        cust_btns: [],
        popup_enabled: false,
        toolbar_state: 0,
      });
      break;
    case 'update':
      break;
  }
});

chrome.runtime.setUninstallURL('https://forms.gle/mxBWcvDvmx1zgqeaA');

chrome.action.onClicked.addListener((tab_info) => {
  content_script_messenger(tab_info);
});

function open_toolbar(response, tabs_info) {
  if (!response) return;
  if (response.state === 0) {
    chrome.tabs.sendMessage(tabs_info.id, 'toolbar_on');
  } else if (response.state === 1) {
    chrome.tabs.sendMessage(tabs_info.id, 'toolbar_off');
  }
}

async function content_script_messenger(tab_info) {
  if (!tab_info.url || /^(chrome|chrome-extension|edge|about):/.test(tab_info.url)) return;
  chrome.tabs.sendMessage(tab_info.id, 'state_of_toolbar', (response) => {
    if (chrome.runtime.lastError) return;
    open_toolbar(response, tab_info);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'open-options') {
    chrome.runtime.openOptionsPage();
  } else if (message === 'change-mode') {
    chrome.storage.sync.get('mode', function (data) {
      const newMode = data.mode === 'dark' ? 'light' : 'dark';
      chrome.storage.sync.set({ mode: newMode });
    });
  }
});

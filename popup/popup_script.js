//Remember https://imgflip.com/i/57j1ib
/*
Please remember to use proper formatting:
ID's and names should be using 'snake_case' 
Classes should be using 'BEM'
Add a semicolon to the appropriate lines
Use single quotes (instead of double quotes) where necessary
*/
let toolbar = document.getElementById('open_toolbar');
let select_form = document.getElementById('select_form');
//Checks the state of the toolbar and changes the text content of the Toolbar Button
window.onload = function () {
  chrome.tabs.query({ active: true, currentWindow: true }, msger);
  function msger(tabs) {
    let content_script_message = 'state_of_toolbar';
    chrome.tabs.sendMessage(tabs[0].id, content_script_message, function (response) {
      if (typeof (response) != 'undefined' && response != null) {
        if (response.state === 1) {
          toolbar.textContent = 'Close Toolbar';
        }
        if (response.state === 0) {
          toolbar.textContent = 'Open Toolbar (CTRL+Q)';
        }
      }
    });
  }
};
//Code to send message from popup to content to open toolbar #WIP
toolbar.addEventListener('click', toolbar_state_receiver);
function toolbar_state_receiver() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let message = "state_of_toolbar"
    //Ask to check if the toolbar is opened or closed
    chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
      //Calls the function that opens or closes the toolbar
      toolbar_opener(response.state, tabs);
    });
  });
};

function toolbar_opener(state, tabs) {
  if (state === 0) {
    let content_script_message = 'toolbar_on';
    chrome.tabs.sendMessage(tabs[0].id, content_script_message);
    toolbar.textContent = 'Close Toolbar';
  } else if (state === 1) {
    let content_script_message = 'toolbar_off';
    chrome.tabs.sendMessage(tabs[0].id, content_script_message);
    toolbar.textContent = 'Open Toolbar (CTRL+Q)';
  }
}
//Code for the dropdown to show the copy buttons
select_form.addEventListener('change', function () {
  var buttons_toggle = document.querySelector('.buttons_toggle'),
    target = document.getElementById(this.value);
  if (buttons_toggle !== null) {
    buttons_toggle.className = 'button__list--div';
  }
  if (target !== null) {
    target.className = 'buttons_toggle';
  }
});

//Code to open the options page (through button in popup)
document.querySelector('#options_button').addEventListener('click', function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('../settingsPage/settingsBasic.html'));
  }
});

//Code for the Copy Function (for the copy buttons)
var copyButtonClass = document.getElementsByClassName('button--copy');

for (var i = 0; i < copyButtonClass.length; i++) {
  copyButtonClass[i].addEventListener('click', function (e) {
    var text_to_copy = e.target.textContent;
    navigator.clipboard.writeText(text_to_copy);
  });
}

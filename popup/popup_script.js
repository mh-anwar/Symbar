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
let options_button = document.getElementById('options_button');
let copyButtonClass = document.getElementsByClassName('button--copy');

//Sends message to the tab then calls a function to run
async function content_script_messenger(function_to_run) {
  let tabs_info = await get_current_tab();
  console.log(tabs_info);
  let content_script_message = 'state_of_toolbar';
  chrome.tabs.sendMessage(
    tabs_info.id,
    content_script_message,
    function (response) {
      function_to_run(response, tabs_info);
    }
  );
}
//Gets tab data
async function get_current_tab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

//Checks the state of the toolbar and changes the text content of the Toolbar Button
function toolbar_button_textcontent(response, tabs_info) {
  if (typeof response != 'undefined' && response != null) {
    if (response.state === 1) {
      toolbar.textContent = 'Close Toolbar';
    }
    if (response.state === 0) {
      toolbar.textContent = 'Open Toolbar (CTRL+Q)';
    }
  }
}

//Code to send message from popup to content to open toolbar
function toolbar_opener(response, tabs_info) {
  let content_script_message;
  if (response.state === 0) {
    content_script_message = 'toolbar_on';
    chrome.tabs.sendMessage(tabs_info.id, content_script_message);
    toolbar.textContent = 'Close Toolbar';
  } else if (response.state === 1) {
    content_script_message = 'toolbar_off';
    chrome.tabs.sendMessage(tabs_info.id, content_script_message);
    toolbar.textContent = 'Open Toolbar (CTRL+Q)';
  }
}

//Code for the dropdown to show the copy buttons
function show_copy_buttons() {
  let buttons_toggle = document.querySelector('.buttons_toggle'),
    target = document.getElementById(this.value);
  if (buttons_toggle !== null) {
    buttons_toggle.className = 'button__list--div';
  }
  if (target !== null) {
    target.className = 'buttons_toggle';
  }
}

function open_options() {
  //Code to open the options page (through button in popup)
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('../settingsPage/settingsBasic.html'));
  }
}

function attach_copy_buttons() {
  //Code for the Copy Function (for the copy buttons)
  for (let i = 0; i < copyButtonClass.length; i++) {
    copyButtonClass[i].addEventListener('click', function (event) {
      let text_to_copy = event.target.textContent;
      navigator.clipboard.writeText(text_to_copy);
    });
  }
}

function execute_popup_funcs() {
  content_script_messenger(toolbar_button_textcontent);
  select_form.addEventListener('change', show_copy_buttons);
  attach_copy_buttons();
  toolbar.addEventListener('click', () =>
    content_script_messenger(toolbar_opener)
  );
  options_button.addEventListener('click', open_options);
}

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    execute_popup_funcs();
  } else if (event.target.readyState === 'complete') {
    execute_popup_funcs();
  }
});

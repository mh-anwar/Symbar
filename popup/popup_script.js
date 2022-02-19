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
let copy_button_class = document.getElementsByClassName('button--copy');
let recent_button_container = document.getElementById(
  'recent_buttons_container'
);
//Sends message to the tab then calls a function to run
async function content_script_messenger(function_to_run) {
  let tabs_info = await get_current_tab();
  let content_script_message = 'state_of_toolbar';
  if (tabs_info.url.match('^chrome:') === null) {
    chrome.tabs.sendMessage(
      tabs_info.id,
      content_script_message,
      function (response) {
        if (response !== undefined) {
          function_to_run(response, tabs_info);
        }
      }
    );
  }
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
  let toggled_div = document.querySelector('.toggled_div'),
    target = document.getElementById(this.value);
  if (toggled_div !== null) {
    toggled_div.className = 'button__list--div';
    recent_button_container.style.display = 'flex';
  }
  if (target !== null) {
    target.className = 'toggled_div';
    recent_button_container.style.display = 'none';
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
  for (let i = 0; i < copy_button_class.length; i++) {
    copy_button_class[i].addEventListener('click', function (event) {
      let text_to_copy = event.target.textContent;
      navigator.clipboard.writeText(text_to_copy);
    });
  }
}

function populate_dropdowns() {
  let language_buttons = {
    Math: ['&#969;', '&#8486'],
    French: ['breh', 'to'],
    Spanish: ['t'],
    Greek: ['&#880;', '&#881;', '&#882;'],
  };
  for (let language in language_buttons) {
    document.getElementById(language).innerHTML = language_buttons[
      language
    ].map((text) => `<button class="button button--copy">${text}</button>`);
  }
}

function show_recently_used() {
  let recently_used = ['#34335;'];
  document.getElementById('recently_used').innerHTML = recently_used.map(
    (text) => `<button class="button button--copy">${text}</button>`
  );
}

function execute_popup_funcs() {
  content_script_messenger(toolbar_button_textcontent);
  select_form.addEventListener('change', show_copy_buttons);
  attach_copy_buttons();
  toolbar.addEventListener('click', () =>
    content_script_messenger(toolbar_opener)
  );
  options_button.addEventListener('click', open_options);
  populate_dropdowns();
  show_recently_used();
}

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    execute_popup_funcs();
  } else if (event.target.readyState === 'complete') {
    execute_popup_funcs();
  }
});

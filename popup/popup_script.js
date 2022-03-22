/*
Remember to use proper formatting:
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
var language_buttons = {
  Math: [
    '&#43;',
    '&#45;',
    '&#0215;',
    '&#0247;',
    '&#37;',
    '&#0137;',
    '&#40;',
    '&#41;',
    '&#241;',
    '&#47;',
    '&#0188;',
    '&#0189;',
    '&#0190;',
    '&#46;',
    '&#240;',
    '&#61;',
    '&#247;',
    '&#60;',
    '&#62;',
    '&#242;',
    '&#243;',
    '&#251;',
    '&#252;',
    '&#0185;',
    '&#0178;',
    '&#0179;',
    '&#227;',
    '&#248;',
    '&#45;',
    '&#236;',
    '&#230;',
    '&#228;',
    '&#239;',
    '&#244;',
    '&#245;',
  ],
  French: [
    '&#0192;',
    '&#0224;',
    '&#0193;',
    '&#0225;',
    '&#0194;',
    '&#0226;',
    '&#0195;',
    '&#0227;',
    '&#0196;',
    '&#0228;',
    '&#0199;',
    '&#0231;',
    '&#0200;',
    '&#0232;',
    '&#0201;',
    '&#0233;',
    '&#0202;',
    '&#0234;',
    '&#0203;',
    '&#0235;',
    '&#0204;',
    '&#0236;',
    '&#0205;',
    '&#0237;',
    '&#0206;',
    '&#0238;',
    '&#0207;',
    '&#0239;',
    '&#165;',
    '&#164;',
    '&#0210;',
    '&#0242;',
    '&#0211;',
    '&#0243;',
    '&#0212;',
    '&#0244;',
    '&#0213;',
    '&#0245;',
    '&#0214;',
    '&#0246;',
    '&#0138;',
    '&#0154;',
    '&#0218;',
    '&#0249;',
    '&#0219;',
    '&#0250;',
    '&#0220;',
    '&#0251;',
    '&#0217;',
    '&#0252;',
    '&#0221;',
    '&#0253;',
    '&#0159;',
    '&#0255;',
    '&#0142;',
    '&#0158;',
  ],
  Greek: [
    '&#224;',
    '&#225;',
    '&#226;',
    '&#235;',
    '&#238;',
    '&#233;',
    '&#227;',
    '&#230;',
    '&#228;',
    '&#229;',
    '&#231;',
    '&#232;',
    '&#237;',
    '&#234;',
  ],
};
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
  let copy_button_class = document.getElementsByClassName('button--copy');
  //Code for the Copy Function (for the copy buttons)
  for (let i = 0; i < copy_button_class.length; i++) {
    copy_button_class[i].addEventListener('click', function (event) {
      let text_to_copy = event.target.textContent;
      navigator.clipboard.writeText(text_to_copy);
      chrome.storage.sync.get('recently_used', function (data) {
        console.log(data);
        data.recently_used.push(text_to_copy);
        console.log(data);
        chrome.storage.sync.set({ recently_used: data.recently_used });
        console.log(data);
      });
    });
  }
}

function populate_dropdowns() {
  for (let language in language_buttons) {
    document.getElementById(language).innerHTML += `<div>
          ${language_buttons[language]
            .map(
              (text) => `<button class="button button--copy">${text}</button>`
            )
            .join(' ')}
       </div>`;
  }
}

function show_recently_used() {
  chrome.storage.sync.get('recently_used', function (data) {
    document.getElementById('recently_used').innerHTML = data.recently_used
      .map((text) => `<button class="button button--copy">${text}</button>`)
      .join(' ');
  });
}

function set_dark_mode_var() {
  let root = document.querySelector(':root');
  var rs = getComputedStyle(root);
  root.style.setProperty('--back', '#000509');
  root.style.setProperty('--fore', '#0d1117');
  root.style.setProperty('--color', '#c2cad2');
}

function execute_popup_funcs() {
  content_script_messenger(toolbar_button_textcontent);
  select_form.addEventListener('change', show_copy_buttons);
  toolbar.addEventListener('click', () =>
    content_script_messenger(toolbar_opener)
  );
  options_button.addEventListener('click', open_options);
  populate_dropdowns();
  show_recently_used();
  attach_copy_buttons();
  chrome.storage.sync.get('mode', function (data) {
    if (data.mode == 'dark') {
      set_dark_mode_var();
      document.body.classList.add('dark-mode__page');
    }
  });
}

document.addEventListener('readystatechange', (event) => {
  if (event.target.readyState === 'interactive') {
    execute_popup_funcs();
  } else if (event.target.readyState === 'complete') {
    execute_popup_funcs();
  }
});

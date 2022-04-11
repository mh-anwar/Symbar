'use strict';
/*
Remember to use proper formatting:
ID's and names should be using 'snake_case' 
Classes should be using dashes, no underscores
Add a semicolon to the appropriate lines
Use single quotes (instead of double quotes) where necessary
*/
let toolbar = document.getElementById('open_toolbar');
let select_form = document.getElementById('select_form');
let options_button = document.getElementById('options_button');
let copy_button_class = document.getElementsByClassName('copy-button');
let recent_button_container = document.getElementById(
  'recent_buttons_container'
);
let autotype = false;
//Gets tab data
async function get_current_tab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

//Sends message to the tab then calls a function to run
async function content_script_messenger(function_to_run) {
  let tabs_info = await get_current_tab();
  let content_script_message = 'state_of_toolbar';
  //Make sure that this is not running on chrome native (?) tabs
  if (tabs_info.url.match('^chrome:') === null) {
    chrome.tabs.sendMessage(
      tabs_info.id,
      content_script_message,
      function (response) {
        if (response !== undefined) {
          //Critical line, this function could be two things
          //toolbar_button_textcontent or toolbar_opener
          function_to_run(response, tabs_info);
        }
      }
    );
  }
}
//Autotype
async function autotype_symbol(symbol) {
  let tabs_info = await get_current_tab();
  let message = { autotype: symbol };
  //Make sure that this is not running on chrome native (?) tabs
  if (tabs_info.url.match('^chrome:') === null) {
    chrome.tabs.sendMessage(tabs_info.id, message, function (response) {
      if (response !== undefined) {
        console.log('response');
      }
    });
  }
}
//Changes the text content of the Toolbar Button based on it's state
function toolbar_button_textcontent(response, tabs_info) {
  if (typeof response != 'undefined' && response != null) {
    if (response.state === 1) {
      toolbar.textContent = 'Close Toolbar';
    }
    if (response.state === 0) {
      toolbar.textContent = 'Open Toolbar';
    }
  }
}

//Send message from popup to content to open/close toolbar
function toolbar_opener(response, tabs_info) {
  let content_script_message;
  if (response.state === 0) {
    content_script_message = 'toolbar_on';
    chrome.tabs.sendMessage(tabs_info.id, content_script_message);
    toolbar.textContent = 'Close Toolbar';
  } else if (response.state === 1) {
    content_script_message = 'toolbar_off';
    chrome.tabs.sendMessage(tabs_info.id, content_script_message);
    toolbar.textContent = 'Open Toolbar';
  }
}

function show_copy_buttons() {
  let toggled_buttons = document.querySelector('.toggled-button-div'),
    target = document.getElementById(this.value);
  if (toggled_buttons !== null) {
    toggled_buttons.className = 'button-list';
    recent_button_container.style.display = 'flex';
  }
  if (target !== null) {
    target.className = 'toggled-button-div ';
    recent_button_container.style.display = 'none';
  }
}

//Options is the same as settings
function open_options() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('../settings/settings.html'));
  }
}
//TODO fix this function
function add_recently_used(symbol) {
  chrome.storage.sync.get('recently_used', function (data) {
    if (recently_used.length > 10) {
      recently_used[-1].remove();
    }
    data.recently_used.push(symbol);
    chrome.storage.sync.set({ recently_used: data.recently_used });
  });
}

function attach_copy_buttons() {
  const copy_btns = document.getElementsByClassName('copy-button');

  for (let i = 0; i < copy_btns.length; i++) {
    copy_btns[i].addEventListener('click', function (event) {
      let text_to_copy = event.target.textContent;
      navigator.clipboard.writeText(text_to_copy);
      add_recently_used(text_to_copy);
      show_snackbar();
      if (autotype === true) {
        console.log('autotyping');
        autotype_symbol(event.target.textContent);
        console.log('Just autotyped');
      }
    });
  }
}

function show_snackbar() {
  let snackbar = document.getElementById('button_snackbar');
  snackbar.className = 'show';
  setTimeout(function () {
    snackbar.className = snackbar.className.replace('show', '');
  }, 3000);
}

function populate_dropdowns() {
  fetch(chrome.runtime.getURL('./accents.json'))
    .then((response) => response.json())
    .then((data) => {
      let languages = data;
      for (let lang in languages) {
        document.getElementById(lang).innerHTML += `<div>
          ${languages[lang]
            .map((text) => `<button class="copy-button">${text}</button>`)
            .join(' ')}
       </div>`;
      }
    })
    .then(() => attach_copy_buttons());
}

function get_recently_used() {
  chrome.storage.sync.get('recently_used', show_recently_used);
}

function show_recently_used(data) {
  //Get recently used buttons and insert them into DOM
  document.getElementById('recently_used').innerHTML = data.recently_used
    .map((text) => `<button class="copy-button">${text}</button>`)
    .join(' ');
}

function set_dark_mode() {
  let root = document.querySelector(':root');
  root.style.setProperty('--back', '#000509');
  root.style.setProperty('--fore', '#0d1117');
  root.style.setProperty('--color', '#c2cad2');
}

function execute_popup_funcs() {
  content_script_messenger(toolbar_button_textcontent);
  toolbar.addEventListener('click', () =>
    content_script_messenger(toolbar_opener)
  );
  select_form.addEventListener('change', show_copy_buttons);
  options_button.addEventListener('click', open_options);
  populate_dropdowns();

  get_recently_used();
  chrome.storage.sync.get('mode', function (data) {
    if (data.mode == 'dark') {
      set_dark_mode();
      document.body.classList.add('dark-mode__page');
    }
  });
  chrome.storage.sync.get('autotype', function (data) {
    if (data.autotype === true) {
      autotype = true;
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

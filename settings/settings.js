'use-strict';
let mode_checkbox = document.getElementById('mode_checkbox');
let autotype_checkbox = document.getElementById('autotype_checkbox');
let toolbar_height_slider = document.getElementById('toolbar_height');
let toolbar_height_value_output = document.getElementById(
  'toolbar_height_value'
);
let cust_btn_cont = document.getElementById('cust_btn_ui');
let cust_btn_adder = document.getElementById('add_cust_btn');
let cust_btn_prev = document.getElementById('prev_cust_btn');
let cust_save_btn = document.getElementById('save_cust_btn');

//Set document theme/mode automatically
function set_mode(event) {
  let userSetMode = confirm('Changing modes will reload this page');
  if (userSetMode) {
    if (event.target.checked) {
      chrome.storage.sync.set({ mode: 'dark' });
    } else {
      chrome.storage.sync.set({ mode: 'light' });
    }
    window.location.reload();
  }
}

function set_toolbar_height() {
  //Sync toolbar height to storage and update HTML
  let toolbar_height_slider = document.getElementById('toolbar_height');
  let toolbar_height_value_output = document.getElementById(
    'toolbar_height_value'
  );
  chrome.storage.sync.set({ toolbar_height: toolbar_height_slider.value });
  toolbar_height_value_output.innerHTML = toolbar_height_slider.value + '% ';
}

function set_autotype(event) {
  if (event.target.checked) {
    chrome.storage.sync.set({ autotype: true });
  } else {
    chrome.storage.sync.set({ autotype: false });
  }
}

function open_tab(event) {
  /*In theory there is only one active-tab
  and only one active link*/
  active_tab = document.getElementsByClassName('active-tab');
  for (let i = 0; i < active_tab.length; i++) {
    active_tab[i].classList.remove('active-tab');
  }

  nav_links = document.getElementsByClassName('nav-active-link');
  for (let i = 0; i < nav_links.length; i++) {
    nav_links[i].classList.remove('nav-active-link');
  }

  let tab_name = event.target.innerText.toLowerCase() + '_tab';
  document.getElementById(tab_name).classList.add('active-tab');
  event.target.classList.add('nav-active-link');
}

function add_cust_button() {
  let input = document.createElement('input');
  input.type = 'text';
  input.className = 'cust-symbols';
  input.addEventListener('input', preview_cust_buttons);
  input.addEventListener('keypress', (e) => {
    if (e.code === 'Enter') {
      add_cust_button();
    }
  });
  input.addEventListener('keydown', (e) => {
    if (
      (e.code === 'Backspace' && e.shiftKey) ||
      (e.code === 'Backspace' && e.target.value === '')
    ) {
      input.remove();
    }

    preview_cust_buttons();
  });
  document.getElementById('cust_btn_cont').appendChild(input);
  input.focus();
}

function preview_cust_buttons() {
  let symbols = document.getElementsByClassName('cust-symbols');
  document.getElementById('cust_btn_prev').innerHTML = '';
  for (let i = 0; i < symbols.length; i++) {
    if (symbols[i].value.trim()) {
      let button = document.createElement('button');
      button.textContent = symbols[i].value;
      document.getElementById('cust_btn_prev').appendChild(button);
    }
  }
}

function save_cust_buttons() {
  let symbols = document.getElementsByClassName('cust-symbols');
  let custom_buttons = [];
  for (let i = 0; i < symbols.length; i++) {
    custom_buttons.push(symbols[i].value);
  }
  chrome.storage.sync.set({ cust_btns: custom_buttons });
}

//Attach event listeners
mode_checkbox.addEventListener('change', set_mode);
autotype_checkbox.addEventListener('change', set_autotype);
toolbar_height.addEventListener('input', set_toolbar_height);
cust_btn_adder.addEventListener('click', add_cust_button);
cust_save_btn.addEventListener('click', save_cust_buttons);
add_cust_button();

//Synchronize page mode and mode checkbox state
chrome.storage.sync.get('mode', function (data) {
  toolbar_mode = data.mode;
  if (data.mode == 'dark') {
    document.body.style.backgroundColor = 'var(--dbg)';
    document.body.style.color = 'var(--dfg)';
    document.body.className = 'dark-mode-page';
    document.getElementById('mode_checkbox').setAttribute('checked', true);
  }
});
//Synchronize toolbar height to range slider
chrome.storage.sync.get('toolbar_height', function (data) {
  toolbar_height_slider.value = data.toolbar_height;
  toolbar_height_value_output.innerHTML = data.toolbar_height + '% ';
});

//Synchronize autotype state to autotype checkbox
chrome.storage.sync.get('autotype', function (data) {
  if (data.autotype === true) {
    document.getElementById('autotype_checkbox').setAttribute('checked', true);
  }
});

//Allow page to open when navigation links are clicked
let nav_links = document.getElementsByClassName('nav-links');
for (let i = 0; i < nav_links.length; i++) {
  //Only assign tab to buttons that aren't linked to webpage
  if (!nav_links[i].href) {
    nav_links[i].addEventListener('click', open_tab);
  }
}

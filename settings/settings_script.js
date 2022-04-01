'use-strict';

//Set document theme/mode automatically
function set_mode(event) {
  if (event.target.checked) {
    set_dark_mode_var();
    document.body.classList.add('dark-mode__page');
    chrome.storage.sync.set({ mode: 'dark' });
  } else {
    set_light_mode_var();
    document.body.classList.remove('dark-mode__page');
    chrome.storage.sync.set({ mode: 'light' });
  }
}
function set_dark_mode_var() {
  let root = document.querySelector(':root');
  var rs = getComputedStyle(root);
  root.style.setProperty('--back', '#000509');
  root.style.setProperty('--fore', '#0d1117');
  root.style.setProperty('--color', '#c2cad2');

  //Check if checkbox is checked or not

  let is_checked = document
    .getElementById('mode_checkbox')
    .getAttribute('checked');
  if (!is_checked) {
    document.getElementById('mode_checkbox').setAttribute('checked', true);
  }
}
function set_light_mode_var() {
  let root = document.querySelector(':root');
  var rs = getComputedStyle(root);
  root.style.setProperty('--back', 'aliceblue');
  root.style.setProperty('--fore', 'rgb(172, 169, 169)');
  root.style.setProperty('--color', 'black');
}

function open_page(event) {
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

function execute_funcs() {
  let checkbox = document.getElementById('mode_checkbox');
  checkbox.addEventListener('change', set_mode);
  chrome.storage.sync.get('mode', function (data) {
    if (data.mode == 'dark') {
      set_dark_mode_var();
    }
  });
  //Allow page to open when navigation links are clicked
  let nav_links = document.getElementsByClassName('nav-links');
  for (let i = 0; i < nav_links.length; i++) {
    //Only assign tab to buttons that aren't linked to webpage
    if (!nav_links[i].href) {
      nav_links[i].addEventListener('click', open_page);
    }
  }

  let toolbar_height_slider = document.getElementById('toolbar_height');
  let toolbar_height_value_output = document.getElementById(
    'toolbar_height_value'
  );

  toolbar_height.addEventListener('input', function () {
    chrome.storage.sync.set({ toolbar_height: toolbar_height_slider.value });
    toolbar_height_value_output.innerHTML = toolbar_height_slider.value + '%';
  });
  chrome.storage.sync.get('toolbar_height', function (data) {
    toolbar_height_slider.value = data.toolbar_height;
    toolbar_height_value_output.innerHTML = data.toolbar_height + '%';
  });
}
document.addEventListener('DOMContentLoaded', execute_funcs, false);

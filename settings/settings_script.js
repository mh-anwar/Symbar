//Open Basic Settings dropdown automatically
let toolbar_height_slider = document.getElementById('toolbar_height');
let toolbar_height_value_output = document.getElementById(
  'toolbar_height_value'
);

let checkbox = document.getElementById('modeSwitch');
let dropdown = document.getElementsByClassName('dropdown');

for (var i = 0; i < dropdown.length; i++) {
  var panel = dropdown[i].nextElementSibling;
  if (dropdown[i].id == 'basic_settings') {
    panel.style.display = 'block';
  }
}
//Get the dropdowns to open and close on click
for (var i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener('click', function () {
    this.classList.toggle('active');
    var panel = this.nextElementSibling;
    if (panel.style.display === 'block') {
      panel.style.display = 'none';
    } else {
      panel.style.display = 'block';
    }
  });
}
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
}
function set_light_mode_var() {
  let root = document.querySelector(':root');
  var rs = getComputedStyle(root);
  root.style.setProperty('--back', 'aliceblue');
  root.style.setProperty('--fore', 'rgb(172, 169, 169)');
  root.style.setProperty('--color', 'black');
}
checkbox.addEventListener('change', set_mode);

toolbar_height.addEventListener('input', function () {
  chrome.storage.sync.set({ toolbar_height: toolbar_height_slider.value });
  toolbar_height_value_output.innerHTML = toolbar_height_slider.value + '%';
});

window.onload = function () {
  chrome.storage.sync.get('toolbar_height', function (data) {
    toolbar_height_slider.value = data.toolbar_height;
    toolbar_height_value_output.innerHTML = data.toolbar_height + '%';
  });
  chrome.storage.sync.get('mode', function (data) {
    if (data.mode == 'dark') {
      set_dark_mode_var();
      document.body.classList.add('dark-mode__page');
      let is_checked = checkbox.getAttribute('checked');
      if (!is_checked) {
        checkbox.setAttribute('checked', true);
      }
    }
  });
};

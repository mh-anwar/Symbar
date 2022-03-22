function set_dark_mode_var() {
  let root = document.querySelector(':root');
  var rs = getComputedStyle(root);
  root.style.setProperty('--back', '#000509');
  root.style.setProperty('--fore', '#0d1117');
  root.style.setProperty('--color', '#c2cad2');
}

chrome.storage.sync.get('mode', function (data) {
  if (data.mode == 'dark') {
    set_dark_mode_var();
    document.body.classList.add('dark-mode__page');
  }
});

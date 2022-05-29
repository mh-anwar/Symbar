'use strict';
//Apr 05, 09:41pm: the content script is sandboxed to within the screen
var state_of_toolbar = 0;
let toolbar_height = '20%';
//Always be checking if toolbar height is changed
chrome.storage.onChanged.addListener((changes, area) => {
  if (changes.toolbar_height?.newValue) {
    console.log(changes.toolbar_height?.newValue);
    toolbar_height = changes.toolbar_height?.newValue + '%';
    var toolbar = document.getElementById('copy_toolbar');
    if (typeof toolbar != 'undefined' && toolbar != null) {
      document.getElementById('copy_toolbar').style.height = toolbar_height;
    }
  }
});

//injection function
function toolbar_inserter() {
  var div = document.createElement(div);
  div.className = 'symbar-toolbar-base';
  div.id = 'copy_toolbar';
  document.body.appendChild(div);

  fetch(chrome.runtime.getURL('toolbar/content_injection.html'))
    .then((response) => response.text())
    .then((html_data) => {
      var copy_toolbar = document.getElementById('copy_toolbar');
      copy_toolbar.innerHTML = html_data;

      chrome.storage.sync.get('mode', function (data) {
        if (data.mode == 'dark') {
          set_dark_mode();
        }
      });

      document
        .getElementById('symbar_select_form')
        .addEventListener('change', toolbar_select_form_toggler);
      toolbar_populate_dropdowns();
      fetch(chrome.runtime.getURL('./accents.json'))
        .then((response) => response.json())
        .then((data) => {
          document
            .getElementById('symbar_search')
            .addEventListener('input', (event) => {
              console.time('Search');
              const search_term = event.target.value;

              if (search_term == '') {
                document.getElementById('symbar_search_results').innerHTML = '';
              } else {
                let select_form = document.getElementById('symbar_select_form');
                let selected_option =
                  select_form.options[select_form.selectedIndex].text;
                //use this for finer filtering
                let symbols = search(search_term, data);
                document.getElementById('symbar_search_results').innerHTML = '';
                for (let i in symbols) {
                  document.getElementById(
                    'symbar_search_results'
                  ).innerHTML += `<button class="symbar-toolbar-copy-btn">${symbols[i]}</button>`;
                  console.log(document.getElementById('symbar_search'));
                }
              }
              console.timeEnd('Search');
            });
        });

      toolbar_minimizer();

      chrome.storage.sync.get('toolbar_height', (data) =>
        set_toolbar_height(data, copy_toolbar)
      );
      document
        .getElementById('symbar_close_toolbar')
        .addEventListener('click', toolbar_closer);
    });
}
function search(search_term, data) {
  var symbols = [];
  Object.keys(data).forEach((lang) => {
    Object.keys(data[lang]).forEach((symb) => {
      for (let i in data[lang][symb]) {
        let potential_term = data[lang][symb][i].toString().toLowerCase();
        if (potential_term == search_term) {
          symbols.push(symb);
          break;
        }
      }
    });
  });
  return symbols;
}
function set_toolbar_height(data, copy_toolbar) {
  let toolbar_height = data.toolbar_height + '%';
  copy_toolbar.style.height = toolbar_height;
}

function set_dark_mode() {
  copy_toolbar.classList.add('dark-mode-page');
  copy_toolbar.style.backgroundColor = '#000408';
  copy_toolbar.style.color = '#c2c3c5';
}

function toolbar_closer() {
  chrome.storage.sync.get('toolbar_state', function (data) {
    chrome.storage.sync.set({ toolbar_state: (data.toolbar_state += 1) });
  });
  document.getElementById('copy_toolbar').remove();
  state_of_toolbar = 0;
}

function toolbar_populate_dropdowns() {
  fetch(chrome.runtime.getURL('./accents.json'))
    .then((response) => response.json())
    .then((data) => {
      Object.keys(data).forEach((lang) => {
        let lang_div = ('symbar_' + lang).toLowerCase();
        Object.keys(data[lang]).forEach((symb) => {
          document.getElementById(
            lang_div
          ).innerHTML += `<button class="symbar-toolbar-copy-btn">${symb}</button>`;
        });
      });
    })
    .then(() => toolbar_copier());
}

function toolbar_copier() {
  var copyButtonClass = document.getElementsByClassName(
    'symbar-toolbar-copy-btn'
  );
  for (var i = 0; i < copyButtonClass.length; i++) {
    copyButtonClass[i].addEventListener('click', function (e) {
      var text_to_copy = e.target.textContent;
      navigator.clipboard.writeText(text_to_copy);
    });
  }
}

function toolbar_select_form_toggler() {
  let toggled_buttons = document.querySelector(
      '.symbar-toolbar-toggled-btn-box'
    ),
    target = document.getElementById(this.value);
  if (toggled_buttons !== null) {
    toggled_buttons.className = 'symbar-toolbar-hidden-btn-box';
  }
  if (target !== null) {
    target.className = 'symbar-toolbar-toggled-btn-box';
  }
}

function toolbar_maximizer() {
  var maximize_toolbar = document.getElementById('maximize_toolbar');
  maximize_toolbar.addEventListener('click', function () {
    document.getElementById('minimized_toolbar').remove();
    document.getElementById('copy_toolbar').style.display = 'flex';
  });
}

function toolbar_minimized_remover() {
  document
    .getElementById('close_minmized_toolbar')
    .addEventListener('click', function () {
      document.getElementById('minimized_toolbar').remove();
      document.getElementById('copy_toolbar').remove();
    });
}

function toolbar_minimizer() {
  document
    .getElementById('symbar_minimize_toolbar')
    .addEventListener('click', function () {
      var div = document.createElement(div);
      div.className = 'symbar-toolbar-base-minimized ';
      div.id = 'minimized_toolbar';
      document.body.appendChild(div);
      document.getElementById('copy_toolbar').style.display = 'none';
      fetch(chrome.runtime.getURL('toolbar/minimize_injection.html'))
        .then((response) => response.text())
        .then((data) => {
          document.getElementById('minimized_toolbar').innerHTML = data;
          toolbar_maximizer();
          toolbar_minimized_remover();
        });
      //In the event that any function changed the state
      state_of_toolbar = 1;
    });
}

function autotype(letter) {
  /*Autotype is supposedly as simple as this!
    Note autotype doesn't work on Google, etc
    Google Docs has a billion iframes, with div's all over..
    few extensions, like Grammarly, actually work in Google Docs
  */
  console.log(document.activeElement);
  document.activeElement.value += letter.toString();
}

function message_parser(message, sender, sendResponse) {
  var toolbar = document.getElementById('copy_toolbar');
  var minimized_toolbar = document.getElementById('minimized_toolbar');
  if (message === 'state_of_toolbar') {
    sendResponse({ state: state_of_toolbar });
  } else if (message === 'toolbar_on') {
    //Call the function that inserts the toolbar
    toolbar_inserter();
    state_of_toolbar = 1;
  } else if (message === 'toolbar_off') {
    if (document.contains(toolbar)) {
      document.getElementById('copy_toolbar').remove();
    }
    if (document.contains(minimized_toolbar)) {
      document.getElementById('minimized_toolbar').remove();
    }
    state_of_toolbar = 0;
  }
  //returning false to indicate end
  return false;
}

chrome.runtime.onMessage.addListener(message_parser);

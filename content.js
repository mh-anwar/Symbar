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
  div.className = 'copythat-toolbar-base';
  div.id = 'copy_toolbar';
  document.body.appendChild(div);

  fetch(chrome.runtime.getURL('./accents.json'))
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });

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
        .getElementById('copythat_select_form')
        .addEventListener('change', toolbar_select_form_toggler);

      //Call the function that allows buttons to copy
      //toolbar_copier();
      //toolbar_closer();
      //toolbar_minimizer();
      chrome.storage.sync.get('toolbar_height', (data) =>
        set_toolbar_height(data, copy_toolbar)
      );
      document
        .getElementById('copythat_close_toolbar')
        .addEventListener('click', toolbar_closer);
    });
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
  /*This is messed up, accent_text is a constant
  in another file(../accent_text.js) which should
  be a JSON file, but JSON doesn't seem to be working
  right now. Fix later*/
  console.log('TTT');
  let languages = accent_text;
  for (let lang in languages) {
    document.getElementById(lang).innerHTML += `<div>
          ${languages[lang]
            .map((text) => `<button class="copy-button">${text}</button>`)
            .join(' ')}
       </div>`;
  }
}

function toolbar_copier() {
  var copyButtonClass = document.getElementsByClassName(
    'toolbar__button--copy'
  );
  for (var i = 0; i < copyButtonClass.length; i++) {
    copyButtonClass[i].addEventListener('click', function (e) {
      var text_to_copy = e.target.textContent;
      navigator.clipboard.writeText(text_to_copy);
    });
  }
}

function toolbar_select_form_toggler() {
  var buttons_toggle = document.querySelector(
      '.copythat-toolbar-toggled-btn-box'
    ),
    target = document.getElementById(this.value);
  if (buttons_toggle !== null) {
    buttons_toggle.className = 'copythat-toolbar-hidden-btn-box';
  }
  if (target !== null) {
    target.className = 'copythat-toolbar-toggled-btn-box';
  }
}

function toolbar_maximizer() {
  var maximize_toolbar = document.getElementById('maximize_toolbar');
  maximize_toolbar.addEventListener('click', function () {
    document.getElementById('minimized_toolbar').remove();
    document.getElementById('copy_toolbar').style.display = 'block';
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
    .getElementById('copythat_minimize_toolbar')
    .addEventListener('click', function () {
      var div = document.createElement(div);
      div.className = 'toolbar_base--minimized';
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
      state_of_toolbar = 0;
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
  if (typeof message === 'object') {
    autotype(message.autotype);
  } else if (message === 'state_of_toolbar') {
    if (document.contains(toolbar)) {
      sendResponse({ state: 1 });
    } else if (document.contains(minimized_toolbar)) {
      sendResponse({ state: 1 });
    } else {
      sendResponse({ state: 0 });
    }
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
  } else if (message === 'autotype') {
    autotype;
  }
  //returning true is MANDATORY, becuase the function may send a response back
  return true;
}

chrome.runtime.onMessage.addListener(message_parser);

/*
DYANMIC element creation (makes a div lol)
    var div = document.createElement(div);
    div.className = 'toolbar_base'
    div.id = 'test'
    document.body.appendChild(div);
*/

'use strict';

var state_of_toolbar = 0;
var popup_enabled = false;
var accentsData = null;
let toolbar_height = '20%';

// Cache accents data once
async function loadAccentsData() {
  if (accentsData) return accentsData;
  const response = await fetch(chrome.runtime.getURL('./accents.json'));
  accentsData = await response.json();
  return accentsData;
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (changes.toolbar_height?.newValue) {
    toolbar_height = changes.toolbar_height.newValue + '%';
    const toolbar = document.getElementById('copy_toolbar');
    if (toolbar) {
      toolbar.style.height = toolbar_height;
    }
  } else if (changes.recently_used?.newValue) {
    update_recent();
  } else if (changes.mode?.newValue) {
    const toolbar = document.getElementById('copy_toolbar');
    if (toolbar) toolbar.remove();
    toolbar_inserter();
  } else if (changes.popup_enabled?.newValue !== undefined) {
    popup_enabled = changes.popup_enabled.newValue;
    if (!popup_enabled) {
      removePopup();
    }
  }
});

// ============================================================
// TOOLBAR
// ============================================================

function toolbar_inserter() {
  const div = document.createElement('div');
  let toolbar_mode;

  chrome.storage.sync.get('mode', function (data) {
    toolbar_mode = data.mode;
    if (data.mode === 'dark') {
      div.className = 'symbar-toolbar-base symbar-dark-mode';
    } else {
      div.className = 'symbar-toolbar-base';
    }
  });

  div.id = 'copy_toolbar';
  document.body.appendChild(div);

  fetch(chrome.runtime.getURL('toolbar/content_injection.html'))
    .then((response) => response.text())
    .then(async (html_data) => {
      const copy_toolbar = document.getElementById('copy_toolbar');
      copy_toolbar.innerHTML = html_data;

      document
        .getElementById('symbar_select_form')
        .addEventListener('change', toolbar_select_form_toggler);

      const data = await loadAccentsData();
      toolbar_populate_dropdowns(data);

      // Set up search with cached data
      document
        .getElementById('symbar_search')
        .addEventListener('input', (event) => {
          const search_term = event.target.value.trim().toLowerCase();
          const resultsEl = document.getElementById('symbar_search_results');

          if (search_term === '') {
            resultsEl.innerHTML = '';
            resultsEl.style.display = 'none';
          } else {
            const symbols = search(search_term, data);
            resultsEl.innerHTML = '';
            resultsEl.style.display = 'flex';
            for (const sym of symbols) {
              const btn = document.createElement('button');
              btn.className = 'symbar-toolbar-copy-btn';
              btn.textContent = sym;
              resultsEl.appendChild(btn);
            }
            toolbar_copier();
          }
        });

      toolbar_minimizer();

      chrome.storage.sync.get('toolbar_height', (data) =>
        set_toolbar_height(data, copy_toolbar)
      );

      document
        .getElementById('symbar_close_toolbar')
        .addEventListener('click', toolbar_closer);
      document
        .getElementById('symbar_options')
        .addEventListener('click', toolbar_options);

      toolbar_dark_mode_btn(toolbar_mode);
      toolbar_populate_custom();
    });
}

// Substring + fuzzy search across all tags
function search(search_term, data) {
  const symbols = [];
  const seen = new Set();

  Object.keys(data).forEach((lang) => {
    Object.keys(data[lang]).forEach((symb) => {
      if (seen.has(symb)) return;
      // Check if the symbol itself matches
      if (symb.toLowerCase().includes(search_term)) {
        symbols.push(symb);
        seen.add(symb);
        return;
      }
      // Check tags - substring match
      const tags = data[lang][symb];
      const tagString = tags.join(' ').toLowerCase();
      if (tagString.includes(search_term)) {
        symbols.push(symb);
        seen.add(symb);
      }
    });
  });
  return symbols;
}

function set_toolbar_height(data, copy_toolbar) {
  if (data.toolbar_height) {
    copy_toolbar.style.height = data.toolbar_height + '%';
  }
}

function toolbar_dark_mode_btn(mode) {
  const mode_button = document.getElementById('symbar_dark_mode');
  if (mode === 'dark') {
    mode_button.textContent = '\u2600\uFE0F';
  } else {
    mode_button.textContent = '\uD83C\uDF19';
  }
  mode_button.addEventListener('click', () => {
    chrome.runtime.sendMessage('change-mode');
  });
}

function toolbar_closer() {
  chrome.storage.sync.get('toolbar_state', function (data) {
    chrome.storage.sync.set({ toolbar_state: (data.toolbar_state || 0) + 1 });
  });
  document.getElementById('copy_toolbar').remove();
  state_of_toolbar = 0;
}

function toolbar_options() {
  chrome.runtime.sendMessage('open-options');
}

function toolbar_populate_dropdowns(data) {
  Object.keys(data).forEach((lang) => {
    const lang_div = ('symbar_' + lang).toLowerCase();
    const container = document.getElementById(lang_div);
    if (!container) return;
    Object.keys(data[lang]).forEach((symb) => {
      const btn = document.createElement('button');
      btn.className = 'symbar-toolbar-copy-btn';
      btn.textContent = symb;
      container.appendChild(btn);
    });
  });
  update_recent();
  toolbar_copier();
}

async function toolbar_add_recent(btn_text) {
  let data = await chrome.storage.sync.get('recently_used');
  let recents = data.recently_used || [];
  // Remove duplicate if it exists, so it moves to end
  recents = recents.filter((r) => r !== btn_text);
  if (recents.length >= 20) {
    recents.shift();
  }
  recents.push(btn_text);
  chrome.storage.sync.set({ recently_used: recents });
}

async function toolbar_populate_custom() {
  const data = await chrome.storage.sync.get('cust_btns');
  const btns = data.cust_btns || [];
  const container = document.getElementById('symbar_custom');
  for (const val of btns) {
    const btn = document.createElement('button');
    btn.className = 'symbar-toolbar-copy-btn';
    btn.textContent = val;
    container.appendChild(btn);
  }
  toolbar_copier();
}

async function update_recent() {
  const data = await chrome.storage.sync.get('recently_used');
  const recents = data.recently_used || [];
  const recent_node = document.getElementById('symbar_recent');
  if (!recent_node) return;
  recent_node.innerHTML = '';
  for (const val of recents) {
    const btn = document.createElement('button');
    btn.className = 'symbar-toolbar-copy-btn';
    btn.textContent = val;
    recent_node.appendChild(btn);
  }
  toolbar_copier();
}

function toolbar_copier() {
  const copyButtons = document.getElementsByClassName('symbar-toolbar-copy-btn');
  for (let i = 0; i < copyButtons.length; i++) {
    // Remove old listeners by cloning
    const btn = copyButtons[i];
    if (btn.dataset.bound) continue;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', function (e) {
      const text_to_copy = e.target.textContent;
      navigator.clipboard.writeText(text_to_copy);
      toolbar_add_recent(text_to_copy);
      const instructions = document.getElementById('symbar_instructions');
      if (instructions) {
        instructions.innerHTML =
          '<span class="symbar-copied-msg">Copied!</span>';
        setTimeout(() => {
          instructions.innerHTML =
            '<p>Click any symbol to copy</p>';
        }, 2000);
      }
    });
  }
}

function toolbar_select_form_toggler() {
  const toggled_buttons = document.querySelector(
    '.symbar-toolbar-toggled-btn-box'
  );
  const target = document.getElementById(this.value);
  const recents = document.getElementById('symbar_recent');

  if (toggled_buttons !== null) {
    toggled_buttons.className = 'symbar-toolbar-hidden-btn-box';
  }

  if (target !== null) {
    target.className = 'symbar-toolbar-toggled-btn-box';
    recents.style.display = 'none';
  } else {
    recents.className = 'symbar-toolbar-toggled-btn-box';
    recents.style.display = 'flex';
  }

  // Clear search when switching categories
  const searchEl = document.getElementById('symbar_search');
  if (searchEl) searchEl.value = '';
  const resultsEl = document.getElementById('symbar_search_results');
  if (resultsEl) {
    resultsEl.innerHTML = '';
    resultsEl.style.display = 'none';
  }
}

function toolbar_maximizer() {
  document.getElementById('maximize_toolbar').addEventListener('click', function () {
    document.getElementById('minimized_toolbar').remove();
    document.getElementById('copy_toolbar').style.display = 'flex';
  });
}

function toolbar_minimized_remover() {
  document
    .getElementById('close_minimized_toolbar')
    .addEventListener('click', function () {
      document.getElementById('minimized_toolbar').remove();
      document.getElementById('copy_toolbar').remove();
      state_of_toolbar = 0;
    });
}

function toolbar_minimizer() {
  document
    .getElementById('symbar_minimize_toolbar')
    .addEventListener('click', function () {
      const div = document.createElement('div');
      div.className = 'symbar-toolbar-base-minimized';
      div.id = 'minimized_toolbar';

      // Match current mode
      chrome.storage.sync.get('mode', function (data) {
        if (data.mode === 'dark') {
          div.classList.add('symbar-dark-mode');
        }
      });

      document.body.appendChild(div);
      document.getElementById('copy_toolbar').style.display = 'none';
      fetch(chrome.runtime.getURL('toolbar/minimize_injection.html'))
        .then((response) => response.text())
        .then((html) => {
          document.getElementById('minimized_toolbar').innerHTML = html;
          toolbar_maximizer();
          toolbar_minimized_remover();
        });
      state_of_toolbar = 1;
    });
}

// ============================================================
// FLOATING POPUP - Quick access while typing
// ============================================================

let popupEl = null;
let popupTimeout = null;

function createPopup() {
  if (popupEl) return popupEl;
  const el = document.createElement('div');
  el.id = 'symbar_popup';
  el.className = 'symbar-popup';

  chrome.storage.sync.get('mode', function (data) {
    if (data.mode === 'dark') {
      el.classList.add('symbar-dark-mode');
    }
  });

  document.body.appendChild(el);
  popupEl = el;
  return el;
}

function removePopup() {
  if (popupEl) {
    popupEl.remove();
    popupEl = null;
  }
}

function positionPopup(el, rect) {
  const popup = el;
  popup.style.left = rect.left + 'px';
  popup.style.top = (rect.top - popup.offsetHeight - 8) + 'px';

  // Make sure it doesn't go off screen
  const popupRect = popup.getBoundingClientRect();
  if (popupRect.top < 0) {
    popup.style.top = (rect.bottom + 8) + 'px';
  }
  if (popupRect.right > window.innerWidth) {
    popup.style.left = (window.innerWidth - popupRect.width - 8) + 'px';
  }
}

async function showPopup(inputEl) {
  if (!popup_enabled) return;

  const data = await chrome.storage.sync.get('recently_used');
  const recents = data.recently_used || [];
  if (recents.length === 0) return;

  const popup = createPopup();
  popup.innerHTML = '';

  // Show up to 10 most recent symbols
  const toShow = recents.slice(-10).reverse();
  for (const sym of toShow) {
    const btn = document.createElement('button');
    btn.className = 'symbar-popup-btn';
    btn.textContent = sym;
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(sym);
      toolbar_add_recent(sym);
      // Brief flash feedback
      btn.classList.add('symbar-popup-btn-copied');
      setTimeout(() => btn.classList.remove('symbar-popup-btn-copied'), 300);
    });
    popup.appendChild(btn);
  }

  // Position near the input element
  const rect = inputEl.getBoundingClientRect();
  popup.style.display = 'flex';
  requestAnimationFrame(() => positionPopup(popup, rect));
}

function hidePopup() {
  if (popupEl) {
    popupEl.style.display = 'none';
  }
}

// Show popup when user focuses an input/textarea
document.addEventListener(
  'focusin',
  (e) => {
    if (!popup_enabled) return;
    const tag = e.target.tagName;
    const isEditable = e.target.isContentEditable;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) {
      clearTimeout(popupTimeout);
      popupTimeout = setTimeout(() => showPopup(e.target), 400);
    }
  },
  true
);

document.addEventListener(
  'focusout',
  (e) => {
    clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => hidePopup(), 200);
  },
  true
);

// Initialize popup setting
chrome.storage.sync.get('popup_enabled', (data) => {
  popup_enabled = data.popup_enabled || false;
});

// ============================================================
// MESSAGE HANDLING
// ============================================================

function message_parser(message, sender, sendResponse) {
  const toolbar = document.getElementById('copy_toolbar');
  const minimized_toolbar = document.getElementById('minimized_toolbar');

  if (message === 'state_of_toolbar') {
    sendResponse({ state: state_of_toolbar });
  } else if (message === 'toolbar_on') {
    toolbar_inserter();
    state_of_toolbar = 1;
  } else if (message === 'toolbar_off') {
    if (document.contains(toolbar)) {
      toolbar.remove();
    }
    if (document.contains(minimized_toolbar)) {
      minimized_toolbar.remove();
    }
    state_of_toolbar = 0;
  }
  return false;
}

chrome.runtime.onMessage.addListener(message_parser);

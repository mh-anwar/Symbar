'use strict';

var state_of_toolbar = 0;
var popup_enabled = false;
var popup_source = 'recent'; // 'recent' or 'custom'
var popup_count = 10;
var symbolsData = null;
let toolbar_height = '20%';

// ============================================================
// UTILITY - safe chrome.storage wrappers
// ============================================================

function isContextValid() {
  try {
    return !!chrome.runtime && !!chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

function safeStorageGet(keys) {
  return new Promise((resolve) => {
    if (!isContextValid()) { resolve({}); return; }
    try {
      chrome.storage.sync.get(keys, (data) => {
        if (chrome.runtime.lastError) {
          resolve({});
        } else {
          resolve(data);
        }
      });
    } catch (e) {
      resolve({});
    }
  });
}

function safeStorageSet(obj) {
  if (!isContextValid()) return;
  try {
    chrome.storage.sync.set(obj);
  } catch (e) {
    // Extension context invalidated
  }
}

// Cache symbols data once
async function loadSymbolsData() {
  if (symbolsData) return symbolsData;
  try {
    const response = await fetch(chrome.runtime.getURL('./symbols.json'));
    symbolsData = await response.json();
  } catch (e) {
    symbolsData = {};
  }
  return symbolsData;
}

// ============================================================
// STORAGE CHANGE LISTENER
// ============================================================

chrome.storage.onChanged.addListener((changes, area) => {
  try {
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
    } else if (changes.popup_source?.newValue) {
      popup_source = changes.popup_source.newValue;
    } else if (changes.popup_count?.newValue) {
      popup_count = changes.popup_count.newValue;
    }
  } catch (e) {
    // Extension context invalidated
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

      const data = await loadSymbolsData();
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

// Substring search across all tags
function search(search_term, data) {
  const symbols = [];
  const seen = new Set();

  Object.keys(data).forEach((lang) => {
    Object.keys(data[lang]).forEach((symb) => {
      if (seen.has(symb)) return;
      if (symb.toLowerCase().includes(search_term)) {
        symbols.push(symb);
        seen.add(symb);
        return;
      }
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
  safeStorageGet('toolbar_state').then((data) => {
    safeStorageSet({ toolbar_state: (data.toolbar_state || 0) + 1 });
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
  const data = await safeStorageGet('recently_used');
  let recents = data.recently_used || [];
  recents = recents.filter((r) => r !== btn_text);
  if (recents.length >= 20) {
    recents.shift();
  }
  recents.push(btn_text);
  safeStorageSet({ recently_used: recents });
}

async function toolbar_populate_custom() {
  const data = await safeStorageGet('cust_btns');
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
  const data = await safeStorageGet('recently_used');
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
          instructions.innerHTML = '<p>Click any symbol to copy</p>';
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

function createPopup(isDark) {
  if (popupEl) return popupEl;
  const el = document.createElement('div');
  el.id = 'symbar_popup';
  el.className = 'symbar-popup' + (isDark ? ' symbar-dark-mode' : '');
  // Set display none via inline style - CSS all:initial can't override inline
  el.style.cssText = 'display: none !important;';
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

function positionPopup(popup, rect) {
  // Position above the input
  const popupHeight = popup.offsetHeight || 40;
  let top = rect.top - popupHeight - 8;
  let left = rect.left;

  // If would go off top, show below
  if (top < 0) {
    top = rect.bottom + 8;
  }
  // Clamp to viewport
  if (left + 320 > window.innerWidth) {
    left = window.innerWidth - 328;
  }
  if (left < 8) left = 8;

  popup.style.cssText = `
    display: flex !important;
    position: fixed !important;
    top: ${top}px !important;
    left: ${left}px !important;
    z-index: 2147483647 !important;
  `;
}

async function showPopup(inputEl) {
  if (!popup_enabled || !isContextValid()) return;

  const data = await safeStorageGet(['recently_used', 'cust_btns', 'mode', 'popup_source', 'popup_count']);
  const isDark = data.mode === 'dark';
  const source = data.popup_source || popup_source;
  const count = data.popup_count || popup_count;

  let items;
  if (source === 'custom') {
    items = data.cust_btns || [];
  } else {
    items = (data.recently_used || []).slice(-count).reverse();
  }

  if (items.length === 0) return;

  const popup = createPopup(isDark);
  popup.innerHTML = '';

  for (const sym of items.slice(0, count)) {
    const btn = document.createElement('button');
    btn.className = 'symbar-popup-btn';
    btn.textContent = sym;
    // Force pointer-events inline to override any page CSS
    btn.style.cssText = 'pointer-events: auto !important; user-select: none !important;';

    const copySymbol = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      navigator.clipboard.writeText(sym);
      toolbar_add_recent(sym);
      btn.classList.add('symbar-popup-btn-copied');
      setTimeout(() => btn.classList.remove('symbar-popup-btn-copied'), 300);
    };

    // Use both mousedown AND click - some pages (Google) intercept
    // one but not the other. The flag prevents double-firing.
    let fired = false;
    btn.addEventListener('mousedown', (e) => {
      fired = true;
      copySymbol(e);
    }, true);
    btn.addEventListener('click', (e) => {
      if (!fired) copySymbol(e);
      fired = false;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }, true);
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    }, true);

    popup.appendChild(btn);
  }

  const rect = inputEl.getBoundingClientRect();
  requestAnimationFrame(() => positionPopup(popup, rect));
}

function hidePopup() {
  if (popupEl) {
    popupEl.style.cssText = 'display: none !important;';
  }
}

// Popup triggers - use capture phase to catch events before page handlers
document.addEventListener(
  'focusin',
  (e) => {
    if (!popup_enabled) return;
    const el = e.target;
    const tag = el.tagName;
    const isEditable = el.isContentEditable;
    // Skip if the click is inside the popup itself
    if (popupEl && popupEl.contains(el)) return;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) {
      // Skip search/password inputs
      const type = el.getAttribute('type');
      if (type === 'password' || type === 'hidden') return;
      clearTimeout(popupTimeout);
      popupTimeout = setTimeout(() => showPopup(el), 300);
    }
  },
  true
);

document.addEventListener(
  'focusout',
  (e) => {
    clearTimeout(popupTimeout);
    // Delay hiding so clicks on popup buttons can register.
    // Also check if the new focus target is inside our popup.
    popupTimeout = setTimeout(() => {
      // Don't hide if something inside the popup is active
      if (popupEl && popupEl.contains(document.activeElement)) return;
      hidePopup();
    }, 400);
  },
  true
);

// Reposition popup on scroll/resize
window.addEventListener('scroll', () => hidePopup(), true);
window.addEventListener('resize', () => hidePopup());

// Initialize popup settings
safeStorageGet(['popup_enabled', 'popup_source', 'popup_count']).then((data) => {
  popup_enabled = data.popup_enabled === true;
  popup_source = data.popup_source || 'recent';
  popup_count = data.popup_count || 10;
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

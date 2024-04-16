'use strict';

const mode_checkbox = document.getElementById('mode_checkbox');
const popup_checkbox = document.getElementById('popup_checkbox');
const popup_source_select = document.getElementById('popup_source');
const popup_count_slider = document.getElementById('popup_count');
const popup_count_output = document.getElementById('popup_count_value');
const toolbar_height_slider = document.getElementById('toolbar_height');
const toolbar_height_value_output = document.getElementById('toolbar_height_value');
const cust_btn_adder = document.getElementById('add_cust_btn');
const cust_save_btn = document.getElementById('save_cust_btn');
const symbol_finder_input = document.getElementById('symbol_finder_search');
const symbol_finder_results = document.getElementById('symbol_finder_results');

let symbolsData = null;

async function loadSymbols() {
  if (symbolsData) return symbolsData;
  const response = await fetch(chrome.runtime.getURL('./symbols.json'));
  symbolsData = await response.json();
  return symbolsData;
}

// Theme toggle - no reload needed
function set_mode(event) {
  const newMode = event.target.checked ? 'dark' : 'light';
  chrome.storage.sync.set({ mode: newMode });
  applyTheme(newMode);
}

function applyTheme(mode) {
  if (mode === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

function set_toolbar_height() {
  chrome.storage.sync.set({ toolbar_height: toolbar_height_slider.value });
  toolbar_height_value_output.textContent = toolbar_height_slider.value + '%';
}

function set_popup(event) {
  chrome.storage.sync.set({ popup_enabled: event.target.checked });
}

function open_tab(event) {
  const tabName = event.target.dataset.tab;
  if (!tabName) return;

  document.querySelectorAll('.active-tab').forEach((el) => {
    el.classList.remove('active-tab');
  });
  document.querySelectorAll('.nav-active-link').forEach((el) => {
    el.classList.remove('nav-active-link');
  });

  document.getElementById(tabName).classList.add('active-tab');
  event.target.classList.add('nav-active-link');
}

// ============================================================
// SYMBOL FINDER - search all symbols and click to add as custom
// ============================================================

async function searchSymbols(query) {
  const data = await loadSymbols();
  const results = [];
  const seen = new Set();
  const term = query.toLowerCase();

  Object.keys(data).forEach((category) => {
    Object.keys(data[category]).forEach((symbol) => {
      if (seen.has(symbol)) return;
      const tags = data[category][symbol];
      const tagStr = tags.join(' ').toLowerCase();
      if (symbol.toLowerCase().includes(term) || tagStr.includes(term)) {
        results.push({ symbol, tags, category });
        seen.add(symbol);
      }
    });
  });
  return results;
}

function renderFinderResults(results) {
  symbol_finder_results.innerHTML = '';
  if (results.length === 0) {
    symbol_finder_results.innerHTML = '<p class="finder-empty">No symbols found</p>';
    return;
  }

  const shown = results.slice(0, 50);
  for (const item of shown) {
    const btn = document.createElement('button');
    btn.className = 'finder-btn';
    btn.title = item.tags.join(', ') + ' (' + item.category + ')';
    btn.textContent = item.symbol;
    btn.addEventListener('click', () => {
      add_cust_button(item.symbol);
      preview_cust_buttons();
      // Flash feedback
      btn.classList.add('finder-btn-added');
      btn.textContent = '\u2713';
      setTimeout(() => {
        btn.classList.remove('finder-btn-added');
        btn.textContent = item.symbol;
      }, 600);
    });
    symbol_finder_results.appendChild(btn);
  }

  if (results.length > 50) {
    const more = document.createElement('span');
    more.className = 'finder-more';
    more.textContent = '+' + (results.length - 50) + ' more...';
    symbol_finder_results.appendChild(more);
  }
}

symbol_finder_input.addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (query.length === 0) {
    symbol_finder_results.innerHTML = '';
    return;
  }
  const results = await searchSymbols(query);
  renderFinderResults(results);
});

// ============================================================
// CUSTOM BUTTONS
// ============================================================

function add_cust_button(value = '') {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value.target ? '' : value;
  input.className = 'cust-input';
  input.placeholder = 'Symbol...';
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
      preview_cust_buttons();
    }
  });
  document.getElementById('cust_btn_cont').appendChild(input);
  input.focus();
}

function preview_cust_buttons() {
  const symbols = document.getElementsByClassName('cust-input');
  const prev = document.getElementById('cust_btn_prev');
  prev.innerHTML = '';
  for (let i = 0; i < symbols.length; i++) {
    if (symbols[i].value.trim()) {
      const button = document.createElement('button');
      button.className = 'preview-btn';
      button.textContent = symbols[i].value;
      prev.appendChild(button);
    }
  }
}

function save_cust_buttons() {
  const symbols = document.getElementsByClassName('cust-input');
  const custom_buttons = [];
  for (let i = 0; i < symbols.length; i++) {
    if (symbols[i].value !== '') {
      custom_buttons.push(symbols[i].value);
    }
  }
  chrome.storage.sync.set({ cust_btns: custom_buttons });

  cust_save_btn.textContent = 'Saved!';
  cust_save_btn.classList.add('btn-success');
  setTimeout(() => {
    cust_save_btn.textContent = 'Save';
    cust_save_btn.classList.remove('btn-success');
  }, 1500);
}

function populate_cust_buttons(data) {
  for (let i = 0; i < data.length; i++) {
    add_cust_button(data[i]);
  }
  preview_cust_buttons();
}

// ============================================================
// EVENT LISTENERS
// ============================================================

mode_checkbox.addEventListener('change', set_mode);
popup_checkbox.addEventListener('change', set_popup);
popup_source_select.addEventListener('change', () => {
  chrome.storage.sync.set({ popup_source: popup_source_select.value });
});
popup_count_slider.addEventListener('input', () => {
  const val = parseInt(popup_count_slider.value);
  chrome.storage.sync.set({ popup_count: val });
  popup_count_output.textContent = val;
});
toolbar_height_slider.addEventListener('input', set_toolbar_height);
cust_btn_adder.addEventListener('click', add_cust_button);
cust_save_btn.addEventListener('click', save_cust_buttons);

// ============================================================
// INITIALIZE STATE FROM STORAGE
// ============================================================

chrome.storage.sync.get(
  ['mode', 'toolbar_height', 'popup_enabled', 'popup_source', 'popup_count', 'cust_btns'],
  function (data) {
    if (data.mode === 'dark') {
      mode_checkbox.checked = true;
      applyTheme('dark');
    }

    if (data.toolbar_height) {
      toolbar_height_slider.value = data.toolbar_height;
      toolbar_height_value_output.textContent = data.toolbar_height + '%';
    }

    popup_checkbox.checked = data.popup_enabled === true;

    if (data.popup_source) {
      popup_source_select.value = data.popup_source;
    }

    const count = data.popup_count || 10;
    popup_count_slider.value = count;
    popup_count_output.textContent = count;

    if (data.cust_btns && data.cust_btns.length > 0) {
      populate_cust_buttons(data.cust_btns);
    } else {
      add_cust_button();
    }
  }
);

// Tab navigation
document.querySelectorAll('.nav-link').forEach((link) => {
  if (link.dataset.tab) {
    link.addEventListener('click', open_tab);
  }
});

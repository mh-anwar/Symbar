
console.log("Content Script is running, SIR!");
//Apr 05, 09:41pm [YIP]: the content script is sandboxed to within the screen
//HTML Injection (you should see a copy_toolbar after you open it through the popup)
function toolbar_inserter() {
  var div = document.createElement(div);
  div.className = "toolbar_base"
  div.setAttribute("id", "copy_toolbar")
  document.body.appendChild(div);
  fetch(chrome.runtime.getURL('toolbar/content_injection.html'))
    .then(response => response.text())
    .then(data => {
      document.getElementById('copy_toolbar').innerHTML = data;
      //Call the function that populates the select form
      toolbar_select_form_populator();
      //Call the function that allows buttons to copy
      toolbar_copier();
      //Call toolbar closer function
      toolbar_closer();
      //Call the toolbar minimizer function
      toolbar_minimizer()
    });
}
function toolbar_closer() {
  document.getElementById("close_toolbar").addEventListener("click", function () {
    chrome.storage.sync.get('toolbar_state', function (data) {
      var states_of_buttons = {};
      states_of_buttons['toolbar_state'];
      var toolbar_state = data['toolbar_state'];
      toolbar_state++;
      states_of_buttons['toolbar_state'] = toolbar_state;
      chrome.storage.sync.set(states_of_buttons, function () { });
      let request = "toolbar_state_changed"
      chrome.runtime.sendMessage(request, function (response) {
        console.log(response);
      });
    });
    document.getElementById('copy_toolbar').style.display = "none";
  });
}

function toolbar_copier() {
  var copyButtonClass = document.getElementsByClassName("toolbar__button--copy");
  for (var i = 0; i < copyButtonClass.length; i++) {
    copyButtonClass[i].addEventListener("click", function (e) {
      var text_to_copy = e.target.textContent;
      navigator.clipboard.writeText(text_to_copy);
    });
  }
}

function toolbar_select_form_populator() {
  document
    .getElementById("toolbar__select-form")
    .addEventListener("change", function () {
      "use strict";
      var buttons_toggle = document.querySelector(".buttons_toggle"),
        target = document.getElementById(this.value);
      if (buttons_toggle !== null) {
        buttons_toggle.className = "toolbar__button-list--div";
      }
      if (target !== null) {
        target.className = "buttons_toggle";
      }
    });
}
function toolbar_maximizer() {
  var maximize_toolbar = document.getElementById('maximize_toolbar');
  maximize_toolbar.addEventListener("click", function () {
    document.getElementById("minimized_toolbar").remove();
    document.getElementById('copy_toolbar').style.display = "block";
  });
}
function toolbar_minimized_remover() {
  document.getElementById("close_minmized_toolbar").addEventListener("click", function () {
    document.getElementById('minimized_toolbar').remove();
    document.getElementById('copy_toolbar').remove();
  });
}
function toolbar_minimizer() {
  document.getElementById("minimize_toolbar").addEventListener("click", function () {
    var div = document.createElement(div);
    div.className = "toolbar_base--minimized";
    div.setAttribute("id", "minimized_toolbar");
    document.body.appendChild(div);
    document.getElementById('copy_toolbar').style.display = "none";
    fetch(chrome.runtime.getURL('toolbar/minimize_injection.html'))
      .then(response => response.text())
      .then(data => {
        document.getElementById('minimized_toolbar').innerHTML = data;
        toolbar_maximizer()
        toolbar_minimized_remover()
      });
  });
}

function message_parser(message) {
  if (message === "toolbar_on") {
    //Call the function that inserts the toolbar
    toolbar_inserter();
  } else if (message === "toolbar_off") {
    document.getElementById('copy_toolbar').remove()
  }
  //not sure if return true is needed....
  return true
  //if there is a BUG (like a runtime error), try removing return true
}

chrome.runtime.onMessage.addListener(message_parser);

/*
    var div = document.createElement(div);
    div.className = "toolbar_base"
    div.setAttribute("id", "test")
    document.body.appendChild(div);
*/
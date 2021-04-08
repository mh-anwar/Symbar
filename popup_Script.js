//Below is the code for the buttons within the dropdowns
document
  .getElementById("selection_Form")
  .addEventListener("change", function () {
    "use strict";
    var vis = document.querySelector(".vis"),
      target = document.getElementById(this.value);
    if (vis !== null) {
      vis.className = "inv";
    }
    if (target !== null) {
      target.className = "vis";
    }
  });

//Options page opener
document.querySelector("#go-to-options").addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("settings_Basic.html"));
  }
});

//The Copy Function
document.getElementById("copy_Button").addEventListener("click", function () {
  const the_Id = document.getElementById("copy_Button");
  const to_Copy = the_Id.getAttribute("name");
  navigator.clipboard.writeText(to_Copy);
});

/* .then( function () { console.log("YES"); }, function () { 
  alert("Hmm..There seems to be an issue on your end.");
 } ); */

//Come to the dark side, we use cookies!

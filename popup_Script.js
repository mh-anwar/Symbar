//This is the copy to clipboard function
console.log("POPUP SCRIPT RUNNING SIR!");
var clipboard = new ClipboardJS(".btn");

clipboard.on("success", function (e) {
  console.log(e);
});

clipboard.on("error", function (e) {
  console.log(e);
});
//Below is the code for the buttons within the dropdowns
document.getElementById("target").addEventListener("change", function () {
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

function openSettings() {
  window.open(
    "chrome-extension://ggciefihpaiebbpaonohfndmollfiglp/userOptions.html"
  );
}
//Options page opener
document.querySelector("#go-to-options").addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("userOptions.html"));
  }
});

//Come to the dark side, we use cookies!

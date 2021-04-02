//This is the copy to clipboard function
var clipboard = new ClipboardJS(".btn");

clipboard.on("success", function (e) {
  console.log(e);
});

clipboard.on("error", function (e) {
  console.log(e);
});

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

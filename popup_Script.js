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
var classes = document.getElementsByClassName("copyButton");
console.log(classes.length)
console.log(classes[0])
for (var i = 0; i < classes.length; i++) {
  //var to_Copy = classes[i].id;
  classes[i].addEventListener("click", function (e) {
    console.log("yaa");
    console.log(e)
    console.log(e.target.id)
    //const the_Id = document.getElementById("copyButton");
    //const to_Copy = the_Id.getAttribute("name");
    var to_Copy = e.target.id;
    navigator.clipboard.writeText(to_Copy);
  });

}

/* .then( function () { console.log("YES"); }, function () {
  alert("Hmm..There seems to be an issue on your end.");
 } ); */

//Come to the dark side, we use cookies!

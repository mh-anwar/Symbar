
console.log("Content Script is running, SIR!");
//Apr 05, 09:41pm [YIP]: the content script is sandboxed to within the screen

function addStuff(type, text) {
  var type = document.createElement(type);
  document.body.appendChild(type);
  type.innerHTML = text;
}
//HTML Injection (you should see a toolbar after you open it through the popup)
chrome.runtime.onMessage.addListener(gotMessage);
function gotMessage(message) {
  console.log(message);
  if (message === "turnToolbarOn") {
    var div = document.createElement(div);
    const style = document.createElement('style');
    div.className = "divr"
    div.setAttribute("id", "toolbar")
    document.body.appendChild(div);
    div.innerHTML = "<h1>HELLOW WORLD. Basic Toolbar<h1>";
    //var openCloseButton = document.createElement(button)
    //.setAttribute("id", "openCloseButton")
    //document.body.appendChild(openCloseButton)
  }
  if (message === "turnToolbarOff") {
    document.getElementById('toolbar').remove()
  }
}

//OLD CODE, DO NOT REMOVE!!!
//below is code to find the view port,DO NOT REMOVE
//DO NOT DELETE!
/* setInterval(viewPortChecker(), 3000);
  function viewPortChecker() {
    let elem = document.querySelector("div");
    let rect = elem.getBoundingClientRect();
    for (var key in rect) {
      if (typeof rect[key] !== "function") {
        let para = document.createElement("p");
        para.textContent = `${key} : ${rect[key]}`;
        document.body.appendChild(para);
        console.log("Hmph, this works");
      }
    }
  } */

//original code for HTML injection, DO NOT REMOVE
/* document.addEventListener("click", (e) => {
var div = document.createElement(div);
const style = document.createElement('style');
div.className = "divr"
document.body.appendChild(div);
div.innerHTML = "<h1>HELLOW WORLD. Basic Toolbar<h1>";
}); */

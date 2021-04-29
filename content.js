
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
  }
  if (message === "turnToolbarOff") {
    document.getElementById('toolbar').remove()
  }
}

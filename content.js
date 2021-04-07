console.log("Content Script is running, SIR!");
//Apr 05, 09:41pm [YIP]: the content script is sandboxed to within the screen

function addStuff(type, text) {
  var type = document.createElement(type);
  document.body.appendChild(type);
  type.innerHTML = text;
}

document.addEventListener("click", (e) => {
  var div = document.createElement(div);
  document.body.appendChild(div);
  //div.innerHTML = "<h1>HELLO WORLD.<h1>";
});

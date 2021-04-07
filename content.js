console.log("Content Script is running, SIR!");
//Apr 05, 09:41pm [YIP]: the content script is sandboxed to within the screen

function addStuff(type, text) {
  var type = document.createElement(type);
  document.body.appendChild(type);
  type.innerHTML = text;
}
//HTML Injection (you should see "HELLOW WORLD." at the bottom of a page)
document.addEventListener("click", (e) => {
  var div = document.createElement(div);
  document.body.appendChild(div);
  //div.innerHTML = "<h1>HELLO WORLD.<h1>";
});
/* setInterval(viewPortChecker(), 30000);
more html injection code, do not remove yet, in case we need it
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

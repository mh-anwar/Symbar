
console.log("Content Script is running, SIR!");
//Apr 05, 09:41pm [YIP]: the content script is sandboxed to within the screen

function addStuff(type, text) {
  var type = document.createElement(type);
  document.body.appendChild(type);
  type.innerHTML = text;
}
//HTML Injection (you should see "HELLOW WORLD." at the bottom of a page (after you click))

document.addEventListener("scroll", (e) => {
  var div = document.createElement(div);
  const style = document.createElement('style');
  div.className = "divr"
  document.body.appendChild(div);
  div.innerHTML = "<h1>HELLOW WORLD. Basic Toolbar<h1>";
});

//below is code to find the view port, may be needed for html injection
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
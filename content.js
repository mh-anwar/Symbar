console.log("Content Script is running, SIR!");

function addStuff(type, text) {
  var type = document.createElement(type);

  document.body.appendChild(type);

  type.innerHTML = text;
}

document.addEventListener("click", (e) => {
  var div = document.createElement(div);

  document.body.appendChild(div);

  div.innerHTML = "<h1>HELLOW WORLD.<h1>";
});

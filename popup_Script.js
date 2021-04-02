//This is the copy to clipboard function
var clipboard = new ClipboardJS('.btn');

clipboard.on('success', function (e) {
  console.log(e);
});

clipboard.on('error', function (e) {
  console.log(e);
});
console.log("Service Worker (a.k.a Background Script) is running SIR!");

chrome.runtime.onInstalled.addListener(() => {
    console.log('Add greeting page with tutorial here');
});
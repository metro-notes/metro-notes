// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log(tab);
    chrome.tabs.executeScript(null, {code:"displayOverlay()"});
});


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(null, {code:"displayOverlay()"});
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.cmd == "save") {
		localStorage.setItem('toggleKey', request.data.toggleKey);
	}

	if(request.cmd == "load") {
		sendResponse(localStorage.getItem('toggleKey'));
	}
});

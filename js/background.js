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

	if(request.cmd == "badge") {
		if(request.data.count > 0){
			chrome.browserAction.setBadgeText({'text': '' + request.data.count, 'tabId': sender.tab.id});
		}
	}
});


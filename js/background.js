// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(null, {code:'displayOverlay()'});
});

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.get('notes', function(res) {
		if(!res.notes) {
			chrome.storage.sync.set({ notes: {} });
		}
	});
});

chrome.extension.onMessage.addListener(
	function(message, sender, callback) {
		if(message.cmd == 'saveSettings') {
			chrome.storage.sync.set({ 
				settings: {
					toggleKey: message.data.toggleKey
				}
			});
		}

		if(message.cmd == 'loadSettings') {
			chrome.storage.sync.get('settings', function(res) {
				callback(res.settings);
			});
		}

		if(message.cmd == 'badge') {
			if(message.data.count > 0){
				chrome.browserAction.setBadgeText({'text': '' + message.data.count, 'tabId': sender.tab.id});
			}
		}

		if (message.cmd == 'loadNotes') {
			chrome.storage.sync.get('notes', function(res) {
				callback(res.notes[message.data.url]);
			});
		}

		if (message.cmd == 'saveNotes') {
			chrome.storage.sync.get('notes', function(res) {
				res.notes[message.data.url] = message.data.notes;
				chrome.storage.sync.set(res);
			});
		}
		return true;
	}
);


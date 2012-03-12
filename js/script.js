var overlaySelector = '#metro-notes-overlay';
var overlayObject = null;
var url = document.URL;     //Page URL
var lastzindex = 1;         //z-Index tracker to allow notes to properly overlap
var notes = new Array();    //Array of notes
var insertMode = false;

//Function call that toggles the overlay on the screen.
var displayOverlay = function() {
	overlayObject.slideToggle('fast');
	
	//if wrench items are still displayed when overlayObject hides, hide the wrench items so when the user pulls it down again, only "wrench" shows
	if($('#toggle-key-label').css('display') == 'block'){
		$('#reset').hide();
		$('#toggle-key-label').hide();
	}
};

//Inserts a new note based on the given noteObj and index.
//Only adds the note to the DOM (does not affect localStorage).
var insertNote = function(noteObj, index) {
    var note = $('<div class="metro-notes-note" id="metro-notes-note-' + index + '"><div id="delete-' + index + '" class="delete options"></div><div id="handle-' + index + '"></div><p></p></div>');
    //Append the note contents into the inner <p> tag of the new <div>
    note.children('p').append(noteObj.note);
	note.children('#handle-' + index).append('<img src="' + chrome.extension.getURL('icons/pin.png') + '" class="handle" title="Move this note." />');
	note.children('#delete-' + index).append('<img src="' + chrome.extension.getURL('icons/trash.png') + '" class="trash" title="Delete this note." />');
	note.children('#delete-' + index).hide();
    //Update location and size based on noteObj
    note.css({
        'top': noteObj.top,
        'left': noteObj.left,
        'width': noteObj.width,
        'height': noteObj.height
    });
    
    //Assign drag and dragend event handlers
	note.drag(function(ev, dd){
		$(this).css({
			top: dd.offsetY,
			left: dd.offsetX
		});
	}, {
        'handle': '.handle'
    });

	//Function called when an element is dropped after dragging.
	//Updates the elements new x, y location in localStorage
	note.on('dragend', function() {
		var tar = $(this);
		noteObj = {
			'note': tar.text(),
		'top': tar.css('top'),
		'left': tar.css('left'),
		'width': tar.css('width'),
		'height': tar.css('height')
		};
		updateNote(tar.attr('id').replace('metro-notes-note-', ''), noteObj);
	});
	
	//Delete notes when delte is clicked.
	note.on('click', '.delete', function() {
		deleteNote($(this).prop('id').replace('delete-', ''));
	});

    overlayObject.append(note);
	//console.log("note created");
    return note;
};

//Update an existing note based on its index to match the given noteObj
var updateNote = function(index, noteObj) {
    $('#metro-notes-' + index).text(noteObj.note);
    $('#metro-notes-note-' + index).css({
        'top': noteObj.top,
        'left': noteObj.left,
        'width': noteObj.width,
        'height': noteObj.height
    });
    notes[index] = noteObj;
    localStorage.setItem(url, JSON.stringify(notes));
};

//Delete the note specified by the given index
//Removes it from the DOM and removes it from the localStorage
var deleteNote = function(index) {
    $('#metro-notes-note-' + index).remove();
    notes[index] = '';
    localStorage.setItem(url, JSON.stringify(notes));
	
	//console.log("note deleted");
};

//logic to set key
 var getToggleKey = function(e){
		 //console.log(e);
	 if(e.which === 16 || e.which === 17 || e.which === 18 || e.which === 91 || e.which === 92) {
		 $('body').one('keydown', getToggleKey);
		 return false;
	 }
	 var text = '';
	 if(e.altKey)
		 text += 'alt+';
	 if(e.ctrlKey)
		 text += 'ctrl+';
	 if(e.metaKey)
		 text += 'meta+';
	 if(e.shiftKey)
		 text += 'shift+';

	 //need alternative method to this, '.' shows up as '3/4' symbol
	 text += getCharDesc(e.which).toLowerCase();
	 saveSetting(text);
	 //localStorage.setItem('toggleKey', text);
	 $('#toggle-key').data('click-count', false);
	 $('#toggle-key').text(text);
	 loadCurrentSetting();
	 return false;
 }

//loads default settings on first execution
var loadDefaultSetting = function(){
	//console.log("load default settings");
	saveSetting('');
	//localStorage.setItem('toggleKey', '');
	$('#toggle-key').text('');
	
	//not working
	$(document).unbind('keydown');
};

//loads at start of every execution except for first
var loadCurrentSetting = function(){
	//console.log("load current settings");
	loadSetting(function(key) {
		//var key = localStorage.getItem('toggleKey');
		if(!key) {
			loadDefaultSetting();
		}
		//key = localStorage.getItem('toggleKey');
		if(key === '') {
			return;
		}
		$('#toggle-key').text(key);
		$(document).unbind('keydown');
		$(document).bind('keydown', key, displayOverlay);
	});
};

var getCharDesc = function(char_code)
{
	var specialKeys = {
		8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
		20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
		37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
		96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
		104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
		112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
		120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 188: ",", 190: ".",
		191: "/", 224: "meta"
	};
	//console.log(char_code);
	return specialKeys[char_code] ? specialKeys[char_code] : String.fromCharCode(char_code);
}

var saveSetting = function(toggleKey) {
	chrome.extension.sendRequest({cmd: "save", data: {'toggleKey': toggleKey }});
} 

var loadSetting = function(func) {
	chrome.extension.sendRequest({cmd: "load"}, func);
}

//Execute on every page load.
var init = function() {
	//Insert the overlay object into the page then hide it.
	$('body').append('<div id="metro-notes-overlay"></div>');
	overlayObject = $(overlaySelector);
	overlayObject.hide();

	overlayObject.append('<div id="instant_issue">Sorry...Metro Notes does not work well with Google Instant. We are investigating a fix...</div>');
	overlayObject.append("<div class='wrench' id='wrench'>wrench</div>");
	overlayObject.append("<div class='wrench' id='toggle-key-label'>toggle key<span id='toggle-key'></span></div>");
	overlayObject.append("<div class='wrench' id='reset'>reset</div>");

	$('#instant_issue').hide();
	$('#toggle-key-label').hide();
	$('#reset').hide();
		
	loadCurrentSetting();

	//If there is a URL, get the list of notes from the localStorage
	if(url.length) {
		var arr = localStorage.getItem(url);
		//If notes exist, for each one, insert it into the page.
		if(arr !== null) {
			notes = JSON.parse(arr);
			note_arr = [];
			for (var i in notes) {
				if(notes[i] !== '') {
					note_arr.push(notes[i]);
					insertNote(note_arr[note_arr.length-1], note_arr.length-1);
				}
			}
			notes = note_arr;
			chrome.extension.sendRequest({cmd: "badge", data: {'count': notes.length }});
			localStorage.setItem(url, JSON.stringify(notes));
		}
	}

	//If clicked, insert a new note at the page that was clicked.
	overlayObject.on('click', function (e) {
		//console.log(url);
		var ajax_url = document.URL;     //Page URL #Necessary cos Ajax

		if(ajax_url.indexOf('#') !== -1 && (ajax_url.indexOf('www.google.com/search') !== -1 || ajax_url.indexOf('www.google.com/webhp' !== -1))) {
			$('#instant_issue').show();
			return false;
		}

		//If in insert mode, first exit insert mode, before inserting a new note.
		if(insertMode){
			insertMode = false;
			return false;
		}
		noteObj = {'note': '', 'top': e.offsetY, 'left': e.offsetX, 'width': '150px', 'height': '125px'};
		insertNote(noteObj, notes.length).children('p').prop('contentEditable', true).focus();
		insertMode = true;
		return false;
	});

	//Clicking on the note should make its children editable (especially now we have the drag handlers)
	overlayObject.on('click', '.metro-notes-note', function () {
		$(this).children('p').prop('contentEditable', 'true').focus();
		insertMode = true;
		return false;
	});

	//On mouseover, bring the note to the front
	overlayObject.on('mouseover', '.metro-notes-note', function () {
		$(this).css('zIndex', lastzindex);
		lastzindex++;
	});

	//When the note loses focus, and it has data, save it.
	overlayObject.on('blur', '.metro-notes-note > p', function () {
		var note = $(this).text();
		//If the note is empty, delete it.
		if($.trim(note) === '') {
			try {
				deleteNote($(this).parent('.metro-notes-note').attr('id').replace('metro-notes-note-', ''));
			} catch (e) { console.log(e); }
		} else {
			var tar = $(this).parent('.metro-notes-note');
			noteObj = {
				'note': tar.text(),
		'top': tar.css('top'),
		'left': tar.css('left'),
		'width': tar.css('width'),
		'height': tar.css('height')
			};
			updateNote(tar.attr('id').replace('metro-notes-note-', ''), noteObj);
			$(this).prop('contentEditable', 'false');
		}
		return false;
	});

	$('#wrench').on('click',function(e){
		//console.log("wrench clicked");
		$('#reset').slideToggle('fast');
		$('#toggle-key-label').slideToggle('fast');
		$('.options').slideToggle('fast');
		return false;
	});
	
	$('#reset').on('click', function(){
		//console.log("resetting...");
		loadDefaultSetting();
		
		return false;
	});

	//on click, user is prompted to set toggle key
	//If the user clicks again, nothing is changed
	$('#toggle-key-label').on('click', function(e){
		if($('#toggle-key').data('click-count') === true) {
			$('#toggle-key').data('click-count', false);
			loadSetting(function(key) {
				console.log(key);
				$('#toggle-key').text(key);
			});	
			$('body').off('keydown', getToggleKey);
		} else {
			//console.log("toggle clicked, waiting for user to hit key");
			$('#toggle-key').data($('#toggle-key').text());
			$('#toggle-key').data('click-count', true);
			$('#toggle-key').text('new hotkey...');
			$('body').one('keydown', getToggleKey);
		}
		return false;
	});
};

init();

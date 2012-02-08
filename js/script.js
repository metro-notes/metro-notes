var overlaySelector = '#metro-notes-overlay';
var overlayObject = null;
var url = document.URL;     //Page URL
var lastzindex = 1;         //z-Index tracker to allow notes to properly overlap
var notes = new Array();    //Array of notes
var insertMode = false;

//Function call that toggles the overlay on the screen.
var displayOverlay = function() {
	overlayObject.slideToggle('fast');
}

//Handles moving the element whenn it is dragged
var drag = function(ev, dd){
    $(this).css({
        top: dd.offsetY,
        left: dd.offsetX
    });
};

//Function called when an element is dropped after dragging.
//Updates the elements new x, y location in localStorage
var dragend = function() {
    var tar = $(this);
    noteObj = {
        'note': tar.text(),
        'top': tar.css('top'),
        'left': tar.css('left'),
        'width': tar.css('width'),
        'height': tar.css('height')
    };
    updateNote(tar.attr('id').replace('metro-notes-note-', ''), noteObj);
};

//Inserts a new note based on the given noteObj and index.
//Only adds the note to the DOM (does not affect localStorage).
var insertNote = function(noteObj, index) {
    var note = $('<div class="metro-notes-note" id="metro-notes-note-' + index + '"><div class="handle"><div class="delete" id="delete-' + index + '"></div></div><p></p></div>');
    //Append the note contents into the inner <p> tag of the new <div>
    note.children('p').append(noteObj.note);
    //Update location and size based on noteObj
    note.css({
        'top': noteObj.top,
        'left': noteObj.left,
        'width': noteObj.width,
        'height': noteObj.height
    });
    
    //Assign drag and dragend event handlers
    note.drag(drag, {
        'handle': '.handle'
    });
    note.on('dragend', dragend);
	
	//Delete notes when delte is clicked.
	note.on('click', '.delete', function() {
		console.log('delete');
		deleteNote($(this).attr('id').replace('delete-', ''));
	});

    overlayObject.append(note);
	console.log("note created");
    return note;
}

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
}

//Delete the note specified by the given index
//Removes it from the DOM and removes it from the localStorage
var deleteNote = function(index) {
    $('#metro-notes-note-' + index).remove();
    notes[index] = '';
    localStorage.setItem(url, JSON.stringify(notes));
	
	console.log("note deleted");
}

var setToggleString = function(){
}

//logic to set key
var getToggleKey = function(e){
	localStorage.setItem('toggleKey', String.fromCharCode(e.which).toLowerCase());
	loadCurrentSetting();
	$('toggle-key').text(String.fromCharCode(e.which).toLowerCase());
	console.log(e);
	return false;
}


//loads default settings on first execution
var loadDefaultSetting = function(){
	localStorage.setItem('toggleKey', '');	
}

//loads at start of every execution except for first
var loadCurrentSetting = function(){
	var key = localStorage.getItem('toggleKey');
	$('#toggle-key').text(key);
	$(document).unbind('keydown');
	$(document).bind('keydown', key, displayOverlay);
}

//saves current setting into localStorage
var saveCurrentSetting = function(toggleKey){
	localStorage.setItem('toggleKey', toggleKey);
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

	$('#instant_issue').hide();
		
	loadCurrentSetting();

	//If there is a URL, get the list of notes from the localStorage
	if(url.length) {
		var arr = localStorage.getItem(url);
		//If notes exist, for each one, insert it into the page.
		if(arr != null) {
			notes = JSON.parse(arr);
			note_arr = [];
			for (var i in notes) {
				if(notes[i] !== '') {
					note_arr.push(notes[i]);
					insertNote(note_arr[note_arr.length-1], note_arr.length-1);
				}
			}
			notes = note_arr;
			localStorage.setItem(url, JSON.stringify(notes));
		}
	}

	//If clicked, insert a new note at the page that was clicked.
	overlayObject.on('click', function (e) {
		console.log(url);
		var url = document.URL;     //Page URL
		if(url.indexOf('#') != -1 && (url.indexOf('www.google.com/search') != -1 || url.indexOf('www.google.com/webhp' != -1))) {
			$('#instant_issue').show();
			return;
		}

		//If in insert mode, first exit insert mode, before inserting a new note.
		if(insertMode){
			insertMode = false;
			return false;
		}
		noteObj = {'note': '', 'top': e.offsetY, 'left': e.offsetX, 'width': '150px', 'height': '125px'};
		insertNote(noteObj, notes.length).children('p').prop('contentEditable', true).focus();
		insertMode = true;
	});

	//Clicking on the note should make its children editable (especially now we have the drag handlers)
	overlayObject.on('click', '.metro-notes-note', function () {
		$(this).children('p').prop('contentEditable', 'true').focus();
		insertMode = true;
		return false;
	});

	//On mouseover, bring the note to the front
	overlayObject.on('mouseover', '.metro-notes-note', function () {
		$(this).css('zIndex', lastzindex++);
	});

	//When the note loses focus, and it has data, save it.
	overlayObject.on('blur', '.metro-notes-note > p', function () {
		var note = $(this).text();
		//If the note is empty, delete it.
		if($.trim(note) == '') {
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

	//Delete notes when delete is clicked.
	$('.delete').on('click', function() {
		console.log("delete box clicked");
		deleteNote($(this).attr('id').replace('delete-', ''));
	});

	$('#wrench').on('click',function(e){
		console.log("wrench clicked");
		$('#toggle-key-label').slideToggle('fast');
		$('toggle-key').slideToggle('fast');
		return false;
	});

	//on click, user is prompted to set toggle key
	$('#toggle-key-label').on('click', function(e){
		console.log("toggle clicked, waiting for user to hit key");
		$('#toggle-key').text('new hotkey...');
		$('body').one('keydown', getToggleKey);
		return false;
	});
}

init();

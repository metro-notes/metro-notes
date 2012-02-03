//Function call that toggles the overlay on the screen.
var displayOverlay = function() {

	if($(overlaySelector).css('display') == 'none'){
		$('#hit-some-key').hide();
		$('#toggle-key').hide();
		$('#toggle-key-label').hide();
		
		loadSetting();
	}
	
	overlayObject.slideToggle('fast');
}

//desperate. this is probably bad idea
//need to investigate better way, integrate into displayOverlay()? 
//has to load settings on every page, otherwise toggle key will not be recognized
$(document).ready(function(){

	loadSetting();
	$('body').on('keydown', toggleListener);
});



var loadSetting = function(){
	
	if(localStorage['current'])
		loadCurrentSetting();
	else
		loadDefaultSetting();
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

//this function is never used
//Create a brand new note by:
//  Adding it to the DOM
//  Putting it in the live note Array
//  Reserving an id for it and
//  putting it in localStorage
var createNote = function(noteObj) {
    insertNote(noteObj, notes.length);
    notes.push(noteObj);
    localStorage.setItem(url, JSON.stringify(notes));

	
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

//Execute on every page load.
var overlaySelector = '#metro-notes-overlay';

//Insert the overlay object into the page then hide it.
$('body').append('<div id="metro-notes-overlay"></div>');
var overlayObject = $(overlaySelector);
overlayObject.hide();

var url = document.URL;     //Page URL
console.log(url);
if(url.indexOf('www.google.com') != -1) {
	overlayObject.append('<div id="instant_issue">Sorry...Metro Notes does not work well with Google Instant. We are investigating a fix...</div>');
	console.log('AUGH');
	//insert warning about google instant
}

var lastzindex = 1;         //z-Index tracker to allow notes to properly overlap
var notes = new Array();    //Array of notes
var insertMode = false;

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
	$('#hit-some-key').hide('fast');
	$('body').off('keydown', getToggleKey);
	
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





//TODO
//need to display what hot key is selected
$(overlaySelector).append("<div class='wrench' id='wrench'>wrench</div>");
$(overlaySelector).append("<div class='wrench' id='toggle-key-label'>toggle key<span id='toggle-key'></span><span id='hit-some-key'>hit some keys please</span></div>");


$('#hit-some-key').hide();

$('body').on('keydown', toggleListener);

$('#wrench').on('click',function(e){
	console.log("wrench clicked");
	//#toggle-key-label has to appear first otherwise showing the other elements does jack
	$('#toggle-key-label').slideToggle('fast');
	
	setToggleString();
	if(toggleString.length){
		$('toggle-key').text(toggleString);
	}
	else{
		$('toggle-key').text("click me to set toggle key");
	}
	
	$('toggle-key').slideToggle('fast');

	
	
	
	//TODO
	//if wrench is clicked again while toggle listener is active, disable toggle listener
	//how to check if event is running
	return false;
	//e.stopPropagation();
});

//on click, user is prompted to set toggle key
$('#toggle-key-label').on('click', function(e){

	
	console.log("toggle clicked, waiting for user to hit key");
	
	$('#hit-some-key').slideToggle('fast');	//slide animation?
	
	if($('#hit-some-key').css('display') == 'inline'){
		console.log("execute getToggleKey()");
		$('body').on('keydown', getToggleKey);
	}
	else{ 
		console.log("kill getToggleKey()");
		$('body').off('keydown', getToggleKey);
	}
	
	//returning false to stop propagation and creating a note
	return false;
	//e.stopPropagation();
});


//waits to check if toggle key is hit to display overlay
var toggleListener = function(e){
	//TODO
	//need to fix single key
	var toggleHit = false;
	
	console.log(e.which + " is hit, waiting for toggle key: " + toggleKey);
	//console.log("toggleKey: " + toggleKey);
	//console.log("modKey: " + modKey);
	
	if(e.which == toggleKey && e.ctrlKey){
		console.log("ctrl " + e.which + " is hit");
		toggleHit = true;
	}
	else if(e.which == toggleKey && e.altKey){
		console.log("alt " + e.which + " is hit");
		toggleHit = true;
	}
	else if(e.which == toggleKey && e.cmdKey){
		console.log("cmd " + e.which + " is hit");
		toggleHit = true;
	}
	else if(e.which == toggleKey && modKey == undefined){
		toggleHit = true;	
		console.log(e.which + " is hit");
	}
	
	if(toggleHit){
		console.log("hit toggle key");
		displayOverlay();
	}
	
}

var modKey = null;
var toggleKey = null;
var toggleString = null;

var setToggleString = function(){
	
	var toggleKeyString = String.fromCharCode(toggleKey).toLowerCase();
	var modKeyString = null;
	switch(modKey){
		case 17:
			modKeyString = "ctrl";
			break;
		case 18:
			modKeyString = "alt";
			break;
		case 91:
			modKeyString = "cmd";
			break;
		default:
			modKeyString = "";
			break;
	}

	
	if(modKeyString.length){
		toggleString = modKeyString + " + " + toggleKeyString;
	}
	else{
		toggleString = toggleKeyString;
	}
	
	toggleString = "meow meow";
	
	return false;
}

//logic to set key
var getToggleKey = function(e){
	//TODO
	//add case for shift key
	if(e.ctrlKey && e.which != 17){
		console.log("ctrl " + e.which + " is saved");
		modKey = 17;
		toggleKey = e.which;
	}
	else if(e.altKey && e.which != 18){
		console.log("alt " + e.which + " is saved");
		modKey = 18;
		toggleKey = e.which;
	}
	else if(e.metaKey && e.which != 91){
		console.log("cmd " + e.which + " is saved");
		modKey = 91;
		toggleKey = e.which;
	}
	else if(!e.ctrlKey && !e.altKey && !e.metaKey ){
		console.log(e.which + " is saved");
		modKey = undefined;
		toggleKey = e.which;
	}
	
	$('body').on('keyup', function(){
		setToggleString();
		console.log(toggleString);
		$('toggle-key').text(toggleString);
		$('toggle-key').show('fast');
		$('#hit-some-key').hide('fast');
		
		$('body').off('keydown', getToggleKey);
		return false;
	});
	
	//$('#toggle-key-label').off('click');
	saveCurrentSetting();
	
	return false;
}


//loads default settings on first execution
var loadDefaultSetting = function(){
	console.log("loading default settings");
	
	localStorage['toggle-key'] = undefined;
	localStorage['mod-key'] = undefined;
	toggleKey = localStorage['toggle-key'];
	modKey = localStorage['mod-key'];
	
	return false;
}

//loads at start of every execution except for first
var loadCurrentSetting = function(){
	console.log("loading current settings");
	if(localStorage['mod-key'])
		modKey = localStorage['mod-key'];
	
	toggleKey = localStorage['toggle-key'];
}

//saves current setting into localStorage
var saveCurrentSetting = function(){
	console.log("saving current settings");
	//loads default unless settings have been changed
	localStorage['current'] = true;
	localStorage['mod-key'] = modKey;
	localStorage['toggle-key'] = toggleKey;
		
	return false;
}

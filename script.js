//Fucntion call that toggles the overlay on the screen.
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
    if($(this).children('p').attr('contentEditable')) return;
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
    var note = $('<div class="metro-notes-note" id="metro-notes-note-' + index + '"><div class="handle"></div><p></p></div>');
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
    //TODO: Maybe replace with on() and live()?
    note.drag(drag, {
        'handle': '.handle'
    });
    note.on('dragend', dragend);

    overlayObject.append(note);
    return note;
}

var disableInsertMode = function() {
    insertMode = false;
}

var enableInsertMode = function(target) {
    insertMode = true;
}

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
}

//Execute on every page load.
var overlaySelector = '#metro-notes-overlay';
//Insert the overlay object into the page then hide it.
$('body').append('<div id="metro-notes-overlay"></div>');
var overlayObject = $(overlaySelector);
overlayObject.hide();
var url = document.URL;     //Page URL
var lastzindex = 1;         //z-Index tracker to allow notes to properly overlap
var notes = new Array();    //Array of notes
var insertMode = false;

//If there is a URL, get the list of notes from the localStorage
if(url.length) {
    var arr = localStorage.getItem(url);
    //If notes exist, for each one, insert it into the page.
    if(arr != null) {
        notes = JSON.parse(arr);
        for (var i in notes) {
            if(notes[i] !== '') {
                insertNote(notes[i], i);
            }
        }
    }
}

//If clicked, insert a new note at the page that was clicked.
overlayObject.on('click', function (e) {
    //If in insert mode, first exit insert mode, before inserting a new note.
    if(insertMode){
        disableInsertMode();
        return false;
    }
    noteObj = {'note': '', 'top': e.offsetY, 'left': e.offsetX, 'width': '200px', 'height': '200px'};
    insertNote(noteObj, notes.length).children('p').prop('contentEditable', true).focus();
    enableInsertMode(notes.length);
});

//When an existing note's text is clicked, set it as ediable and focus on it.
//This forces focus away from other elements, forcing them to blur.
$('.metro-notes-note > p').on('click', function () {
    $(this).attr('contentEditable', 'true').focus();
    enableInsertMode($(this).parent());
    return false;
});

//When clicking on the note makes the children uneditable.
//TODO: Clicking on the note should make its children editable (especially now we have the drag handlers)
overlayObject.on('click', '.metro-notes-note', function () {
    $('.metro-notes-note').children('p').attr('contentEditable', 'true');
    disableInsertMode();
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
        deleteNote($(this).parent('.metro-notes-note').attr('id').replace('metro-notes-note-', ''));
	console.log("delete me");
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
        $(this).attr('contentEditable', 'false');
    }
    return false;
});

//TODO 
//make this user customizable
var toggle_key = 27		//ESC key
$('body').keyup(function(e){
	if(e.which == toggle_key){
		console.log("ESC key hit!");
		displayOverlay();
	}
	return false;
})

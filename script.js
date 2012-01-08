var displayOverlay = function() {
    overlayObject.slideToggle('fast');
}

var insertNote = function(noteObj, index) {
    var note = $('<div class="metro-notes-note" id="metro-notes-note-' + index + '"></div>');
    note.append(noteObj.note);
    note.css({
        'top': noteObj.top,
        'left': noteObj.left,
        'width': noteObj.width,
        'height': noteObj.height
    });
    note.drag(function(ev, dd){
        $(this).css({
            top: dd.offsetY,
            left: dd.offsetX
        });
    });
    note.on('dragend', function() {
        var tar = $(this);
        noteObj = {
            'note': tar.text(),
            'top': tar.css('top'),
            'left': tar.css('left'),
            'width': tar.css('width'),
            'height': tar.css('height')
        };
        updateNote(index, noteObj);
    });

    overlayObject.append(note);
    return note;
}

var createNote = function(noteObj) {
    insertNote(noteObj, notes.length);
    notes.push(noteObj);
    localStorage.setItem(url, JSON.stringify(notes));
}

var updateNote = function(index, noteObj) {
    $('#metro-notes-' + index).text(noteObj.note).css({
        'top': noteObj.top,
        'left': noteObj.left,
        'width': noteObj.width,
        'height': noteObj.height
    });
    notes[index] = noteObj;
    localStorage.setItem(url, JSON.stringify(notes));
}

var deleteNote = function(index) {
    $('#metro-notes-' + index).remove();
    notes[index] = '';
    localStorage.setItem(url, JSON.stringify(notes));
}

var overlaySelector = '#metro-notes-overlay';
$('body').append('<div id="metro-notes-overlay"></div>');
var overlayObject = $(overlaySelector);
overlayObject.hide();
var url = document.URL;
var lastzindex = 1;
var notes = new Array();
var insideElement = false;

if(url.length) {
    var arr = localStorage.getItem(url);
    if(arr != null) {
        notes = JSON.parse(arr);
        for (var i in notes) {
            if(notes[i] !== '') {
                insertNote(notes[i], i);
            }
        }
    }
}

overlayObject.on('click', function (e) {
    if(insideElement){
        insideElement = false;
        return false;
    }
    noteObj = {'note': '', 'top': e.offsetY, 'left': e.offsetX, 'width': '200px', 'height': '200px'};
    insertNote(noteObj, notes.length).prop('contentEditable', true).focus();
    insideElement = true;
});

overlayObject.on('click', '.metro-notes-note', function () {
    console.log('here');
    console.log($(this).attr('contentEditable'));
    $(this).attr('contentEditable', 'true').focus();
    insideElement = true;
    return false;
});

overlayObject.on('mouseover', '.metro-notes-note', function () {
    $(this).css('zIndex', lastzindex++);
});

overlayObject.on('blur', '.metro-notes-note', function () {
    var note = $(this).text();
    if($.trim(note) == '') {
        deleteNote($(this).attr('id').replace('metro-notes-note-', ''));
    } else {
        var tar = $(this);
        noteObj = {
            'note': tar.text(),
            'top': tar.css('top'),
            'left': tar.css('top'),
            'width': tar.css('width'),
            'height': tar.css('height')
        };
        updateNote($(this).attr('id').replace('metro-notes-note-', ''), noteObj);
        $(this).attr('contentEditable', 'false');
    }
    return false;
});

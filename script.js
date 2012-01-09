var displayOverlay = function() {
    overlayObject.slideToggle('fast');
}

var drag = function(ev, dd){
        $(this).css({
            top: dd.offsetY,
            left: dd.offsetX
        });
    };

var insertNote = function(noteObj, index) {
    var note = $('<div class="metro-notes-note" id="metro-notes-note-' + index + '"><p></p></div>');
    note.children('p').append(noteObj.note);
    note.css({
        'top': noteObj.top,
        'left': noteObj.left,
        'width': noteObj.width,
        'height': noteObj.height
    });
    
    note.on('drag', drag);
    note.children('p').on('drag', function() {});

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

    overlayObject.append(note);
    return note;
}

var createNote = function(noteObj) {
    insertNote(noteObj, notes.length);
    notes.push(noteObj);
    localStorage.setItem(url, JSON.stringify(notes));
}

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
var insertMode = false;

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
    if(insertMode){
        insertMode = false;
        return false;
    }
    noteObj = {'note': '', 'top': e.offsetY, 'left': e.offsetX, 'width': '200px', 'height': '200px'};
    insertNote(noteObj, notes.length).children('p').prop('contentEditable', true).focus();
    insertMode = false;
});

overlayObject.on('click', '.metro-notes-note > p', function () {
   if ($(this).attr('contentEditable') != true) {
        $(this).attr('contentEditable', 'true').focus();
    }
    insertMode = true;
    console.log('clicking on p');
    return false;
});

overlayObject.on('click', '.metro-notes-note', function () {
    $('.metro-notes-note').children('p').attr('contentEditable', 'false');
    insertMode = false;
    console.log('clicking on note');
    return false;
});

overlayObject.on('mouseover', '.metro-notes-note', function () {
    $(this).css('zIndex', lastzindex++);
});

overlayObject.on('blur', '.metro-notes-note > p', function () {
    var note = $(this).text();
    if($.trim(note) == '') {
        deleteNote($(this).parent('.metro-notes-note').attr('id').replace('metro-notes-note-', ''));
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

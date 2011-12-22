var displayOverlay = function() {
    overlayObject.slideToggle('fast');
}

var insertNote = function(noteObj) {
    var note = $('<div class="metro-notes-note"></div>');
    note.append('<p>' + noteObj.note + '</p>');
    note.css('top', noteObj.top);
    note.css('left', noteObj.left);
    overlayObject.append(note);
}

var createNote = function(note, top, left) {
    notes.push({'note': note, 'top': top, 'left': left});
    localStorage.setItem(url, JSON.stringify(notes));
}

var overlaySelector = '#metro-notes-overlay';
$('body').append('<div id="metro-notes-overlay"></div>');
var overlayObject = $(overlaySelector);
overlayObject.hide();
var url = document.URL;
var notes = new Array();
var insideElement = false;

if(url.length) {
    var arr = localStorage.getItem(url);
    if(arr != null) {
        notes = JSON.parse(arr);
        for (var i in notes) {
            insertNote(notes[i]);
        }
    }
}

overlayObject.on('click', function (e) {
    if(insideElement){
        insideElement = false;
        return false;
    }
    console.log(e);
    var note = $('<div class="metro-notes-note" contentEditable="true"></div>');
    note.css('top', e.offsetY);
    note.css('left', e.offsetX);
    overlayObject.append(note);
    note.focus();
    insideElement = true;
});

overlayObject.on('click', '.metro-notes-note', function () {
    $(this).attr('contentEditable', 'true');
    insideElement = true;
    return false;
});

overlayObject.on('blur', '.metro-notes-note', function () {
    var note = $(this).text();
    if($.trim(note) == '') {
        $(this).remove();
    } else {
        createNote(note, $(this).css('top'), $(this).css('left'));
        $(this).attr('contentEditable', 'false');
    }
    return false;
});

var displayOverlay = function() {
    overlayObject.slideToggle('fast');
}

var insertNote = function(note) {
    overlayObject.append('<div class="metro-notes-note"><p>note</p></div>');
}

var createNote = function(note) {
    notes.push(note);
    localStorage.setItem(url, JSON.stringify(notes));
}

var overlaySelector = '#metro-notes-overlay';
$('body').append('<div id="metro-notes-overlay"></div>');
var overlayObject = $(overlaySelector);
overlayObject.hide();
var url = document.URL;
var notes = new Array();

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
    console.log(e);
    var note = $('<div class="metro-notes-note" contentEditable="true"></div>');
    note.css('top', e.offsetY);
    note.css('left', e.offsetX);
    overlayObject.append(note);
});

overlayObject.on('click', '.metro-notes-note', function () {
    $(this).attr('contentEditable', 'true');
    return false;
});

overlayObject.on('blur', '.metro-notes-note', function () {
    var note = $(this).text();
    if($.trim(note) == '') {
        $(this).remove();
    } else {
        createNote(note);
        $(this).attr('contentEditable', 'false');
    }
    return false;
});

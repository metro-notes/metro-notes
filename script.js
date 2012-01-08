var displayOverlay = function() {
    overlayObject.slideToggle('fast');
}

var insertNote = function(noteObj, index) {
    var note = $('<div class="metro-notes-note" id="metro-notes-note-' + index + '"></div>');
    note.append(noteObj.note);
    note.css('top', noteObj.top);
    note.css('left', noteObj.left);
    note.drag(function( ev, dd ){
        $( this ).css({
            top: dd.offsetY,
            left: dd.offsetX
        });
    });
    overlayObject.append(note);
}

var createNote = function(note, id, top, left) {
    if(parseInt(id.replace('metro-notes-note-', '')) >= notes.length) {
        notes.push({'note': note, 'top': top, 'left': left});
        localStorage.setItem(url, JSON.stringify(notes));
    }
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
            insertNote(notes[i], i);
        }
    }
}

overlayObject.on('click', function (e) {
    if(insideElement){
        insideElement = false;
        return false;
    }
    console.log(e);
    var note = $('<div class="metro-notes-note" id="metro-notes-note-' + notes.length + '" contentEditable="true"></div>');
    note.css('top', e.offsetY);
    note.css('left', e.offsetX);
    note.drag(function( ev, dd ){
        $( this ).css({
            top: dd.offsetY,
            left: dd.offsetX
        });
        $(this).css();
    });
    overlayObject.append(note);
    note.focus();
    insideElement = true;
});

overlayObject.on('click', '.metro-notes-note', function () {
    $(this).attr('contentEditable', 'true');
    insideElement = true;
    return false;
});

overlayObject.on('mouseover', '.metro-notes-note', function () {
    $(this).css('zIndex', lastzindex++);
});

overlayObject.on('blur', '.metro-notes-note', function () {
    var note = $(this).text();
    if($.trim(note) == '') {
        $(this).remove();
    } else {
        createNote(note, $(this).attr('id'), $(this).css('top'), $(this).css('left'));
        $(this).attr('contentEditable', 'false');
    }
    return false;
});

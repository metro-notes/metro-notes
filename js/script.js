var overlaySelector = '.metro-notes-overlay';
var overlayObject   = null;
var url             = document.URL;     //Page URL
var lastzindex      = 1;                //z-Index tracker to allow notes to properly overlap
var notes           = [];               //Array of notes
var insertMode      = false;

//Function call that toggles the overlay on the screen.
var displayOverlay = function() {
    overlayObject.slideToggle('fast');
    $('.options').hide();
};

/**
    Inserts a new note based on the given noteObj and index.
    Only adds the note to the DOM (does not affect storage).
    noteObj: The note to be inserted.
    index: The index of the note in the storage.
*/
var insertNote = function(noteObj, index) {
    var note = $(
        '<div class="metro-notes-note" id="metro-notes-note-' + index + '">' +
            '<div id="delete-' + index + '" class="delete"></div>' +
            '<div id="handle-' + index + '" class="handle"></div>' +
            '<div class="note-text"><p></p></div>' +
        '</div>');
    overlayObject.append(note);

    //Update location and size based on noteObj
    note.css({
        'top': noteObj.top,
        'left': noteObj.left
    });

    //Append the note contents into the inner <p> tag of the new <div>
    note.find('#delete-' + index).append('<img src="' + chrome.extension.getURL('icons/trash.png') + '" title="Delete this note." />');
    note.find('p').append(noteObj.note);

    //Assign drag and dragend event handlers
    note.draggable({
        'handle': '.handle',
        stop: function(e, ui) {
            var tar = $(this);
            noteObj = {
                'note': tar.text(),
                'top': ui.position.top,
                'left': ui.position.left
            };
            updateNote(noteObj, tar.attr('id').replace('metro-notes-note-', ''));
        }
    });

    note.on('resize', function() {
        var tar = $(this);
        noteObj = {
            'note': tar.text(),
            'top': tar.css('top'),
            'left': tar.css('left')
        };
        updateNote(noteObj, tar.attr('id').replace('metro-notes-note-', ''));
    });

    //Delete notes when delete is clicked.
    note.on('click', '.delete', function() {
        deleteNote($(this).prop('id').replace('delete-', ''));
    });

    return note;
};

/**
    Update an existing note based on its index to match the given noteObj.
    noteObj: The note being editing.
    index: The index of the note object.
*/
var updateNote = function(noteObj, index) {
    $('#metro-notes-' + index).text(noteObj.note);
    $('#metro-notes-note-' + index).css({
        'top': noteObj.top,
        'left': noteObj.left
    });
    notes[index] = noteObj;
    saveNotes(url, notes);
};

/**
    Delete the note specified by the given index
    Removes it from the DOM and removes it from the storage.
*/
var deleteNote = function(index) {
    $('#metro-notes-note-' + index).remove();
    notes[index] = '';
    saveNotes(url, notes);
};

var loadSettings = function() {
    chrome.extension.sendMessage({cmd: 'loadSettings'}, function(settings) {
        if (settings) {
            if(!settings.toggleKey || settings.toggleKey === '') {
                $('.toggle-key').text('');
                Mousetrap.reset();
            } else {
                $('.toggle-key').text(settings.toggleKey);
                Mousetrap.reset();
                Mousetrap.bind(settings.toggleKey, displayOverlay);
            }
        }
    });
};

var saveSettings = function(toggleKey) {
    chrome.extension.sendMessage({cmd: 'saveSettings', data: {toggleKey: toggleKey }});
    loadSettings();
};

//If there is a URL, get the list of notes from the storage
//Why would there NOT be a url?
var loadNotes = function() {
    if(url.length) {
        chrome.extension.sendMessage({cmd: 'loadNotes', data: {url: url }}, function(newNotes) {
            //If notes exist, for each one, insert it into the page.
            if(newNotes !== null) {
                for(i = 0; i < newNotes.length; i++) {
                    if(newNotes[i] !== '') {
                        insertNote(newNotes[i], i);
                        notes.push(newNotes[i]);
                    }
                }
                chrome.extension.sendMessage({cmd: 'badge', data: {count: $('.metro-notes-note').size() }});
            }
        });
    }
};

var reloadNotes = function() {
    $('.metro-notes-note').remove();
    loadNotes();
};

var saveNotes = function(url, notes) {
    chrome.extension.sendMessage({cmd: 'saveNotes', data: {url: url, notes: notes }});
    chrome.extension.sendMessage({cmd: 'badge', data: {count: $('.metro-notes-note').size() }});
};

//Execute on every page load.
var init = function() {
    //Insert the overlay object into the page then hide it.
    $('body').append('<div class="metro-notes-overlay"></div>');
    overlayObject = $(overlaySelector);
    overlayObject.hide();

    // overlayObject.css('backgroundImage', chrome.extension.getURL('css/noise.png'));
    overlayObject.append('<div class="instant_issue">Sorry...Metro Notes does not work well with Google Instant. We are investigating a fix...</div>');
    overlayObject.append('<div class="wrench">wrench</div>');
    overlayObject.append(
        '<div class="options">' +
            '<div class="reset">reset</div>' +
            '<div class="toggle-key-label">set toggle key<span class="toggle-key"></span></div>' +
        '</div>'
    );

    $('.instant_issue').hide();

    loadSettings();
    loadNotes();

    //If clicked, insert a new note at the page that was clicked.
    overlayObject.on('click', function(e) {
        var ajax_url = document.URL;     //Page URL #Necessary cos Ajax

        if(ajax_url.indexOf('#') !== -1 && (ajax_url.indexOf('www.google.com/search') !== -1 || ajax_url.indexOf('www.google.com/webhp' !== -1))) {
            $('#instant_issue').show();
            return false;
        }

        //If in insert mode, first exit insert mode, before inserting a new note.
        if(insertMode) {
            insertMode = false;
            return false;
        }
        noteObj = {'note': '', 'top': e.offsetY, 'left': e.offsetX};
        insertNote(noteObj, notes.length).find('p').prop('contentEditable', true).focus();
        insertMode = true;
        return false;
    });

    //Clicking on the note should make it editable(especially now we have the drag handlers)
    overlayObject.on('click', '.metro-notes-note', function() {
        $(this).find('p').prop('contentEditable', 'true').focus();
        insertMode = true;
        return false;
    });

    //On mouseover, bring the note to the front
    overlayObject.on('mouseover', '.metro-notes-note', function() {
        $(this).css('zIndex', lastzindex);
        lastzindex++;
    });

    //When the note loses focus, and it has data, save it.
    overlayObject.on('blur', '.metro-notes-note > .note-text > p', function() {
        var note = $(this).text();
        //If the note is empty, delete it.
        if($.trim(note) === '') {
            try {
                deleteNote($(this).parents('.metro-notes-note').attr('id').replace('metro-notes-note-', ''));
            } catch(e) { console.log(e); }
        } else {
            var tar = $(this).parents('.metro-notes-note');
            noteObj = {
                'note': tar.text(),
                'top': tar.css('top'),
                'left': tar.css('left')
            };
            updateNote(noteObj, tar.attr('id').replace('metro-notes-note-', ''));
            $(this).prop('contentEditable', 'false');
        }
        return false;
    });

    $('.wrench').on('click',function() {
        $('.options').slideToggle('fast');
        return false;
    });

    $('.reset').on('click', function() {
        saveSettings('');
        return false;
    });

    //on click, user is prompted to set toggle key
    //If the user clicks again, nothing is changed
    $('.toggle-key-label').on('click', function(e) {
        if($('.toggle-key').data('click-count') === true) {
            $('.toggle-key').data('click-count', false);
            loadSettings();
        } else {
            $('.toggle-key').data($('.toggle-key').text());
            $('.toggle-key').data('click-count', true);
            $('.toggle-key').text('new hotkey...');
            $('body').one('keydown', getToggleKey);
        }
        return false;
    });
};

//logic to set key
var getToggleKey = function(e){
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
    $('.toggle-key').data('click-count', false);
    saveSettings(text);
    return false;
};

var getCharDesc = function(char_code) {
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
    return specialKeys[char_code] ? specialKeys[char_code] : String.fromCharCode(char_code);
};

init();

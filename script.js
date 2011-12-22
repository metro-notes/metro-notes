var displayOverlay = function() {
    var overlaySelector = '#metro-notes-overlay';
    var overlayObject = $(overlaySelector);
    if(overlayObject.length) {
        overlayObject.slideToggle("fast");
    } else {
        $('body').append('<div id="metro-notes-overlay"></div>');
        $(overlaySelector).hide().slideDown("fast");
    }
}

var overlaySelector = '#metro-notes-overlay';
$('body').append('<div id="metro-notes-overlay"></div>');
$(overlaySelector).hide();

var displayOverlay = function() {
    var overlayObject = $(overlaySelector);
    overlayObject.slideToggle("fast");
}

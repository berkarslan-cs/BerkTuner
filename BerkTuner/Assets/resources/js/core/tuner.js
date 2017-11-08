$(function () {
    //Set defaults
    $.ajaxSetup({
        beforeSend: function () {
            showOverlayLoader();
        },
        error: function (err) {
            bootbox.alert(MESSAGES.uncaughtError);
        },
        complete: function () {
            hideOverlayLoader();
        }
    });
});

function showOverlayLoader() {
    $('.overlay,.loader').show();
}

function hideOverlayLoader() {
    $('.overlay,.loader').hide();
}
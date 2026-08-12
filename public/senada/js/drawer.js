var drawerEvents = {
    beforeShow: 'elatus-drawer:before-show',
    afterShow: 'elatus-drawer:after-show',
    beforeHide: 'elatus-drawer:before-hide',
    afterHide: 'elatus-drawer:after-hide'
};
const drawerFormElement = document.querySelector('.drawer-forms');
const drawerForm = drawerFormElement ? drawerFormElement.outerHTML : '';
if (drawerFormElement) drawerFormElement.remove();
$(document).ready(function() {
    var $drawer = $('.drawer');

    function showDrawer($drawer) {
        $drawer.trigger(drawerEvents.beforeShow);
        $drawer.on(drawerEvents.beforeShow, function() {
            $drawer.find('.drawer-inner').html('');
        });

        $drawer.addClass('opened');
        $drawer.closest('.drawer-wrapper').find('.drawer-overlay').fadeIn();
        $('body').addClass('no-scroll');
        $drawer.one('transitionend', function() {
            $drawer.trigger(drawerEvents.afterShow);
        });
    }

    function hideDrawer($drawer) {
        $drawer.trigger(drawerEvents.beforeHide);
        $drawer.removeClass('opened');
        $drawer.closest('.drawer-wrapper').find('.drawer-overlay').fadeOut();
        $('body').removeClass('no-scroll');
        if ($('#date').length) {
            $('#date').datepicker('destroy');
        }
        $drawer.one('transitionend', function() {
            $drawer.trigger(drawerEvents.afterHide);
        });
    }
    $('.drawer-overlay').on('click', function() {
        hideDrawer($(this).closest('.drawer-wrapper').find('.drawer'));
    });
    $('.close-drawer').on('click', function(e) {
        e.preventDefault();
        hideDrawer($(this).closest('.drawer'));
    });

    /*CLICK EVENT*/
    $('.contact-drawer').on('click', function(e) {
        e.preventDefault();
        $drawer.find('.header h2').remove();
        $drawer.find('.drawer-inner').html('');
        $drawer.off(drawerEvents.beforeShow);

        $drawer.on(drawerEvents.beforeShow, function() {
            $drawer.find('.drawer-inner').append(drawerForm);
            var $title = $drawer.find('.drawer-inner .drawer-forms h2').text() || '';
            if ($title !== '') {
                $drawer.find('.drawer-inner .drawer-forms h2').remove();
                $drawer.find('.header').prepend("<h2>" + $title + "</h2>");
            }
            if (datepickerLoaded) {
                isDatepickerInit = false;
                initDatepicker();
            }
        });
        showDrawer($drawer);
    });
});
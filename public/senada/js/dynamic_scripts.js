/*====SWIPER====*/
var swiperCallbackInit = false;
var swiperLoaded = false;

function loadSwiper() {
    if (!swiperLoaded) {
        $.getScript(SWIPER_PATH)
            .done(function(script, textStatus) {
                $('<link/>', {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: SWIPER_CSS_PATH
                }).prependTo('head');
                swiperLoaded = true;
                swiperSetup();
                var elements = [".js-swiper-dynamic, .gallery"];

                setTimeout(() => {
                    elements.forEach(element => {
                        $(element).removeClass("before-swiper-init");
                    });
                }, 100);
            })
            .fail(function(jqxhr, settings, exception) {
                console.log("Failed to load slick script: " + exception);
            });
    }
}

function initSwiper() {
    if ('IntersectionObserver' in window) {
        var options = {
            rootMargin: "50px 0px 50px 0px",
            threshold: 0.001,
        };

        var observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.001) {
                    loadSwiper();
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        $('.js-swiper-dynamic').each((index, element) => {
            observer.observe(element);
        });
    } else {
        loadSwiper();
    }
}

$(document).ready(function() {
    initSwiper();
});



/*====SWIPEBOX====*/

var swipeboxLoaded = false;
var isSwipeboxOpening = false;

$(document).on("click", '.swipebox', function(e) {
    e.preventDefault();
    var that = $(this);
    if (!swipeboxLoaded) {
        $('.loader').fadeIn();
        $.getScript(SWIPEBOX_PATH)
            .done(function(script, textStatus) {
                $('<link/>', {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: SWIPEBOX_CSS_PATH
                }).prependTo('head');
                $('.swipebox').swipebox({
                    hideBarsDelay: 0,
                    beforeOpen: function() {
                        $(".mainHeader").addClass("swipebox-open");
                        isSwipeboxOpening = true;
                    },
                    afterClose: function() {
                        if (isSwipeboxOpening) {
                            isSwipeboxOpening = false;
                            $(".mainHeader").removeClass("swipebox-open");
                        }
                    },
                });
                setTimeout(function() {
                    that.trigger('click');
                    $('.loader').fadeOut();
                }, 300);
                swipeboxLoaded = true;
            })
            .fail(function() {
                console.log('fail');
            })
    }
});


/*====DATEPICKER====*/
var datepickerLoaded = false;
var datepickerLoading = false;
var isDatepickerInit = false;

$(document).on("focusin click touchstart", '.customDatepicker, .js-elatus-selector, .select2', function() {
    var that = $(this);

    if (datepickerLoaded) {
        datepickerSetup();
    } else if (!datepickerLoading) {
        datepickerLoading = true;

        $.getScript(DATEPICKER_PATH)
            .done(function() {

                $('<link/>', {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: DATEPICKER_CSS_PATH
                }).prependTo('head');

                $.getScript(DATEPICKER_LANG_PATH)
                    .done(function() {
                        $.datepicker.setDefaults($.extend({
                                showMonthAfterYear: false,
                                changeMonth: false,
                                changeYear: false
                            },
                            $.datepicker.regional[LANG_UID]
                        ));

                        datepickerLoaded = true;
                        datepickerLoading = false;

                        setTimeout(function() {
                            that.trigger('blur');
                            that.trigger('focus');
                        }, 300);
                    });
            })
            .fail(function() {
                console.error('Failed to load Datepicker script');
                datepickerLoading = false;
            });
    }
});


/*====VALIDATE====*/
var validateLoaded = false;
var inProgress = false;
$(document).on('mousedown touchstart change mouseenter', 'form.validate', function(e) {
    dynamicLoadValidate(e);
})


function dynamicLoadValidate(e, callback = null) {
    if (validateLoaded) {
        validateForms($(e.currentTarget));
    } else {
        if (!inProgress) {
            inProgress = true;
            $.getScript(VALIDATE_PATH)
                .done(function() {
                    validateLoaded = true;
                    inProgress = false;
                    validateForms($(e.currentTarget));
                    if (callback) callback();
                })
                .fail(function() {
                    console.log('Failed loading validation plugin');
                    inProgress = false;
                })
        }
    }
}


function validateForms(form) {
    jQuery.extend(jQuery.validator.messages, {
        required: lang['validateRequired'],
        email: lang['validateEmail']
    });

    if (typeof form.attr("novalidate") != "undefined") return;

    form.validate({
        errorPlacement: function(error, element) {
            if (element.hasClass('checkbox-error')) {
                error.appendTo(element.closest('div'))
                element.parent().addClass("error");
            } else {
                error.insertAfter(element)
            }
        },
        submitHandler: function(formElement) {
            const $form = $(formElement);
            const callbackName = $form.data("callback");
            if (callbackName && typeof window[callbackName] === "function") {
                window[callbackName]($form);
            } else {
                if ($form.hasClass('searchForm') || $form.hasClass('homepageSearchForm')) {
                    return false;
                } else {
                    $form.submit();
                }
            }
        }

    })

}

var submitHandlerTimeout;

function handleUnvalidatedContact() {
    $('form').attr("onsubmit", "");
    submitHandlerTimeout = setTimeout(function() {
        $("form").submit();
    }, 1000);

    return false;

}

function datepickerSetup() {
    if (!isDatepickerInit) {
        initDatepicker();
    }
}

function initDatepicker() {
    $('#date').datepicker({
        showAnim: "slideDown",
        minDate: 0,
        showOtherMonths: true,
        selectOtherMonths: true,
        altField: "#date_out",
        altFormat: "yy-mm-dd",
    });
    $('#ui-datepicker-div').addClass('notranslate');
    $.datepicker.setDefaults($.datepicker.regional[LANG_LOCALE]);
    isDatepickerInit = true;
}

function swiperSetup() {
    if (!swiperCallbackInit) {
        initSwiperCallbacks();
        swiperCallbackInit = true;
    }

}

function initSwiperCallbacks() {
    var swiper = new Swiper(".mySwiper", {
        pagination: {
            el: ".swiper-pagination",
            type: "progressbar",
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

    var gallerySwiper;
    $(".gallery-swiper").each(function() {
        var i = $(this).data("id");
        gallerySwiper = new Swiper('.gallery-swiper-' + i, {
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: 15,
            loop: false,
            preloadImages: false,
            lazy: {
                enabled: true,
                loadPrevNext: true,
            },
            pagination: {
                el: ".gallery-bullets-wrap-" + i,
                clickable: true,
                dynamicBullets: true,
            },
            breakpoints: {
                575: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    slidesPerGroup: 2,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                    slidesPerGroup: 3,
                },
                991: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                    slidesPerGroup: 4,
                },
            },
        });
    });

    var partnerLogos = new Swiper(".partnersLogoSwiper", {
        slidesPerView: 2,
        slidesPerGroup: 1,
        spaceBetween: 15,
        loop: false,
        preloadImages: false,
        lazy: {
            enabled: true,
            loadPrevNext: true,
        },
        breakpoints: {
            575: {
                slidesPerView: 3,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            900: {
                slidesPerView: 4,
                spaceBetween: 20,
                slidesPerGroup: 1,
            },
            1200: {
                slidesPerView: 5,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            1600: {
                slidesPerView: 6,
                spaceBetween: 20,
                slidesPerGroup: 1,
            },
        },
    });

    var testimonialsLogos = new Swiper(".testimonialsSwiper", {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 0,
        loop: false,
        preloadImages: false,
        lazy: {
            enabled: true,
            loadPrevNext: true,
        },
        pagination: {
            el: ".testimonials-bullets-wrap",
            clickable: true,
            dynamicBullets: true
        },
        breakpoints: {
            992: {
                slidesPerView: 2,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            1250: {
                slidesPerView: 3,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
        },
    });
    var singleTestimonialsSwiper = new Swiper(".singleTestimonialsSwiper", {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 0,
        loop: false,
        preloadImages: false,
        lazy: {
            enabled: true,
            loadPrevNext: true,
        },
        pagination: {
            el: ".single-testimonials-bullets-wrap",
            clickable: true,
            dynamicBullets: true
        },
        navigation: {
            nextEl: "#single-testimonial-next",
            prevEl: "#single-testimonial-prev",
        },
    });

    var featuredAreasSwiper = new Swiper(".featuredAreasSwiper", {
        slidesPerView: 1.2,
        slidesPerGroup: 1,
        spaceBetween: 15,
        loop: false,
        preloadImages: false,
        lazy: {
            enabled: true,
            loadPrevNext: true,
        },
        pagination: {
            el: ".featuredAreasPaginationBullets",
            clickable: true,
            dynamicBullets: true
        },
        breakpoints: {
            575: {
                slidesPerView: 2.2,
                slidesPerGroup: 1,
                spaceBetween: 15,

            },
            768: {
                slidesPerView: 3,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            992: {
                slidesPerView: 4,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
        },
    });

    var relatedNewsSwiper = new Swiper(".relatedNewsSwiper", {
        slidesPerView: 1.2,
        slidesPerGroup: 1,
        spaceBetween: 15,
        loop: true,
        preloadImages: false,
        lazy: {
            enabled: true,
            loadPrevNext: true,
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            992: {
                slidesPerView: 3,
                spaceBetween: 20,
                slidesPerGroup: 1,
            },
        },
    });

    var newsSwiper = new Swiper(".newsSwiper", {
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 0,
        loop: false,
        preloadImages: false,
        navigation: {
            nextEl: "#news-next",
            prevEl: "#news-prev",
        },
        pagination: {
            el: ".news-bullets-wrap",
            clickable: true,
            dynamicBullets: true
        },
        lazy: {
            enabled: true,
            loadPrevNext: true,
        },
    });

    var featuredListingsSwiper = new Swiper(".featured-listings-swiper", {
        slidesPerView: 1.1,
        slidesPerGroup: 1,
        spaceBetween: 15,
        loop: false,
        preloadImages: false,
        lazy: {
            enabled: true,
            loadPrevNext: true,
        },
        pagination: {
            el: ".featuredListingsPagination",
            clickable: true,
            dynamicBullets: true,
        },
        breakpoints: {
            550: {
                slidesPerView: 1.3,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            650: {
                slidesPerView: 1.5,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            780: {
                slidesPerView: 1.8,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            881: {
                slidesPerView: 2,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            992: {
                slidesPerView: 2.2,
                spaceBetween: 20,
                slidesPerGroup: 1,

            },
            1100: {
                slidesPerView: 2.5,
                spaceBetween: 20,
                slidesPerGroup: 1,
            },
            1330: {
                slidesPerView: 3,
                spaceBetween: 20,
                slidesPerGroup: 1,
            },
        },
    });
}
/* Code for removing passive listeners from jQuery*/
jQuery.event.special.touchstart = {
    setup: function(_, ns, handle) {
        this.addEventListener("touchstart", handle, {
            passive: !ns.includes("noPreventDefault")
        });
    }
};
jQuery.event.special.touchmove = {
    setup: function(_, ns, handle) {
        this.addEventListener("touchmove", handle, {
            passive: !ns.includes("noPreventDefault")
        });
    }
};
jQuery.event.special.wheel = {
    setup: function(_, ns, handle) {
        this.addEventListener("wheel", handle, {
            passive: true
        });
    }
};
jQuery.event.special.mousewheel = {
    setup: function(_, ns, handle) {
        this.addEventListener("mousewheel", handle, {
            passive: true
        });
    }
};

// remap jQuery to $
(function($) {})(window.jQuery);
$(document).ready(function() {
    /* TABLES */
    $('table').addClass('table').not('.not_responsive').wrap('<div class="table-responsive"></div>');

    /* VIDEO */
    $("article p iframe[src*=youtube], article p iframe[src*=vimeo]").attr("webkitallowfullscreen", "webkitallowfullscreen").attr("mozallowfullscreen", "mozallowfullscreen").attr("allowfullscreen", "allowfullscreen").parent().wrap('<div class="ratio ratio-16x9"/>');

    /* REL CONTENT */
    var REL = $('head').attr('data-rel');
    if (REL.length > 0) {
        REL = REL.split(",");
        $.each(REL, function(index, value) {
            if (value.length == 0) return;
            $('li[rel*="' + value + '"]').addClass('active');
        })
    }

    $('.elatus-select').select2({
        minimumResultsForSearch: Infinity,
        dropdownPosition: 'below',
    }).on('select2:open', function() {
        var $select = $(this);
        if (!$select.find('option[value="clear"]').length && $select.val() !== null) {
            $select.prepend('<option value="clear" data-id="clear">' + lang.clearSelect + '</option>');
        } else if ($select.val() === null) {
            $select.find('option[value="clear"]').remove();
        }
    }).on('select2:select', function(e) {
        if (e.params.data.id === "clear") {
            $(this).val('').trigger('change');
        }
    });

    $('.select-flex').select2({
        minimumResultsForSearch: Infinity,
        dropdownPosition: 'below',
        dropdownCssClass: 'container-flex',
    }).on('select2:open', function() {
        var $select = $(this);
        if (!$select.find('option[value="clear"]').length && $select.val() !== null) {
            $select.prepend('<option value="clear">X</option>');
        }
    }).on('select2:select', function(e) {
        if (e.params.data.id === "clear") {
            $(this).val('').trigger('change');
        }
    });
    $('.sort-select').select2({
        minimumResultsForSearch: Infinity,
        dropdownPosition: 'below',
        dropdownCssClass: 'sort-dropdown',
    }).on('select2:open', function() {
        var $select = $(this);
        if (!$select.find('option[value="clear"]').length && $select.val() !== null) {
            $select.prepend('<option value="clear">' + lang.clearSelect + '</option>');
        }
    }).on('select2:select', function(e) {
        if (e.params.data.id === "clear") {
            $(this).val('').trigger('change');
        }
    });

    function initializeSelect() {
        if ($(window).width() > 768) {
            $('.select-flex').select2({
                minimumResultsForSearch: Infinity,
                dropdownPosition: 'below',
                dropdownCssClass: 'container-flex'
            });
        } else {
            if ($('.mobile-native').find('.select2-hidden-accessible').length) {
                $('.select-flex').select2('destroy');
            }
        }
    }
    initializeSelect();

    $(window).resize(function() {
        initializeSelect();
    });
    $('.scrollTo').on('click', function(e) {
        e.preventDefault();
        $('body,html').animate({
            scrollTop: $(this).closest('section').next('section').offset().top - 80
        }, 'slow');
    });

    function countGalleryLength() {
        var pictureNum = $('.swipebox[rel=property-preview]').length;
        $('.big-image .see-all span').text(pictureNum);
    }

    if ($('.subheader-gallery .see-all').length) countGalleryLength();
    $('.subheader-gallery .see-all').on('click', function(e) {
        e.preventDefault();
        if ($('.listing-gallery').length) {
            $('html, body').animate({
                scrollTop: $('.listing-gallery').offset().top - 40
            }, 'slow')
        }
    });

    var $descBox = $('.desc-box .content');
    var $asideBoxOne = $('.info-section .additional-info');
    var $asideBoxTwo = $('.info-section .community-info');
    var asideHeight = $asideBoxOne.height() + $asideBoxTwo.height();
    var descBoxHeight = $descBox.height();
    var maxExpectedHeight = (asideHeight - 110) || 300;
    if (descBoxHeight > maxExpectedHeight) {
        $descBox.css({
            'max-height': maxExpectedHeight + 'px',
            'overflow': 'hidden'
        });
        $('.js-read-more-btn').css("display", 'block');
        $descBox.addClass("pre-expand");
    } else {
        $descBox.css({
            "padding-bottom": "0"
        });
    }
    $(document).on('click', '.js-read-more-btn', function() {
        var $descBox = $(this).closest('.desc-box .content');
        $(this).toggleClass("active")
        if ($(this).hasClass("active")) {
            $descBox.animate({
                'max-height': $descBox.get(0).scrollHeight + 'px'
            }, 500);
            $descBox.removeClass("pre-expand");
            $(this).text(JS_LANG['read_less']);
        } else {
            $descBox.animate({
                'max-height': maxExpectedHeight + 'px'
            }, 500);
            $descBox.addClass("pre-expand");
            $(this).text(JS_LANG['read_more']);
        }
    });
    /* PLACEHOLDER FOR IMAGES*/
    handleImageLoad('.subheader-gallery img, .listing-gallery-grid img, .property-card img');
});

function handleImageLoad(selector) {
    $(selector).each(function() {
        var $img = $(this);
        if (this.complete) {
            $img.parent('.img-wrap').addClass('loaded');
        } else {
            $img.on('load', function() {
                $(this).parent('.img-wrap').addClass('loaded');
            });
        }
    });
}
// function newsletterSubmit(form) {
//     var nlID = $(form).attr("data-id") || false;
//     if (nlID) $("#newsletter_response_" + nlID).load(LANG + "/service/newsletter/process/", $("#newsletter_form_data_" + nlID).serializeArray(), null, "html");
//     return false;
// }

function ajaxFormGeneral(form) {
    $('.loader').fadeIn(200, "", function() {
        $(form).append($("<input type='hidden' name='ajax' value='1'>"))
        $.ajax({
            url: $(form).attr('action'),
            type: $(form).attr('method'),
            data: $(form).serialize(),
            dataType: "json",
            timeout: 60000,
            context: form,
            success: function(response) {
                var status = response.code || 400
                var element_id = form.data("response-id");
                if (status === 200) {
                    $(element_id).html(response.message).slideDown(400);
                    form.slideUp(400);
                    $('html, body').animate({
                        scrollTop: ($(this).offset().top - 500)
                    }, 400);
                    $(element_id).find("a").click(function(e) {
                        e.preventDefault();
                        $('.loader').fadeIn(400, "", function() {
                            $(element_id).hide();
                            form.slideDown(400);
                            $('html, body').animate({
                                scrollTop: ($(this).offset().top - 200)
                            }, 400);
                            $('.loader').fadeOut()

                        })
                    })
                } else {
                    form.find(".alert-danger").html(response.message).slideDown(400);
                }
            }
        }).always(function() {
            $('.loader').fadeOut();
        }).fail(function() {
            console.log("Failed!");
            form.find(".alert-danger").html("Server Error!").slideDown(400);
        });
    });
}


function formatPrice(price, locale) {
    locale = LANG_LOCALE;
    if (locale !== undefined) {
        try {
            price = parseFloat(price).toLocaleString(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } catch {
            price = parseFloat(price).toLocaleString();
        }
    } else {
        try {
            price = parseFloat(price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } catch {
            price = parseFloat(price).toLocaleString();
        }
    }
    return price;
}
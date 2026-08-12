$(document).ready(function() {
    $('.toggle-hidden-form').on('click', function(e) {
        e.preventDefault();
        var $this = $(this);
        var text = $this.data('text');
        var altText = $this.data('alt-text');
        $this.toggleClass('active').text($this.hasClass('active') ? altText : text);
        if ($this.hasClass('active')) {
            $('body,html').animate({
                scrollTop: $this.closest('form').find('.bottom-part').offset().top + 200
            }, 'slow');
            if (window.innerWidth < 769) {
                $('.form-overlay').fadeIn(400);
            }
        } else {
            $('.form-overlay').fadeOut(400);
        }
        var $bottomPart = $this.closest('.homepageSearchForm').find('.bottom-part');
        $bottomPart.stop(true, true).slideToggle(500, 'easeInOutCubic');
    });
    $('.toggle-searchForm').on('click', function(e) {
        e.preventDefault();
        var $this = $(this);
        var text = $this.data('text');
        var altText = $this.data('alt-text');
        $this.toggleClass('active').text($this.hasClass('active') ? altText : text);
        $this.hasClass('active') ?
            $(this).closest('.search-form').find('.bottom-part').slideDown(500, 'easeInOutCubic') :
            $(this).closest('.search-form').find('.bottom-part').slideUp(500, 'easeInOutCubic');
    });

    /*$(document).on('click', '.search-suggestions a',function (e) {
        e.preventDefault();
        var text = $(this).text();
        var value = $(this).data('value');
        $('.elatus-autocomplete label.animated-label').addClass('active');
        $('#search-autocomplete').val(text).closest('.elatus-autocomplete').find('.result-value').val(value);
        $('body, html').animate({
            scrollTop: $('#search-autocomplete').closest('form').offset().top - 250
        }, 400);
    });*/

    /*Price based on property*/
    var originalPriceOptions = $('#price option').clone();
    window.filterPriceOptions = function filterPriceOptions(type, selectedPrice) {
        var $price = $('#price');
        var placeholderOption = originalPriceOptions.filter(':first');
        var matchingOptions = originalPriceOptions.filter(function() {
            var dataTip = $(this).data('type');
            return !dataTip || dataTip === type;
        });

        if (matchingOptions.length < 2 && matchingOptions.is(':hidden')) {
            type = 'sale';
            matchingOptions = originalPriceOptions.filter(function() {
                var dataTip = $(this).data('type');
                return !dataTip || dataTip === 'sale';
            });
        }
        if ($price.val() > 0 && $price.val().length > 0) $price.siblings('label').addClass('active');

        $price.empty().append(placeholderOption).append(matchingOptions);

        if (selectedPrice) {
            $price.val(selectedPrice).trigger('change.select2');
            $price.siblings('label').addClass('active');
        } else {
            if (type !== 'sale') {
                $price.val('').trigger('change.select2');
                if ($price.val() === null || $price.val() === '') {
                    $price.siblings('label').removeClass('active');
                }
            }
        }
    }

    filterPriceOptions('sale');

    $('form').on('change', '#type', function() {
        filterPriceOptions($(this).val());
    });

    /*ANIMATION OF THE AUTOCOMPLETE IN SEARCH FORM*/
    $('.elatus-autocomplete').each(function() {
        var label = $(this).find("label");
        var labelText = label.text().trim();
        var index = 0;
        label.text('');

        function labelAnimation() {
            if (index < labelText.length) {
                label.text(label.text() + labelText.charAt(index));
                index++;
                setTimeout(labelAnimation, 30);
            }
        }
        if ($('.searchForm, .homepageSearchForm').length) {
            labelAnimation();
        }
    })
});
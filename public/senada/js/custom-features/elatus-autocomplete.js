var autocompleteInProgress = false;
var autocompleteTimer = null;
var currentIndex = -1;

$(document).ready(function() {
    function updateActiveItem($items, index) {
        $items.removeClass('active');
        if (index >= 0 && index < $items.length) {
            var $activeItem = $items.eq(index);
            $activeItem.addClass('active');

            var $resultsWrapper = $activeItem.closest('.results-wrapper');
            var containerHeight = $resultsWrapper.innerHeight();
            var scrollTop = $resultsWrapper.scrollTop();
            var itemOffsetTop = $activeItem.position().top;
            var itemHeight = $activeItem.outerHeight();

            if (itemOffsetTop + itemHeight > containerHeight) {
                $resultsWrapper.scrollTop(scrollTop + itemHeight);
            } else if (itemOffsetTop < 0) {
                $resultsWrapper.scrollTop(scrollTop + itemOffsetTop);
            }
        }
    }

    function applyAutocompleteSelection($item) {
        var resultsText = $item.text();
        var resultsCounty = $item.data('county');
        var resultsValue = $item.data('value');
        var autocompleteWrapper = $item.closest('.elatus-autocomplete');
        autocompleteWrapper.find('input').val(resultsValue);
        autocompleteWrapper.find('#is-county').val(resultsCounty);
        autocompleteWrapper.find('.result-value').val(resultsText);

        if (!autocompleteWrapper.hasClass('address-placeholder')) {
            if (!resultsCounty) {
                $(".address-placeholder").addClass("active").find('label.animated-label').addClass("active");
                $(".address-placeholder").find("input").trigger("focus");
            } else {
                $(".address-placeholder").removeClass("active").find('label.animated-label').removeClass("active");
                $(".address-placeholder").find("input").val("");
            }
        }
        autocompleteWrapper.find('.results-wrapper').slideUp();
    }

    $('.elatus-autocomplete').each(function() {
        var input = $(this).find('input[type="text"]');
        var prevVal = "";
        var nextVal = "";

        input.on('keyup', function(e) {
            var key = e.keyCode || e.which;
            var $this = $(this);
            var parent = $this.closest(".elatus-autocomplete");
            var url = $this.data('url') || "";
            var searchText = $this.val().toLowerCase().trim();
            var $resultsWrapper = parent.find('.results-wrapper');
            var $resultsList = $resultsWrapper.find('ul');
            var $items = $resultsList.find('li');
            var elementHeight = $this.closest('.elatus-autocomplete').innerHeight();
            $resultsWrapper.css("top", elementHeight + 10 + "px");
            parent.addClass("loading");

            if (key === 40) { // Arrow down
                e.preventDefault();
                currentIndex = Math.min(currentIndex + 1, $items.length - 1);
                updateActiveItem($items, currentIndex);
                parent.removeClass("loading");
            } else if (key === 38) { // Arrow up
                e.preventDefault();
                currentIndex = Math.max(currentIndex - 1, 0);
                updateActiveItem($items, currentIndex);
                parent.removeClass("loading");
            } else if (key === 27) { // Esc
                e.preventDefault();
                parent.removeClass("loading");
                $resultsWrapper.slideUp();
            } else if (key === 13) { // Enter
                e.preventDefault();
                parent.removeClass("loading");
                if ($resultsWrapper.is(":visible") && currentIndex >= 0) {
                    var $selectedItem = $resultsList.find('li.active');
                    if ($selectedItem.length) {
                        applyAutocompleteSelection($selectedItem);
                    }
                } else {
                    $this.closest('form').trigger('submit');
                }
            }

            clearTimeout(autocompleteTimer);
            if (searchText.length >= 2) {
                autocompleteTimer = setTimeout(function() {
                    nextVal = searchText;
                    if (prevVal === nextVal) return;
                    prevVal = nextVal;

                    let cityParam;
                    if (parent.hasClass('address-placeholder')) {
                        var cityInput = $this.closest('form').find("input[name='term']");
                        if (cityInput.length > 0) {
                            cityParam = cityInput[0].value;
                        }
                    }

                    let data = parent.hasClass('address-placeholder') && cityParam ? {
                        city: cityParam,
                        search: searchText
                    } : {
                        search: searchText
                    };

                    $.ajax({
                        url: url,
                        type: "GET",
                        dataType: 'json',
                        data: data,
                        timeout: 9000,
                        beforeSend: function() {
                            autocompleteInProgress = true;
                        },
                        success: function(response) {
                            $resultsList.empty();
                            const listItem = response.data.map(result =>
                                `<li data-county="${result.is_county}" data-value="${result.value}">${result.label}</li>`
                            );
                            $resultsList.append(listItem.join(''));
                            if ($resultsList.children().length > 0) {
                                $resultsWrapper.slideDown();
                                $resultsWrapper.find('p').hide();
                            } else {
                                $resultsWrapper.slideDown();
                                $resultsWrapper.find('p').show();
                            }
                            $this.siblings('.result-value').val(searchText);
                        },
                        complete: function() {
                            autocompleteInProgress = false;
                        }
                    }).always(function() {
                        currentIndex = -1;
                        autocompleteInProgress = false;
                        parent.removeClass("loading");
                    });
                }, 300);
            } else {
                $resultsWrapper.slideUp();
                parent.removeClass("loading");
            }
        }).on('keydown', function(e) {
            var key = e.keyCode || e.which;
            if (key === 13) { // Enter
                e.preventDefault();
            }
        }).on('blur', function() {
            $(this).siblings('.results-wrapper').slideUp();
            $(this).closest(".elatus-autocomplete").removeClass("loading");
        }).on('focus', function() {
            var $this = $(this);
            var searchText = $this.val().toLowerCase().trim();
            var parent = $this.closest(".elatus-autocomplete");
            var resultsWrapper = parent.find(".results-wrapper");
            var resultList = resultsWrapper.find("ul");
            if (searchText.length >= 2 && resultList.length > 0 && resultList.children().length > 0) {
                resultsWrapper.slideDown();
                resultsWrapper.find('p').hide();
            } else {
                resultsWrapper.slideUp(500);
            }
        });
    });

    $('.elatus-autocomplete .results-wrapper ul').on('click', 'li', function() {
        applyAutocompleteSelection($(this));
    });
});

$(document).on("click", function(e) {
    if ($('.elatus-autocomplete').length === 0) {
        return;
    }
    if (!$(e.target).closest(".response-wrapper, .elatus-autocomplete input").length) {
        $('.results-wrapper').slideUp();
    }
});
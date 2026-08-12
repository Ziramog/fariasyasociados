let isLoading = false;

function showOverlay() {
    $('.loader').css('display', 'block');
}

function hideOverlay() {
    $('.loader').css('display', 'none');
}

var allowed_filters = {
    term: [{
        tip: "term",
        expand_filters: 0
    }],
    address: [{
        tip: "address",
        expand_filters: 0
    }],
    type: [{
        tip: "dropdown",
        expand_filters: 0
    }],
    area: [{
        tip: "dropdown",
        expand_filters: 0
    }],
    price: [{
        tip: "dropdown",
        expand_filters: 0
    }],
    bedrooms: [{
        tip: "dropdown",
        expand_filters: 0
    }],
    baths: [{
        tip: "dropdown",
        expand_filters: 0
    }],
    'property-type': [{
        tip: "checkbox",
        expand_filters: 1
    }],
    status: [{
        tip: "checkbox",
        expand_filters: 1
    }],
    is_county: [{
        tip: "input",
        expand_filters: 0
    }],
};

var PROPERTIES_PAGE = getUriParam(2) ? ? 1;
var initialPrice = null;

function createUrl() {
    var filters = {};
    var separator = '?';
    var url = PROPERTIES_URL + PROPERTIES_PAGE + '/';

    pojam = $("input[name=\"term\"]").val() || "";
    is_county = parseInt($("input[name=\"is_county\"]").val());
    sort = $("#sort :selected").val() || '';
    var address = $("input[name=\"address\"]").val();

    if (pojam !== "") {
        url += separator + "term=" + encodeURIComponent(pojam);
        separator = "&";
    }
    if (is_county > 0) {
        url += separator + 'is_county=' + is_county;
        separator = '&';
    } else if (address) {
        url += separator + 'address=' + address;
        separator = '&';
    }
    if (sort != '') {
        url += separator + 'sort=' + sort;
        separator = '&';
    }

    $.each($('.searchForm input:checked'), function(index, input) {
        fname = $(input).attr("name");
        fvalue = $(input).attr("value");
        if (!(fname in filters)) filters[fname] = {};
        filters[fname][fvalue] = fvalue;
    });

    $.each($('.searchForm select, .homepageSearchForm select'), function(index, input) {
        fname = $(input).attr("name");
        fvalue = $(input).find("option:selected").val().trim();
        if (fvalue != 0) {
            if (!(fname in filters)) filters[fname] = {};
            filters[fname][fvalue] = fvalue;
        }
    });

    for (var key in filters) {
        url += separator + key + "=" + Object.values(filters[key]).join('|');
        if (separator.match(/\?/)) separator = '&';
    }
    return url;
}

function ajaxCall(url, historyPushState = true) {
    if (isLoading) return;
    isLoading = true;
    showOverlay();

    $.ajax({
        url: url,
        method: 'POST',
        data: {
            key: 'ajax'
        },
        dataType: 'json',
        success: function(response) {
            if (typeof response.data.redirectTo !== 'undefined') {
                window.location.href = response.data.redirectTo;
                return;
            }
            if (response.data ? .properties && response.data ? .properties ? .length > 0) {
                $("#listings-grid").html(response.data ? .properties);
                handleImageLoad('.property-card .img-wrap img');
                $("#pagination").html(response.data ? .pagination || "");
                if ($(".js-scrollToResults").length > 0) {
                    $('html, body').animate({
                        scrollTop: $(".js-scrollToResults").offset().top - 60
                    }, 500);
                }
                /*if($(".js-scrollToResults").length > 0 && window.history.state !== 'back'){
                    $('html, body').animate({
                        scrollTop: $(".js-scrollToResults").offset().top - 60
                    }, 500);
                    // history.replaceState('back', null);
                }*/
                hideSearchTitle();
            } else {
                $("#listings-grid").html('<p>No results found.</p>');
                $("#pagination").empty();
            }
            if (response.data ? .meta) {
                updateTitlesAndMetaData(response.data ? .meta);
            }
        },
        complete: function() {
            isLoading = false;
        }
    }).always(function(response) {
        if (typeof response.data.redirectTo === 'undefined') {
            hideOverlay();
            if (historyPushState) {
                history.pushState({
                    url: url
                }, "", url);
            }
        }
    });

    try {
        var customTitle = [];
        $(".searchForm").find("input:checkbox:checked").each(function() {
            customTitle.push($(this).closest("label").text());
        });
        /*if (typeof gtag === 'function') {
            /!*gtag('event', 'page_view', {
                page_path: location.pathname + location.search,
                page_title: customTitle.join(", ") + " - " + document.title,
            });*!/
            // console.log("Data sent to Google Analytics:", {
            //     page_path: location.pathname + location.search,
            //     page_title: customTitle.join(", ") + " - " + document.title,
            // });
        } else {
            console.error('gtag is not defined');
        }*/

    } catch (e) {
        console.log(e.message)
    }

}

function hideSearchTitle() {
    if ($("#listings-grid").find(".remark").length > 0) {
        $("#listings-grid").siblings(".section-title-alt").addClass('d-none');
    } else {
        $("#listings-grid").siblings(".section-title-alt").removeClass('d-none');
    }
}

function updateTitlesAndMetaData(data) {
    //update META Data
    if (data ? .title) {
        document.title = data.title;
        let ogTitle = document.querySelector('meta[property="og:title"]');
        ogTitle.content = data.title;
    }
    if (data ? .description) {
        let metaDescription = document.querySelector('meta[name="description"]');
        metaDescription.content = data.description;
        let ogDescription = document.querySelector('meta[property="og:description"]');
        ogDescription.content = data.description;
    }

    //update Page title and subtitle
    var searchSection = $(".search-results");
    if (searchSection.length > 0) {
        if (data ? .page_title) {
            searchSection.find("h1").text(data.page_title);
        }
        if (data ? .page_subtitle) {
            searchSection.find(".container .section-title-alt h2").text(data.page_subtitle);
        }
    }
}

function initFilters(triggerAjax = false) {
    var queryString = location.search.substring(1).trim();
    var url_filters = {};
    queryString.split("&").forEach(function(param) {
        var [key, value] = param.split("=");
        if (key && value) {
            key = decodeURIComponent(key.trim());
            value = decodeURIComponent(value.trim());
            url_filters[key] = value;
        }
    });
    var valid_filters = commonKeys(url_filters, allowed_filters);
    const currentSort = getUrlParameter("sort");
    const selectedSort = $("#sort").val();

    if (currentSort !== selectedSort) {
        $("#sort option[value=\"" + getUrlParameter("sort") + "\"]").prop("selected", true).trigger('change');
    }


    var expand_filters = 0;
    let hasValidFilters = false

    $.each(valid_filters, function(index, filter) {
        hasValidFilters = true;
        var tip = allowed_filters[filter][0].tip;
        if (allowed_filters[filter][0].expand_filters) {
            expand_filters = 1;
        }

        var values = url_filters[filter].split("|");

        if (filter === "price") {
            initialPrice = values[0]; // Store initial price from URL
        }

        if (tip === "term") {
            $("#search-autocomplete").val(url_filters.term);
            if (parseInt(url_filters.is_county) !== 1) {
                $(".address-placeholder").addClass("active");
            }
        } else if (tip === "dropdown") {
            $.each(values, function(index, val) {
                var select_elem = $('select[name="' + filter + '"]');
                select_elem.find('option[value="' + val + '"]').prop("selected", true).trigger('change');
                select_elem.trigger('change.select2');
            });
        } else if (tip === "address") {
            $(".address-placeholder").addClass("active");
        } else {
            $.each(values, function(index, val) {
                $('input[name="' + filter + '"][value="' + val + '"]').prop("checked", true);
            });
        }
    });

    if (hasValidFilters && triggerAjax) {
        let url = createUrl();
        ajaxCall(url, false);
    }

    if (expand_filters) {
        $('.toggle-searchForm').trigger('click');
    }

    // Apply the initial price if it exists
    if (initialPrice) {
        filterPriceOptions($("#type").val() || 'sale', initialPrice);
    } else {
        filterPriceOptions($("#type").val() || 'sale');
    }
}

var sort = 0;
var is_county = 0;
var pojam = "";
$(document).ready(function() {
    $("#pagination").on("click", "nav.paginationWrapper a", function(e) {
        e.preventDefault();
        var url = $(this).attr("href");
        history.pushState({
            url: url
        }, "", url);
        ajaxCall(url, false);
    });

    $(".search-results .searchForm").on("submit", function(e) {
        e.preventDefault();
        PROPERTIES_PAGE = 1;
        var url = createUrl();
        ajaxCall(url);
    });

    $('.homepageSearchForm, .cluster-map-section .searchForm').on('submit', function(e) {
        e.preventDefault();
        showOverlay();
        var url = createUrl();
        window.location.href = url;
        hideOverlay();
    });

    if ($('.search-results .searchForm')) {
        initFilters(true);
    }
    $("body").on("change", "#sort", function() {
        sort = parseInt($(this).val()) || 0;
        PROPERTIES_PAGE = 1;
        var url = createUrl();
        ajaxCall(url);
    });
});
$(window).bind("popstate", function(e) {
    var state = e.originalEvent.state;
    var queryString = location.search.substring(1).trim();

    $(".searchForm select.elatus-select").find('option:first').prop("selected", true).trigger('change');
    $('input[type="checkbox"]').prop("checked", false);
    $(".searchForm input[name='term']").val(getUrlParameter("term"));
    $(".searchForm input[name='address']").val(getUrlParameter("address"));
    if (getUrlParameter("address")) $(".searchForm input[name='address']").closest(".form-group").find("label.animated-label:not(.active)").addClass("active");
    $(".is-county").val(getUrlParameter("is_county"));
    if (state && state ? .url) {
        ajaxCall(state.url || queryString, false);
        initFilters();
    } else {
        history.replaceState({
            url: PROPERTIES_URL
        }, "", PROPERTIES_URL);
        ajaxCall(PROPERTIES_URL, false);
        initFilters();
    }
});

$(".mainHeader .show-more").on("click", function(e) {
    e.preventDefault();
})

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}


function getUriParam(index) {
    var uriSegments = window.location.pathname.split('/').filter(Boolean);
    return uriSegments[index] !== undefined ? decodeURIComponent(uriSegments[index]) : null;
}

function commonKeys(obj1, obj2) {
    var keys = [];
    for (var i in obj1) {
        if (i in obj2) {
            keys.push(i);
        }
    }
    return keys;
}
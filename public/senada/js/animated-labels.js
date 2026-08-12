$(document).ready(function() {
    /* ANIMATED LABELS */
    function activateAnimatedLabel(element, event = "focus") {
        if (event === "blur") {
            element.closest('.form-group').find("label.animated-label").removeClass("active");
        } else {
            element.closest('.form-group').find("label.animated-label").addClass("active");
        }
    }

    // input element must have .animated-label class, and a label sibling with same class.
    $("input.animated-label, textarea.animated-label, input.search-autocomplete").each(function() {
        if ($(this).val().length !== 0) {
            activateAnimatedLabel($(this));
        }
    });

    $("input.animated-label, textarea.animated-label, input.search-autocomplete").on("focus", function() {
        activateAnimatedLabel($(this));
    }).on("blur change", function() {
        if ($(this).val().length == 0) {
            activateAnimatedLabel($(this), "blur");
        }
    });

    $(".elatus-select.animated-label, select.animated-label").on("select2:open", function() {
        activateAnimatedLabel($(this));
    }).on("select2:close", function() {
        var selectedValue = $(this).val();
        if (!selectedValue || selectedValue === "") {
            activateAnimatedLabel($(this), "blur");
        }
    });
    $(".elatus-select.animated-label, select.animated-label").on("change", function() {
        var selectedValue = $(this).val();
        if (selectedValue && selectedValue !== "") {
            activateAnimatedLabel($(this));
        } else {
            activateAnimatedLabel($(this), "blur");
        }
    });
    $(".elatus-select.animated-label, select.animated-label").each(function() {
        var selectedValue = $(this).val();
        if (selectedValue && selectedValue !== "") {
            activateAnimatedLabel($(this));
        } else {
            activateAnimatedLabel($(this), "blur");
        }
    });
});
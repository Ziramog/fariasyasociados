$(function() {
    $("#cookie_button").click(function(e) {
        e.preventDefault();
        var CookieDate = new Date;
        CookieDate.setFullYear(CookieDate.getFullYear() + 1);
        document.cookie = COOKIE + "_cookies=true; expires=" + CookieDate.toGMTString() + "; path=" + APPLICATION + ";" + cs;
        $(".cookies_wrap").css("display", "none");
    });

    $("#cookie_close").click(function(e) {
        e.preventDefault();
        $(".cookies_wrap").css("display", "none");
    });

    setTimeout(function() {
        $('.cookies_wrap').fadeIn();
    }, 3000);
});
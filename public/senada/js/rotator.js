// Safari scroll restoration fix + delayed slider init
/*if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
}*/

/*
window.addEventListener('beforeunload', function () {
    sessionStorage.setItem('scrollPos', window.scrollY);
});
*/

window.addEventListener('load', function() {
    setTimeout(() => {
        // const scrollPos = sessionStorage.getItem('scrollPos');
        // if (scrollPos !== null) {
        //     window.scrollTo(0, parseInt(scrollPos, 10));
        //     sessionStorage.removeItem('scrollPos');
        // }
        initRoyalSliderAndResponsiveSources();
    }, 100);
});

function initRoyalSliderAndResponsiveSources() {
    const $royalSlider = $('.royalSlider');
    if (!$royalSlider.length) return;

    $.fn.extend({
        qcss: function(css) {
            return $(this).queue(function(next) {
                $(this).css(css);
                next();
            });
        }
    });

    let currentBreakpoint = '';

    const breakpoints = {
        SD: {
            maxWidth: 720,
            videoAttr: 'data-sd',
            imgHrefAttr: 'data-mobile'
        },
        HD: {
            maxWidth: 1280,
            videoAttr: 'data-hd',
        },
        FULL_HD: {
            maxWidth: 1920,
            videoAttr: 'data-desktop-hd',
            imgHrefAttr: 'data-desktop'
        },
        '2K': {
            maxWidth: Infinity,
            videoAttr: 'data-desktop-4k',
            imgHrefAttr: 'data-desktop'
        }
    };

    function getBreakpoint() {
        const width = $(window).width();
        if (width < breakpoints.SD.maxWidth) return 'SD';
        if (width < breakpoints.HD.maxWidth) return 'HD';
        if (width < breakpoints.FULL_HD.maxWidth) return 'FULL_HD';
        return '2K';
    }

    function royalSource() {
        const newBp = getBreakpoint();
        if (newBp === currentBreakpoint) return;
        const cfg = breakpoints[newBp];

        // 1) ALWAYS update the <source> src attrs (even on first init)
        $('.royalSlider video source').each(function() {
            const $src = $(this);
            const newUrl = $src.attr(cfg.videoAttr);
            if (newUrl && $src.attr('src') !== newUrl) {
                $src.attr('src', newUrl);
                const videoEl = $src.closest('video').get(0);
                if (videoEl) videoEl.load();
            }
        });

        // 2) Update image hrefs if needed
        if (cfg.imgHrefAttr) {
            $('.royalSlider .rsImg').each(function() {
                const $img = $(this);
                const href = $img.attr(cfg.imgHrefAttr);
                if (href) $img.attr('href', href);
            });
        }

        const rsInstance = $royalSlider.data('royalSlider');
        if (rsInstance) {
            // on breakpoint change, just resize + replay
            rsInstance.updateSliderSize(true);

            const vid = $(rsInstance.currSlide.content).find('video').get(0);
            if (vid) {
                vid.load();
                vid.addEventListener('canplaythrough', () => {
                    vid.play().catch(() => {});
                }, {
                    once: true
                });
            }
        } else {
            // very first time: initialize the slider now that srcs are set
            initRoyalSlider();
        }

        currentBreakpoint = newBp;
        $royalSlider.attr('data-breakpoint', newBp);
    }

    function initRoyalSlider() {
        // make sure videos are muted & preloaded so autoplay is allowed
        $('.royalSlider video').attr({
            preload: 'auto',
            muted: true
        });

        $royalSlider.royalSlider({
            transitionType: 'fade',
            arrowsNav: true,
            arrowsNavAutoHide: false,
            autoScaleSlider: false,
            numImagesToPreload: 1,
            video: {
                autoHideArrows: true,
                autoHideControlNav: false,
                autoHideBlocks: true,
                youTubeCode: '<iframe src="https://www.youtube.com/embed/%id%?rel=1&showinfo=0&autoplay=1&wmode=transparent&mute=1&muted=1" frameborder="no"></iframe>',
                vimeoCode: '<iframe src="https://player.vimeo.com/video/%id%?byline=0&portrait=0&autoplay=1&muted=1" frameborder="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
            },
            autoCenter: true,
            imageScaleMode: 'fill',
            slidesSpacing: 0,
            loop: true,
            controlNavigation: 'bullets',
            addActiveClass: true,
            autoPlay: {
                enabled: true,
                stopAtAction: false,
                pauseOnHover: false,
                delay: 10000
            }
        });

        const slider = $royalSlider.data('royalSlider');

        // immediately load & play the first slide’s video on init
        const firstVid = $(slider.currSlide.content).find('video').get(0);
        if (firstVid) {
            firstVid.load();
            firstVid.addEventListener('canplaythrough', () => {
                firstVid.play().catch(() => {});
            }, {
                once: true
            });
        }

        startRoyalSliderEventListeners();
    }

    function startRoyalSliderEventListeners() {
        const slider = $royalSlider.data('royalSlider');
        if (!slider) {
            console.error('Slider is not initialized.');
            return;
        }

        $('.bullets-container').empty();
        $('.rsNav').appendTo('.bullets-container');

        if (typeof slider.playVideo === 'function') {
            slider.playVideo();
        }

        slider.ev.off('.royalSlider');

        slider.ev.on('rsAfterContentSet', function(e, slideObject) {
            if (typeof slider.playVideo === 'function') {
                slider.playVideo();
            }

            $('.rsContent').css('visibility', 'visible');
            const img = slideObject.holder.find('img').eq(0);
            if (img.length && slideObject.caption) {
                img.attr('alt', $(slideObject.caption["1"]).attr("alt"));
            }
        });

        slider.ev.on('rsAfterSlideChange', function() {
            const $currentSlide = slider.currSlide.content;
            const video = $currentSlide.children('video');
            const iframeVideo = $currentSlide.find('.rsVideoContainer');

            if (video.length) {
                video[0].play();
            }

            if (iframeVideo.length) {
                slider.playVideo();
            }
        });
    }

    royalSource();

    let resizeTimeout;
    window.addEventListener(
        'resize',
        function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(royalSource, 200);
        }, {
            passive: true
        }
    );
}
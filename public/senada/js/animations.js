/*ANIMATION TRIGGER*/
function countUp(element, duration) {
    var targetNumber = parseInt(element.getAttribute('data-value'));
    let startNumber = 0;
    var interval = targetNumber / duration;
    var timer = setInterval(() => {
        startNumber += interval;
        element.innerText = Math.round(startNumber);
        if (startNumber >= targetNumber) {
            clearInterval(timer);
            element.innerText = targetNumber;
        }
    }, 1);
}
var counterSection = document.querySelector('.our-team');
const options = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0,
};
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0) {
            $(entry.target).addClass('active');
            var counters = entry.target.querySelectorAll('.home .animated-counter');
            counters.forEach((counter) => {
                countUp(counter, 500);
            });
            observer.unobserve(entry.target);
        }
    });
}, options);

function observeElements() {
    $('.js-animate').each((index, element) => {
        if (!$(element).data('observed')) {
            observer.observe(element);
            $(element).data('observed', true);
        }
    });
}

observeElements();

const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            observeElements();
        }
    });
});
mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
});
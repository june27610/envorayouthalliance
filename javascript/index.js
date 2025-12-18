const elements = document.querySelectorAll(".fade-in");
function reveal() {
    elements.forEach(el => {
        const position = el.getBoundingClientRect().top;
        if (position < window.innerHeight - 50) {
            el.classList.add("show");
        }
    });
}
window.addEventListener("scroll", reveal);
reveal();


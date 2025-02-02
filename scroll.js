let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
    const header = document.getElementById("header");
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY) {
        header.classList.add("hidden");
    } else {
        header.classList.remove("hidden");
    }
    
    lastScrollY = currentScrollY;
}); 
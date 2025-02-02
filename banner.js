// Horný banner - miznutie pri scrollovaní
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Vypočítame opacity na základe scrolluvania
        let opacity = 1 - (scrollTop / 200); // 200px je hranica pre úplné zmiznutie
        opacity = Math.max(opacity, 0.1); // Minimálna opacity 0.1
        
        
        header.style.opacity = opacity;
        header.style.transform = `translateY(${-scrollTop * 0.2}px)`; // Paralax efekt
        
        // Pridanie/odoberieme compact triedu
        if (scrollTop > 50) {
            header.classList.add('compact');
        } else {
            header.classList.remove('compact');
        }
        
        lastScrollTop = scrollTop;
    });
});

// Spodný banner - interaktívne prvky
document.addEventListener('DOMContentLoaded', function() {
    const footerBanner = document.querySelector('.footer-banner');
    const navItems = document.querySelectorAll('.nav-item');
    
    // Interaktívne prvky v banneri
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Paralax efekt pre pozadie
    window.addEventListener('mousemove', function(e) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        footerBanner.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
    });
}); 
document.addEventListener('DOMContentLoaded', function() {
    // Skrývanie navigácie pri scrollovaní
    let lastScroll = 0;
    const nav = document.getElementById('topNav');
    const scrollThreshold = 100; // Minimálna vzdialenosť pre skrytie

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Skryje navigáciu pri scrollovaní dole a zobrazí pri scrollovaní hore
        if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
            nav.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    });

   
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // hladkost scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}); 
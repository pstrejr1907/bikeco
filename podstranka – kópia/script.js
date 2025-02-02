function showRideDetails(rideId) {
    // Presmerovanie na detail jazdy
    window.location.href = `details.html?ride=${rideId}`;
}

// JavaScript for Interactive Elements

// Display Sign Up Modal or Group Ride Form Interaction (Placeholder function)
function showSignup() {
    alert("Signup form would appear here (extend with actual form or modal logic).");
}

// Scroll event to change header style
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;
                
                // Pridá triedu 'scrolled' pri scrollovaní
                if (currentScroll > 20) { // Znížili sme hodnotu pre citlivejšiu reakciu
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                // Plynulejšia animácia pre skrývanie/zobrazovanie
                if (currentScroll > lastScroll && currentScroll > 200) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
                
                lastScroll = currentScroll;
                ticking = false;
            });
            
            ticking = true;
        }
    });
});


// Simple form submission handler (extendable)
document.getElementById('ride-registration-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    alert(`Thank you, ${name}! You are registered for the group ride.`);
    // Here, you could add more logic, like sending data to a server
});

document.addEventListener('DOMContentLoaded', function() {
    // Pôvodný kód pre filtrovanie
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.ride-card');

    // Aktualizácia stavu pre všetky karty na main stránke
    function updateRideStatuses() {
        cards.forEach(card => {
            const rideId = card.getAttribute('data-ride-id');
            const participantsElement = card.querySelector('.participants-count');
            if (participantsElement) {
                const currentParticipants = localStorage.getItem(`ride_${rideId}_participants`) || '5';
                const maxParticipants = '10';
                participantsElement.textContent = `${currentParticipants}/${maxParticipants} miest`;
            }
        });
    }

    // Volanie aktualizácie pri načítaní stránky
    updateRideStatuses();

    // Pôvodný kód pre filtrovanie
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            cards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = '';
                } else {
                    card.style.display = card.getAttribute('data-filter') === filter ? '' : 'none';
                }
            });
        });
    });
});

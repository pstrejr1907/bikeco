document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addRideForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Získanie dat
        const newRide = {
            id: Date.now().toString(), // Unikátne ID
            title: form.title.value,
            date: form.date.value,
            time: form.time.value,
            startLocation: form.startLocation.value,
            distance: parseInt(form.distance.value),
            difficulty: form.difficulty.value,
            description: form.description.value,
            name: form.name.value,
            email: form.email.value,
            password: form.password.value,
            participants: []
        };
        
        // Načitavanie vytvorených jázd
        const rides = JSON.parse(localStorage.getItem('rides')) || [];
        
        // Pridanie novej jazdy
        rides.push(newRide);
        
        // Uloženie do localStorage
        localStorage.setItem('rides', JSON.stringify(rides));
        
        // Presmerovanie späť na hlavnú stránku podstate back
        alert('Jazda bola úspešne pridaná!');
        window.location.href = 'index.html';
    });
}); 
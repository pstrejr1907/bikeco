document.addEventListener('DOMContentLoaded', () => {
    // Inicializácia Google Maps- rozmyslam ci to bude obsahovat ale funguje
    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 48.1486, lng: 17.1077 }, // Bratislava
        zoom: 12,
    });

    // Marker na začiatok trasy
    new google.maps.Marker({
        position: { lat: 48.1486, lng: 17.1077 },
        map: map,
        title: 'Štart: Námestie SNP',
    });

    // Spracovanie prihlásenia
    const form = document.getElementById('signup-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        document.getElementById('confirmation').innerText = `Ďakujeme, ${email}, za prihlásenie!`;
    });
});

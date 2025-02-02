document.addEventListener('DOMContentLoaded', function() {
    const joinButton = document.getElementById('joinRideBtn');
    const shareButton = document.getElementById('shareRideBtn');
    
    // Získame ID jazdy z URL- kod som nasiel v podobnej stranke na internete ale este som to neskual
    const urlParams = new URLSearchParams(window.location.search);
    const rideId = urlParams.get('id') || '1';

    // Načítame stav prihlásenia a počet účastníkov
    let currentParticipants = parseInt(localStorage.getItem(`ride_${rideId}_participants`) || '5');
    const maxParticipants = 10;

    // Aktualizácia UI pri načítaní
    updateButtonAndParticipants();

    joinButton.addEventListener('click', function() {
        if (isJoinedToRide()) {
            // Odhlásenie
            localStorage.setItem(`ride_${rideId}_joined`, 'false');
            currentParticipants--;
            localStorage.setItem(`ride_${rideId}_participants`, currentParticipants.toString());
            
            // Aktualizujeme UI
            updateButtonAndParticipants();
            showNotification('Boli ste úspešne odhlásený z jazdy');
        } else {
            // Prihlásenie
            if (currentParticipants < maxParticipants) {
                localStorage.setItem(`ride_${rideId}_joined`, 'true');
                currentParticipants++;
                localStorage.setItem(`ride_${rideId}_participants`, currentParticipants.toString());
                
                // Aktualizujeme UI
                updateButtonAndParticipants();
                showNotification('Boli ste úspešne prihlásený na jazdu');
            } else {
                showNotification('Jazda je už plne obsadená!', 'error');
            }
        }
    });

    function isJoinedToRide() {
        return localStorage.getItem(`ride_${rideId}_joined`) === 'true';
    }

    function updateButtonAndParticipants() {
        // Aktualizácia tlačidla
        if (isJoinedToRide()) {
            joinButton.classList.add('joined');
            joinButton.textContent = 'Odhlásiť sa z jazdy';
            joinButton.style.background = '#f44336';
        } else {
            joinButton.classList.remove('joined');
            joinButton.textContent = 'Prihlásiť sa na jazdu';
            joinButton.style.background = '#4CAF50';
        }

        // Aktualizácia počtu účastníkov
        const participantsElement = document.querySelector('.value');
        if (participantsElement) {
            participantsElement.textContent = `${currentParticipants}/${maxParticipants} miest`;
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Zdieľanie
    shareButton.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: document.getElementById('rideTitle').textContent,
                text: 'Pozri si túto skvelú cyklo jazdu!',
                url: window.location.href
            });
        } else {
            showNotification('Zdieľanie nie je podporované vaším prehliadačom', 'error');
        }
    });
}); 
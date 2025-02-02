document.addEventListener('DOMContentLoaded', function() {
    const ridesContainer = document.getElementById('ridesContainer');
    const createRideBtn = document.getElementById('createRideBtn');
    const rideModal = document.getElementById('rideModal');
    const joinModal = document.getElementById('joinModal');
    const rideForm = document.getElementById('rideForm');
    const joinForm = document.getElementById('joinForm');
    const sortFilter = document.getElementById('sortFilter');
    const searchInput = document.getElementById('searchRides');
    const difficultyButtons = document.querySelectorAll('.difficulty-buttons button');

    let rides = JSON.parse(localStorage.getItem('rides')) || [];
    let currentRideId = null;

    const ADMIN_USERNAME = 'root';
    const ADMIN_PASSWORD = 'root';

    // Event Listeners caakatel na signal
    createRideBtn.addEventListener('click', () => showRideModal());
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            rideModal.style.display = 'none';
            joinModal.style.display = 'none';
        });
    });

    // Zatvorenie kliknutím mimo neho
    window.addEventListener('click', (e) => {
        if (e.target == rideModal) rideModal.style.display = 'none';
        if (e.target == joinModal) joinModal.style.display = 'none';
    });

    // Formulár pre vytvorenie/editáciu jazdy
    rideForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const rideData = {
            id: currentRideId || Date.now(),
            name: document.getElementById('rideName').value,
            date: document.getElementById('rideDate').value,
            location: document.getElementById('rideLocation').value,
            distance: document.getElementById('rideDistance').value,
            difficulty: document.getElementById('rideDifficulty').value,
            description: document.getElementById('rideDescription').value,
            maxParticipants: document.getElementById('rideMaxParticipants').value,
            organizerEmail: document.getElementById('organizerEmail').value,
            password: document.getElementById('ridePassword').value,
            routeLink: document.getElementById('rideRoute').value,
            participants: currentRideId ? 
                (rides.find(r => r.id === currentRideId)?.participants || []) : [],
        };

        if (currentRideId) {
            // Editácia existujúcej jazdy
            const index = rides.findIndex(r => r.id === currentRideId);
            rides[index] = rideData;
        } else {
            // Vytvorenie novej jazdy
            rides.push(rideData);
        }

        localStorage.setItem('rides', JSON.stringify(rides));
        renderRides();
        rideModal.style.display = 'none';
        rideForm.reset();
        currentRideId = null;
    });

    // Formulár pre prihlásenie na jazdu
    joinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const participant = {
            name: document.getElementById('participantName').value,
            email: document.getElementById('participantEmail').value
        };

        const ride = rides.find(r => r.id === currentRideId);
        if (ride && ride.participants.length < ride.maxParticipants) {
            if (!ride.participants.some(p => p.email === participant.email)) {
                ride.participants.push(participant);
                localStorage.setItem('rides', JSON.stringify(rides));
                renderRides();
                joinModal.style.display = 'none';
                joinForm.reset();
                alert('Úspešne ste sa prihlásili na jazdu!');
            } else {
                alert('Na túto jazdu ste už prihlásený!');
            }
        } else {
            alert('Jazda je už plne obsadená!');
        }
    });

    // Filtrovanie a vyhľadávanie
    sortFilter.addEventListener('change', renderRides);
    searchInput.addEventListener('input', renderRides);
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            difficultyButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderRides();
        });
    });

    // Zobrazenie modalu pre vytvorenie/editáciu jazdy
    function showRideModal(rideId = null) {
        currentRideId = rideId;
        const modalTitle = document.getElementById('modalTitle');
        
        if (rideId) {
            const ride = rides.find(r => r.id === rideId);
            // Kontrola hesla pred editáciou
            const enteredUsername = prompt('Zadajte používateľské meno:');
            const enteredPassword = prompt('Zadajte heslo:');

            if ((enteredUsername === ADMIN_USERNAME && enteredPassword === ADMIN_PASSWORD) || 
                (enteredPassword === ride.password && enteredUsername === ride.organizerEmail)) {
                
                modalTitle.textContent = 'Upraviť jazdu';
                document.getElementById('rideName').value = ride.name;
                document.getElementById('rideDate').value = ride.date;
                document.getElementById('rideLocation').value = ride.location;
                document.getElementById('rideDistance').value = ride.distance;
                document.getElementById('rideDifficulty').value = ride.difficulty;
                document.getElementById('rideDescription').value = ride.description;
                document.getElementById('rideMaxParticipants').value = ride.maxParticipants;
                document.getElementById('organizerEmail').value = ride.organizerEmail;
                document.getElementById('ridePassword').value = ride.password;
                rideModal.style.display = 'block';
            } else {
                alert('Nesprávne prihlasovacie údaje!');
                return;
            }
        } else {
            modalTitle.textContent = 'Vytvoriť novú jazdu';
            rideForm.reset();
            rideModal.style.display = 'block';
        }
    }

    // Zobrazenie modalu pre prihlásenie na jazdu
    function showJoinModal(rideId) {
        currentRideId = rideId;
        joinModal.style.display = 'block';
    }

    // Vykreslenie jázd
    function renderRides() {
        let filteredRides = [...rides];

        // Aplikovanie filtrov
        const searchTerm = searchInput.value.toLowerCase();
        const selectedDifficulty = document.querySelector('.difficulty-buttons button.active').dataset.difficulty;

        filteredRides = filteredRides.filter(ride => {
            const matchesSearch = ride.name.toLowerCase().includes(searchTerm) ||
                                ride.location.toLowerCase().includes(searchTerm) ||
                                ride.description.toLowerCase().includes(searchTerm);
            const matchesDifficulty = selectedDifficulty === 'all' || ride.difficulty === selectedDifficulty;
            return matchesSearch && matchesDifficulty;
        });

        // Zoradenie
        switch(sortFilter.value) {
            case 'date':
                filteredRides.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'distance':
                filteredRides.sort((a, b) => a.distance - b.distance);
                break;
            case 'participants':
                filteredRides.sort((a, b) => b.participants.length - a.participants.length);
                break;
        }

        // Vykreslenie
        ridesContainer.innerHTML = '';
        filteredRides.forEach(ride => {
            const card = document.createElement('div');
            card.className = 'ride-card';
            
            const date = new Date(ride.date).toLocaleDateString('sk-SK', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            card.innerHTML = `
                <div class="ride-header">
                    <h3 class="ride-title">${ride.name}</h3>
                    <span class="ride-date">${date}</span>
                </div>
                <div class="ride-content">
                    <div class="ride-info">
                        <div class="ride-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${ride.location}</span>
                        </div>
                        <div class="ride-info-item">
                            <i class="fas fa-route"></i>
                            <span>${ride.distance} km</span>
                        </div>
                        <div class="ride-info-item">
                            <i class="fas fa-users"></i>
                            <span>${ride.participants.length}/${ride.maxParticipants} účastníkov</span>
                        </div>
                        <div class="ride-info-item">
                            <i class="fas fa-signal"></i>
                            <span>${getDifficultyText(ride.difficulty)}</span>
                        </div>
                    </div>
                    <div class="ride-actions">
                        <button class="details-btn" onclick="showDetails(${ride.id})">
                            <i class="fas fa-info-circle"></i>
                            Detaily
                        </button>
                        <button class="join-btn" onclick="showJoinModal(${ride.id})">
                            <i class="fas fa-user-plus"></i>
                            Prihlásiť sa
                        </button>
                        <button class="edit-btn" onclick="showRideModal(${ride.id})">
                            <i class="fas fa-edit"></i>
                            Upraviť
                        </button>
                        <button class="delete-btn" onclick="deleteRide(${ride.id})">
                            <i class="fas fa-trash"></i>
                            Vymazať
                        </button>
                    </div>
                </div>
            `;
            
            ridesContainer.appendChild(card);
        });
    }

    function getDifficultyText(difficulty) {
        switch(difficulty) {
            case 'easy': return 'Ľahká';
            case 'medium': return 'Stredná';
            case 'hard': return 'Ťažká';
            default: return 'Neznáma';
        }
    }

    // Pridanie funkcie pre vymazanie jazdy
    function deleteRide(rideId) {
        const ride = rides.find(r => r.id === rideId);
        const enteredUsername = prompt('Zadajte používateľské meno:');
        const enteredPassword = prompt('Zadajte heslo:');

        if ((enteredUsername === ADMIN_USERNAME && enteredPassword === ADMIN_PASSWORD) || 
            (enteredPassword === ride.password && enteredUsername === ride.organizerEmail)) {
            
            if (confirm('Naozaj chcete vymazať túto jazdu?')) {
                rides = rides.filter(r => r.id !== rideId);
                localStorage.setItem('rides', JSON.stringify(rides));
                renderRides();
                alert('Jazda bola úspešne vymazaná!');
            }
        } else {
            alert('Nesprávne prihlasovacie údaje!');
        }
    }

    // Pridanie modalu pre detaily
    const detailsModal = document.createElement('div');
    detailsModal.id = 'detailsModal';
    detailsModal.className = 'ride-modal';
    detailsModal.innerHTML = `
        <div class="ride-modal-content details-content">
            <span class="close">&times;</span>
            <div id="rideDetails"></div>
        </div>
    `;
    document.body.appendChild(detailsModal);

    // Funkcia pre zobrazenie detailov
    function showDetails(rideId) {
        const ride = rides.find(r => r.id === rideId);
        const detailsModal = document.getElementById('detailsModal');
        const detailsContent = document.getElementById('rideDetails');
        
        const date = new Date(ride.date).toLocaleDateString('sk-SK', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        detailsContent.innerHTML = `
            <h2>${ride.name}</h2>
            <div class="details-info">
                <div class="details-section">
                    <h3>Základné informácie</h3>
                    <p><i class="fas fa-calendar"></i> ${date}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${ride.location}</p>
                    <p><i class="fas fa-route"></i> ${ride.distance} km</p>
                    <p><i class="fas fa-signal"></i> ${getDifficultyText(ride.difficulty)}</p>
                </div>
                
                <div class="details-section">
                    <h3>Popis trasy</h3>
                    <p>${ride.description}</p>
                    ${ride.routeLink ? `
                        <div class="route-link">
                            <h3>Link na trasu</h3>
                            <a href="${ride.routeLink}" target="_blank" class="route-btn">
                                <i class="fas fa-map"></i> Zobraziť trasu
                            </a>
                        </div>
                    ` : ''}
                </div>

                <div class="details-section">
                    <h3>Účastníci (${ride.participants.length}/${ride.maxParticipants})</h3>
                    ${ride.participants.length > 0 ? `
                        <ul class="participants-list">
                            ${ride.participants.map(p => `
                                <li><i class="fas fa-user"></i> ${p.name}</li>
                            `).join('')}
                        </ul>
                    ` : '<p>Zatiaľ nie sú prihlásení žiadni účastníci</p>'}
                </div>
            </div>
        `;

        detailsModal.style.display = 'block';

        // Zatvorenie detailov
        detailsModal.querySelector('.close').addEventListener('click', () => {
            detailsModal.style.display = 'none';
        });
    }

    // Počiatočné vykreslenie jázd
    renderRides();

    // Exportovanie funkcií do globálneho scope
    window.showRideModal = showRideModal;
    window.showJoinModal = showJoinModal;
    window.deleteRide = deleteRide;
    window.showDetails = showDetails;
});
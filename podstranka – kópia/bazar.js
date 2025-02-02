document.addEventListener('DOMContentLoaded', function() {
    const listingsContainer = document.getElementById('listingsContainer');
    const createListingBtn = document.getElementById('createListingBtn');
    const listingModal = document.getElementById('listingModal');
    const detailModal = document.getElementById('detailModal');
    const listingForm = document.getElementById('listingForm');
    const searchInput = document.getElementById('searchListings');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFromInput = document.getElementById('priceFrom');
    const priceToInput = document.getElementById('priceTo');
    const sortFilter = document.getElementById('sortFilter');
    const photoInput = document.getElementById('listingPhotos');
    const photoPreview = document.getElementById('photoPreview');

    const ADMIN_USERNAME = 'root';
    const ADMIN_PASSWORD = 'root';
    let isAdmin = false;
    let currentListingId = null;
    let listings = JSON.parse(localStorage.getItem('bazarListings')) || [];

    // Event Listeners
    createListingBtn.addEventListener('click', () => {
        currentListingId = null;
        showListingModal();
    });
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            listingModal.style.display = 'none';
            detailModal.style.display = 'none';
            listingForm.reset();
            photoPreview.innerHTML = '';
        });
    });

    // Filtrovanie a vyhľadávanie
    [searchInput, categoryFilter, priceFromInput, priceToInput, sortFilter].forEach(element => {
        element.addEventListener('input', renderListings);
        element.addEventListener('change', renderListings);
    });

    // Spracovanie fotiek-taktiez nefunkcne
    photoInput.addEventListener('change', handlePhotoUpload);

    // Formulár pre vytvorenie/editáciu inzerátu
    listingForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            const formData = {
                id: currentListingId || Date.now(),
                title: document.getElementById('listingTitle').value,
                category: document.getElementById('listingCategory').value,
                price: parseFloat(document.getElementById('listingPrice').value),
                condition: document.getElementById('listingCondition').value,
                description: document.getElementById('listingDescription').value,
                location: document.getElementById('listingLocation').value,
                contactName: document.getElementById('contactName').value,
                contactEmail: document.getElementById('contactEmail').value,
                contactPhone: document.getElementById('contactPhone').value,
                password: document.getElementById('listingPassword').value,
                createdAt: currentListingId ? 
                    listings.find(l => l.id === currentListingId)?.createdAt : 
                    new Date().toISOString(),
                photos: []
            };

            // Spracovanie fotiek-taktiez nefunkcne
            const photoFiles = document.getElementById('listingPhotos').files;
            if (photoFiles.length > 0) {
                for (let i = 0; i < photoFiles.length; i++) {
                    const base64 = await convertToBase64(photoFiles[i]);
                    formData.photos.push(base64);
                }
            }

            // Ak nie sú žiadne nové fotky a ide o editáciu, zachováme pôvodné
            if (formData.photos.length === 0 && currentListingId) {
                const existingListing = listings.find(l => l.id === currentListingId);
                formData.photos = existingListing.photos;
            }

            if (currentListingId) {
                const index = listings.findIndex(l => l.id === currentListingId);
                if (index !== -1) {
                    listings[index] = { ...listings[index], ...formData };
                }
            } else {
                listings.unshift(formData);
            }

            localStorage.setItem('bazarListings', JSON.stringify(listings));
            listingModal.style.display = 'none';
            listingForm.reset();
            photoPreview.innerHTML = '';
            renderListings();
            showNotification('Inzerát bol úspešne uložený!', 'success');
        } catch (error) {
            console.error('Chyba pri ukladaní inzerátu:', error);
            showNotification('Nastala chyba pri ukladaní inzerátu!', 'error');
        }
    });

    // Zobrazenie detailu inzerátu
    function showListingDetail(listingId) {
        const listing = listings.find(l => l.id === listingId);
        const detailContent = document.getElementById('listingDetail');

        detailContent.innerHTML = `
            <h2>${listing.title}</h2>
            <div class="photo-gallery">
                ${listing.photos.map(photo => `
                    <img src="${photo}" alt="${listing.title}" class="gallery-image">
                `).join('')}
            </div>
            <div class="listing-detail-info">
                <div class="price-section">
                    <h3>Cena</h3>
                    <p class="listing-price">${listing.price.toFixed(2)} €</p>
                </div>
                <div class="details-section">
                    <h3>Detaily</h3>
                    <p><strong>Kategória:</strong> ${getCategoryName(listing.category)}</p>
                    <p><strong>Stav:</strong> ${getConditionName(listing.condition)}</p>
                    <p><strong>Lokalita:</strong> ${listing.location}</p>
                </div>
                <div class="description-section">
                    <h3>Popis</h3>
                    <p>${listing.description}</p>
                </div>
                <div class="contact-section">
                    <h3>Kontakt</h3>
                    <p><i class="fas fa-user"></i> ${listing.contactName}</p>
                    <p><i class="fas fa-envelope"></i> ${listing.contactEmail}</p>
                    ${listing.contactPhone ? `
                        <p><i class="fas fa-phone"></i> ${listing.contactPhone}</p>
                    ` : ''}
                </div>
            </div>
            ${isAdmin || (currentUser && currentUser.email === listing.contactEmail) ? `
                <div class="admin-actions">
                    <button class="admin-btn edit-btn" onclick="editListing(${listing.id})">
                        <i class="fas fa-edit"></i> Upraviť
                    </button>
                    <button class="admin-btn delete-btn" onclick="deleteListing(${listing.id})">
                        <i class="fas fa-trash"></i> Vymazať
                    </button>
                </div>
            ` : ''}
        `;

        detailModal.style.display = 'block';
    }

    // Vykreslenie inzerátov
    function renderListings() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const priceFrom = parseFloat(priceFromInput.value) || 0;
        const priceTo = parseFloat(priceToInput.value) || Infinity;
        const sortBy = sortFilter.value;

        let filteredListings = listings.filter(listing => {
            const matchesSearch = (
                listing.title.toLowerCase().includes(searchTerm) ||
                listing.description.toLowerCase().includes(searchTerm)
            );
            const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
            const matchesPrice = listing.price >= priceFrom && listing.price <= priceTo;

            return matchesSearch && matchesCategory && matchesPrice;
        });

        // Zoradenie
        filteredListings.sort((a, b) => {
            switch (sortBy) {
                case 'priceAsc':
                    return a.price - b.price;
                case 'priceDesc':
                    return b.price - a.price;
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                default: // newest
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        listingsContainer.innerHTML = filteredListings.length === 0 ? `
            <div class="no-listings">
                <i class="fas fa-search"></i>
                <p>Neboli nájdené žiadne inzeráty</p>
            </div>
        ` : filteredListings.map(listing => `
            <div class="listing-card" onclick="showListingDetail(${listing.id})">
                <img src="${listing.photos[0]}" alt="${listing.title}" class="listing-image">
                <div class="listing-content">
                    <div class="listing-price">${listing.price.toFixed(2)} €</div>
                    <h3 class="listing-title">${listing.title}</h3>
                    <div class="listing-info">
                        <div class="listing-info-row">
                            <i class="fas fa-tag"></i>
                            <span>${getCategoryName(listing.category)}</span>
                        </div>
                        <div class="listing-info-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${listing.location}</span>
                        </div>
                        <div class="listing-info-row">
                            <i class="fas fa-clock"></i>
                            <span>${formatDate(listing.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Pod funkcie
    function handlePhotoUpload(e) {
        const files = e.target.files;
        if (files.length > 5) {
            alert('Môžete nahrať maximálne 5 fotografií');
            e.target.value = '';
            return;
        }

        photoPreview.innerHTML = '';
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('div');
                img.className = 'preview-image';
                img.style.backgroundImage = `url(${e.target.result})`;
                photoPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    function getCategoryName(category) {
        const categories = {
            'bikes': 'Bicykle',
            'components': 'Komponenty',
            'accessories': 'Príslušenstvo',
            'clothing': 'Oblečenie',
            'other': 'Ostatné'
        };
        return categories[category] || category;
    }

    function getConditionName(condition) {
        const conditions = {
            'new': 'Nové',
            'like-new': 'Ako nové',
            'good': 'Dobré',
            'used': 'Používané',
            'for-parts': 'Na súčiastky'
        };
        return conditions[condition] || condition;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('sk-SK', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    }

    // Admin funkcie
    window.editListing = function(listingId) {
        const listing = listings.find(l => l.id === listingId);
        const enteredPassword = prompt('Zadajte heslo pre úpravu inzerátu:');
        
        if (enteredPassword === listing.password || 
            (prompt('Admin meno:') === ADMIN_USERNAME && prompt('Admin heslo:') === ADMIN_PASSWORD)) {
            currentListingId = listingId;
            document.getElementById('listingTitle').value = listing.title;
            document.getElementById('listingCategory').value = listing.category;
            document.getElementById('listingPrice').value = listing.price;
            document.getElementById('listingCondition').value = listing.condition;
            document.getElementById('listingDescription').value = listing.description;
            document.getElementById('listingLocation').value = listing.location;
            document.getElementById('contactName').value = listing.contactName;
            document.getElementById('contactEmail').value = listing.contactEmail;
            document.getElementById('contactPhone').value = listing.contactPhone;
            document.getElementById('listingPassword').value = listing.password;
            
            photoPreview.innerHTML = listing.photos.map(photo => `
                <div class="preview-image" style="background-image: url(${photo})"></div>
            `).join('');
            
            listingModal.style.display = 'block';
            detailModal.style.display = 'none';
        } else {
            showNotification('Nesprávne heslo!', 'error');
        }
    };

    window.deleteListing = function(listingId) {
        const listing = listings.find(l => l.id === listingId);
        const enteredPassword = prompt('Zadajte heslo pre vymazanie inzerátu:');
        
        if (enteredPassword === listing.password || 
            (prompt('Admin meno:') === ADMIN_USERNAME && prompt('Admin heslo:') === ADMIN_PASSWORD)) {
            if (confirm('Naozaj chcete vymazať tento inzerát?')) {
                listings = listings.filter(l => l.id !== listingId);
                localStorage.setItem('bazarListings', JSON.stringify(listings));
                detailModal.style.display = 'none';
                renderListings();
                showNotification('Inzerát bol vymazaný', 'success');
            }
        } else {
            showNotification('Nesprávne heslo!', 'error');
        }
    };

    // Exportovanie funkcií do globálneho scope
    window.showListingDetail = showListingDetail;

    // Počiatočné vykreslenie
    renderListings();

    // Opravené zatvorenie modálneho okna
    window.addEventListener('click', (e) => {
        if (e.target === listingModal || e.target === detailModal) {
            listingModal.style.display = 'none';
            detailModal.style.display = 'none';
            listingForm.reset();
            photoPreview.innerHTML = '';
        }
    });
}); 
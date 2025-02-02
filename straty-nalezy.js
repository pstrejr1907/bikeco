document.addEventListener('DOMContentLoaded', function() {
    const itemsContainer = document.getElementById('itemsContainer');
    const createLostBtn = document.getElementById('createLostBtn');
    const createFoundBtn = document.getElementById('createFoundBtn');
    const itemModal = document.getElementById('itemModal');
    const itemForm = document.getElementById('itemForm');
    const closeBtn = document.querySelector('.close');
    const searchInput = document.getElementById('searchItems');
    const categoryFilter = document.getElementById('categoryFilter');
    const typeButtons = document.querySelectorAll('.type-buttons button');

    let items = JSON.parse(localStorage.getItem('lostFoundItems')) || [];

    const ADMIN_USERNAME = 'root';
    const ADMIN_PASSWORD = 'root';
    let isAdmin = false;

    // Pridanie admin tlačidla do hlavičky
    const headerButtons = document.querySelector('.header-buttons');
    const adminBtn = document.createElement('button');
    adminBtn.className = 'create-btn admin';
    adminBtn.innerHTML = '<i class="fas fa-lock"></i><span>Admin</span>';
    headerButtons.appendChild(adminBtn);

    // Admin login
    adminBtn.addEventListener('click', () => {
        const username = prompt('Zadajte admin meno:');
        const password = prompt('Zadajte admin heslo:');

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            isAdmin = true;
            showNotification('Prihlásenie úspešné!', 'success');
            adminBtn.innerHTML = '<i class="fas fa-unlock"></i><span>Odhlásit</span>';
            renderItems(); // Prekreslenie s admin možnosťami
        } else if (username !== null && password !== null) {
            showNotification('Nesprávne prihlasovacie údaje!', 'error');
        }
    });

    // Event Listeners
    createLostBtn.addEventListener('click', () => showItemModal('lost'));
    createFoundBtn.addEventListener('click', () => showItemModal('found'));
    closeBtn.addEventListener('click', () => itemModal.style.display = 'none');

    window.addEventListener('click', (e) => {
        if (e.target == itemModal) itemModal.style.display = 'none';
    });

    // Filtrovanie a vyhľadávanie
    searchInput.addEventListener('input', renderItems);
    categoryFilter.addEventListener('change', renderItems);
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            typeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderItems();
        });
    });

    // Formulár pre vytvorenie/editáciu inzerátu
    itemForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            id: Date.now(),
            type: document.getElementById('itemType').value,
            category: document.getElementById('itemCategory').value,
            title: document.getElementById('itemTitle').value,
            description: document.getElementById('itemDescription').value,
            location: document.getElementById('itemLocation').value,
            date: document.getElementById('itemDate').value,
            contactName: document.getElementById('contactName').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value,
            createdAt: new Date().toISOString()
        };

        // Spracovanie obrázku
        const imageFile = document.getElementById('itemImage').files[0];
        if (imageFile) {
            formData.image = await convertImageToBase64(imageFile);
        }

        items.unshift(formData); // Pridanie na začiatok poľa
        localStorage.setItem('lostFoundItems', JSON.stringify(items));
        
        itemModal.style.display = 'none';
        itemForm.reset();
        renderItems();

        // Notifikácia o úspešnom pridaní
        showNotification('Inzerát bol úspešne pridaný!', 'success');
    });

    // Zobrazenie modalu pre vytvorenie inzerátu
    function showItemModal(type) {
        document.getElementById('itemType').value = type;
        document.getElementById('modalTitle').textContent = 
            type === 'lost' ? 'Nový inzerát - Stratené' : 'Nový inzerát - Nájdené';
        itemModal.style.display = 'block';
    }

    // Konverzia obrázku na Base64
    function convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Vykreslenie inzerátov
    function renderItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const selectedType = document.querySelector('.type-buttons button.active').dataset.type;

        let filteredItems = items.filter(item => {
            const matchesSearch = (
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm)
            );
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesType = selectedType === 'all' || item.type === selectedType;

            return matchesSearch && matchesCategory && matchesType;
        });

        itemsContainer.innerHTML = '';
        
        if (filteredItems.length === 0) {
            itemsContainer.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-search"></i>
                    <p>Neboli nájdené žiadne inzeráty</p>
                </div>
            `;
            return;
        }

        filteredItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            
            const date = new Date(item.date).toLocaleDateString('sk-SK', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            card.innerHTML = `
                ${item.image ? `
                    <img src="${item.image}" alt="${item.title}" class="item-image">
                ` : ''}
                <div class="item-content">
                    <span class="item-type ${item.type}">
                        ${item.type === 'lost' ? 'Stratené' : 'Nájdené'}
                    </span>
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-info">
                        <div class="item-info-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${item.location}</span>
                        </div>
                        <div class="item-info-row">
                            <i class="fas fa-calendar"></i>
                            <span>${date}</span>
                        </div>
                        <div class="item-info-row">
                            <i class="fas fa-tag"></i>
                            <span>${getCategoryName(item.category)}</span>
                        </div>
                    </div>
                    <p>${item.description}</p>
                    <button class="contact-btn" onclick="showContactInfo('${item.id}')">
                        <i class="fas fa-envelope"></i>
                        Kontaktovať
                    </button>
                </div>
            `;
            
            // Pridanie admin tlačidiel
            if (isAdmin) {
                const adminActions = document.createElement('div');
                adminActions.className = 'admin-actions';
                adminActions.innerHTML = `
                    <button class="delete-btn" onclick="deleteItem(${item.id})">
                        <i class="fas fa-trash"></i>
                        Vymazať
                    </button>
                `;
                card.querySelector('.item-content').appendChild(adminActions);
            }
            
            itemsContainer.appendChild(card);
        });
    }

    // Zobrazenie kontaktných informácií
    window.showContactInfo = function(itemId) {
        const item = items.find(i => i.id === parseInt(itemId));
        if (!item) return;

        const contactInfo = `
            Kontaktné údaje:
            Meno: ${item.contactName}
            Email: ${item.contactEmail}
            ${item.contactPhone ? `Telefón: ${item.contactPhone}` : ''}
        `;

        alert(contactInfo);
    };

    // Pomocné funkcie
    function getCategoryName(category) {
        const categories = {
            'bike': 'Bicykel',
            'parts': 'Súčiastky',
            'accessories': 'Doplnky',
            'clothes': 'Oblečenie',
            'other': 'Ostatné'
        };
        return categories[category] || category;
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

    // Funkcia pre vymazanie inzerátu
    window.deleteItem = function(itemId) {
        if (!isAdmin) return;

        if (confirm('Naozaj chcete vymazať tento inzerát?')) {
            items = items.filter(item => item.id !== itemId);
            localStorage.setItem('lostFoundItems', JSON.stringify(items));
            renderItems();
            showNotification('Inzerát bol vymazaný', 'success');
        }
    };

    renderItems();
}); 
document.addEventListener('DOMContentLoaded', function() {
    const postsContainer = document.getElementById('postsContainer');
    const newPostForm = document.getElementById('newPostForm');
    const adminModal = document.getElementById('adminModal');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const closeBtn = document.querySelector('.close');

    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let isAdmin = false;

    // Admin Modal
    adminLoginBtn.addEventListener('click', () => {
        adminModal.style.display = 'block';
        setTimeout(() => {
            adminModal.classList.add('show');
        }, 10);
    });

    function closeModal() {
        adminModal.classList.remove('show');
        setTimeout(() => {
            adminModal.style.display = 'none';
        }, 300);
    }

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target == adminModal) {
            closeModal();
        }
    });

    // Admin Login
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (username === 'root' && password === 'root') {
            isAdmin = true;
            adminModal.style.display = 'none';
            showAdminPanel();
            renderPosts();
            alert('Prihlásenie úspešné!');
        } else {
            alert('Nesprávne prihlasovacie údaje!');
        }
        adminLoginForm.reset();
    });

    // Zobrazenie admin panelu
    function showAdminPanel() {
        const existingPanel = document.querySelector('.admin-panel');
        if (!existingPanel) {
            const adminPanel = document.createElement('div');
            adminPanel.className = 'admin-panel';
            adminPanel.innerHTML = `
                <h2>Admin Panel</h2>
                <div class="admin-controls">
                    <button class="delete-all-btn" id="deleteAllBtn">
                        <i class="fas fa-trash"></i> Vymazať všetky príspevky
                    </button>
                    <button class="logout-btn" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Odhlásiť sa
                    </button>
                </div>
            `;
            
            const container = document.querySelector('.container');
            container.insertBefore(adminPanel, container.children[2]);

            // Delete all 
            document.getElementById('deleteAllBtn').addEventListener('click', () => {
                if (confirm('Naozaj chcete vymazať všetky príspevky?')) {
                    posts = [];
                    localStorage.setItem('posts', JSON.stringify(posts));
                    renderPosts();
                    alert('Všetky príspevky boli vymazané!');
                }
            });

            //  odhlasnie handler
            document.getElementById('logoutBtn').addEventListener('click', () => {
                isAdmin = false;
                adminPanel.remove();
                renderPosts();
                alert('Boli ste odhlásený!');
            });
        }
    }

    // Pridanie nového 
    newPostForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const author = document.getElementById('authorName').value;
        const content = document.getElementById('postContent').value;
        
        const newPost = {
            id: Date.now(),
            author: author,
            content: content,
            date: new Date().toISOString()
        };

        posts.unshift(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        
        renderPosts();
        newPostForm.reset();
    });

    // Zobrazenie príspevkov
    function renderPosts() {
        postsContainer.innerHTML = '';
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-card';
            
            const date = new Date(post.date).toLocaleDateString('sk-SK', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            postElement.innerHTML = `
                <div class="post-header">
                    <span class="post-author">od ${post.author}</span>
                    <span class="post-date">${date}</span>
                    ${isAdmin ? `
                        <button class="delete-post-btn" data-id="${post.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                <p class="post-content">${post.content}</p>
            `;
            
            postsContainer.appendChild(postElement);

            // Pridanie event listenera pre delete tlačidlo ak je admin
            if (isAdmin) {
                const deleteBtn = postElement.querySelector('.delete-post-btn');
                deleteBtn.addEventListener('click', () => {
                    if (confirm('Naozaj chcete vymazať tento príspevok?')) {
                        posts = posts.filter(p => p.id !== post.id);
                        localStorage.setItem('posts', JSON.stringify(posts));
                        renderPosts();
                    }
                });
            }
        });
    }

    // Počiatočné zobrazenie príspevkov
    renderPosts();

    // Pridanie efektu tlačidla
    const adminBtn = document.getElementById('adminLoginBtn');
    
    adminBtn.addEventListener('mouseenter', () => {
        adminBtn.querySelector('.admin-btn-content').style.transform = 'translateX(-100%)';
        adminBtn.querySelector('.admin-btn-hover').style.transform = 'translateX(0)';
    });

    adminBtn.addEventListener('mouseleave', () => {
        adminBtn.querySelector('.admin-btn-content').style.transform = 'translateX(0)';
        adminBtn.querySelector('.admin-btn-hover').style.transform = 'translateX(100%)';
    });
}); 
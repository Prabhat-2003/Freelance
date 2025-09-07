
        // API Configuration
        const API_BASE = 'http://localhost:5000/api';

        // State Management
        let currentUser = null;
        let authToken = null;

        // DOM Elements
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const closeModalButtons = document.querySelectorAll('.close-modal');
        const switchToSignup = document.getElementById('switchToSignup');
        const switchToLogin = document.getElementById('switchToLogin');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const searchInput = document.querySelector('.search-bar input');
        const searchButton = document.querySelector('.search-bar button');

        // Initialize the application
        function init() {
            loadAuth();
            setupEventListeners();
            setupHeaderAuth();
            loadServicesList();
        }

        // Event Listeners
        function setupEventListeners() {
            // Modal triggers
            loginBtn.addEventListener('click', () => openModal('loginModal'));
            signupBtn.addEventListener('click', () => openModal('signupModal'));
            
            // Modal close buttons
            closeModalButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const modal = btn.closest('.modal');
                    closeModal(modal.id);
                });
            });
            
            // Switch between modals
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal('loginModal');
                openModal('signupModal');
            });
            
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal('signupModal');
                openModal('loginModal');
            });
            
            // Form submissions
            loginForm.addEventListener('submit', handleLogin);
            signupForm.addEventListener('submit', handleSignup);
            
            // Search functionality
            searchButton.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
            
            // Category card clicks
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', () => {
                    const category = card.querySelector('h3').textContent;
                    alert(`You selected the ${category} category!`);
                    // In a real app, this would filter services by category
                });
            });
            
            // Navigation clicks
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = link.textContent;
                    alert(`Navigating to ${page} page!`);
                    // In a real app, this would navigate to the corresponding page
                });
            });
        }

        // Modal Functions
        function openModal(modalId) {
            document.getElementById(modalId).style.display = 'flex';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        // Auth Functions
        function loadAuth() {
            const token = localStorage.getItem('authToken');
            const user = localStorage.getItem('user');
            if (token && user) {
                authToken = token;
                currentUser = JSON.parse(user);
            }
        }

        function saveAuth(token, user) {
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            authToken = token;
            currentUser = user;
        }

        function clearAuth() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            authToken = null;
            currentUser = null;
        }

        // API Call Function
        async function apiCall(url, options = {}) {
            const headers = options.headers || {};
            headers['Content-Type'] = 'application/json';
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
            
            try {
                const res = await fetch(url, { ...options, headers });
                const data = await res.json();
                
                if (!res.ok) {
                    throw new Error(data.message || 'Request failed');
                }
                
                return data;
            } catch (error) {
                console.error('API call error:', error);
                throw error;
            }
        }

        // Form Handlers
        async function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const data = await apiCall(`${API_BASE}/login`, {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                
                saveAuth(data.token, data.user);
                setupHeaderAuth();
                closeModal('loginModal');
                alert('Login successful! Welcome back.');
            } catch (error) {
                alert('Login failed: ' + error.message);
            }
        }

        async function handleSignup(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const userType = document.getElementById('userType').value;
            
            try {
                const data = await apiCall(`${API_BASE}/register`, {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, userType })
                });
                
                saveAuth(data.token, data.user);
                setupHeaderAuth();
                closeModal('signupModal');
                alert('Registration successful! Welcome to FreelanceHub.');
            } catch (error) {
                alert('Registration failed: ' + error.message);
            }
        }

        // UI Update Functions
        function setupHeaderAuth() {
            const authButtons = document.querySelector('.auth-buttons');
            if (!authButtons) return;

            if (currentUser) {
                authButtons.innerHTML = `
                                        <div class="user-menu">
                        <button class="btn btn-outline" id="userMenuBtn">
                            <i class="fas fa-user"></i> ${currentUser.name}
                        </button>
                        <div class="user-dropdown" id="userDropdown">
                            <a href="#"><i class="fas fa-user-circle"></i> Profile</a>
                            <a href="#"><i class="fas fa-briefcase"></i> My Projects</a>
                            <a href="#"><i class="fas fa-cog"></i> Settings</a>
                            <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                        </div>
                    </div>
                `;
                
                // Add event listeners for the new elements
                document.getElementById('userMenuBtn').addEventListener('click', toggleUserDropdown);
                document.getElementById('logoutBtn').addEventListener('click', handleLogout);
                
                // Close dropdown when clicking elsewhere
                document.addEventListener('click', (e) => {
                    const dropdown = document.getElementById('userDropdown');
                    const menuBtn = document.getElementById('userMenuBtn');
                    if (dropdown && menuBtn && !e.target.closest('.user-menu')) {
                        dropdown.style.display = 'none';
                    }
                });
            } else {
                authButtons.innerHTML = `
                    <button class="btn btn-outline" id="loginBtn">Log In</button>
                    <button class="btn btn-primary" id="signupBtn">Sign Up</button>
                `;
                
                // Reattach event listeners
                document.getElementById('loginBtn').addEventListener('click', () => openModal('loginModal'));
                document.getElementById('signupBtn').addEventListener('click', () => openModal('signupModal'));
            }
        }

        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            } else {
                dropdown.style.display = 'block';
            }
        }

        function handleLogout(e) {
            e.preventDefault();
            clearAuth();
            setupHeaderAuth();
            alert('You have been logged out successfully.');
        }

        // Search Functionality
        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                alert(`Searching for: ${query}`);
                // In a real app, this would call an API to search for services
                // and display the results
            }
        }

        // Service Loading
        async function loadServicesList() {
            try {
                // This would be an API call in a real application
                // const services = await apiCall(`${API_BASE}/services`);
                
                // For demo purposes, we'll just log a message
                console.log('Services loaded successfully');
            } catch (error) {
                console.error('Failed to load services:', error);
            }
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
 
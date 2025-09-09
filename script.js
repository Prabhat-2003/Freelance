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
const navLinks = document.querySelectorAll('nav a');
const pages = document.querySelectorAll('.page');
const mainContent = document.getElementById('main-content');

// Initialize the application
function init() {
    loadAuth();
    setupEventListeners();
    setupHeaderAuth();
    loadServices();
    loadCategories();
    loadJobs();
    loadFreelancers();
    loadReviews();
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
    
    // Navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page') + '-page';
            navigateToPage(pageId);
        });
    });
    
    // Category card clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.category-card')) {
            const card = e.target.closest('.category-card');
            const category = card.querySelector('h3').textContent;
            navigateToPage('categories-page');
            // In a real app, this would filter services by category
        }
    });
    // Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mainNav = document.getElementById('mainNav');

if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        
        // Toggle icon between hamburger and close
        const icon = mobileMenuToggle.querySelector('i');
        if (mainNav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close menu when clicking on nav links
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Navigation Functions
function navigateToPage(pageId) {
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected page
    document.getElementById(pageId).classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
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
        navigateToPage('find-work-page');
        // In a real app, this would call an API to search for services
        // and display the results
    }
}

// Data Loading Functions
async function loadServices() {
    try {
        const services = await apiCall(`${API_BASE}/services`);
        const servicesContainer = document.getElementById('services-container');
        
        servicesContainer.innerHTML = services.map(service => `
            <div class="service-card">
                <div class="service-image">
                    <i class="fas fa-${getServiceIcon(service.title)}"></i>
                </div>
                <div class="service-content">
                    <h3 class="service-title">${service.title}</h3>
                    <div class="service-seller">
                        <div class="seller-avatar">${service.seller.name.charAt(0)}</div>
                        <span>${service.seller.name}</span>
                    </div>
                    <div class="service-meta">
                        <div class="rating">
                            <i class="fas fa-star"></i>
                            <span>${service.rating} (${service.reviews ? service.reviews.length : 0})</span>
                        </div>
                        <div class="price">Starting at $${service.price}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load services:', error);
        // Fallback to static content if API fails
        document.getElementById('services-container').innerHTML = `
            <div class="service-card">
                <div class="service-image">
                    <i class="fas fa-paint-brush"></i>
                </div>
                <div class="service-content">
                    <h3 class="service-title">I will design your website UI/UX</h3>
                    <div class="service-seller">
                        <div class="seller-avatar">JD</div>
                        <span>John Designer</span>
                    </div>
                    <div class="service-meta">
                        <div class="rating">
                            <i class="fas fa-star"></i>
                            <span>4.9 (128)</span>
                        </div>
                        <div class="price">Starting at $50</div>
                    </div>
                </div>
            </div>
            
            <div class="service-card">
                <div class="service-image">
                    <i class="fas fa-code"></i>
                </div>
                <div class="service-content">
                    <h3 class="service-title">I will develop a responsive website</h3>
                    <div class="service-seller">
                        <div class="seller-avatar">SD</div>
                        <span>Sarah Developer</span>
                    </div>
                    <div class="service-meta">
                        <div class="rating">
                            <i class="fas fa-star"></i>
                            <span>4.8 (96)</span>
                        </div>
                        <div class="price">Starting at $100</div>
                    </div>
                </div>
            </div>
            
            <div class="service-card">
                <div class="service-image">
                    <i class="fas fa-search"></i>
                </div>
                <div class="service-content">
                    <h3 class="service-title">I will do SEO for your website</h3>
                    <div class="service-seller">
                        <div class="seller-avatar">ME</div>
                        <span>Mike Expert</span>
                    </div>
                    <div class="service-meta">
                        <div class="rating">
                            <i class="fas fa-star"></i>
                            <span>4.7 (87)</span>
                        </div>
                        <div class="price">Starting at $75</div>
                    </div>
                </div>
            </div>
        `;
    }
}

async function loadCategories() {
    try {
        const categories = [
            { name: "Web Development", icon: "laptop-code", description: "Website, app development and programming services" },
            { name: "Design & Creative", icon: "paint-brush", description: "Logo design, UI/UX, illustration and video editing" },
            { name: "Digital Marketing", icon: "chart-line", description: "SEO, social media marketing and content creation" },
            { name: "Writing & Translation", icon: "pencil-alt", description: "Content writing, translation and proofreading" },
            { name: "AI Services", icon: "robot", description: "AI development, chatbots, and machine learning" },
            { name: "Admin & Support", icon: "headset", description: "Virtual assistance and customer support" },
            { name: "Finance & Accounting", icon: "coins", description: "Bookkeeping, financial consulting and tax services" },
            { name: "Legal", icon: "gavel", description: "Legal consulting, contract review and documentation" },
            { name: "HR & Training", icon: "users", description: "Recruitment, training and HR consulting" },
            { name: "Engineering & Architecture", icon: "ruler-combined", description: "CAD designs, engineering solutions and architectural plans" }
        ];
        
        const categoriesContainer = document.getElementById('categories-container');
        
        categoriesContainer.innerHTML = categories.map(category => `
            <div class="category-card">
                <div class="category-icon">
                    <i class="fas fa-${category.icon}"></i>
                </div>
                <h3>${category.name}</h3>
                <p>${category.description}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadJobs() {
    try {
        const jobs = [
            { 
                title: "Website Redesign", 
                budget: "$500-$1000", 
                description: "Looking for a skilled web designer to redesign our company website with a modern look and feel.",
                skills: ["Web Design", "UI/UX", "Responsive Design"]
            },
            { 
                title: "Mobile App Development", 
                budget: "$2000-$5000", 
                description: "Need an experienced React Native developer to build a cross-platform mobile application.",
                skills: ["React Native", "JavaScript", "API Integration"]
            },
            { 
                title: "SEO Optimization", 
                budget: "$300-$800", 
                description: "SEO expert needed to optimize our e-commerce website and improve search rankings.",
                skills: ["SEO", "Google Analytics", "Keyword Research"]
            },
            { 
                title: "Logo Design", 
                budget: "$100-$300", 
                description: "Creative designer needed to create a modern logo for our startup company.",
                skills: ["Logo Design", "Branding", "Adobe Illustrator"]
            },
            { 
                title: "Content Writing", 
                budget: "$200-$500", 
                description: "Looking for a skilled writer to create blog posts and articles for our website.",
                skills: ["Content Writing", "SEO", "Blogging"]
            },
            { 
                title: "Data Analysis", 
                budget: "$400-$900", 
                description: "Data analyst needed to analyze customer data and provide insights.",
                skills: ["Excel", "SQL", "Data Visualization"]
            }
        ];
        
        const jobsContainer = document.getElementById('jobs-container');
        
        jobsContainer.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3 class="job-title">${job.title}</h3>
                <div class="job-budget">Budget: ${job.budget}</div>
                <p class="job-description">${job.description}</p>
                <div class="job-skills">
                    ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
                <button class="btn btn-primary">Apply Now</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load jobs:', error);
    }
}

async function loadFreelancers() {
    try {
        const freelancers = [
            { 
                name: "John Designer", 
                title: "UI/UX Designer", 
                skills: ["UI Design", "UX Research", "Figma", "Prototyping"],
                rating: 4.9
            },
            { 
                name: "Sarah Developer", 
                title: "Full Stack Developer", 
                skills: ["React", "Node.js", "MongoDB", "API Development"],
                rating: 4.8
            },
            { 
                name: "Mike Marketer", 
                title: "Digital Marketing Expert", 
                skills: ["SEO", "Google Ads", "Social Media", "Content Strategy"],
                rating: 4.7
            },
            { 
                name: "Emma Writer", 
                title: "Content Writer", 
                skills: ["Blog Writing", "SEO Content", "Copywriting", "Editing"],
                rating: 4.9
            },
            { 
                name: "David Analyst", 
                title: "Data Analyst", 
                skills: ["Excel", "SQL", "Python", "Data Visualization"],
                rating: 4.6
            },
            { 
                name: "Lisa Consultant", 
                title: "Business Consultant", 
                skills: ["Strategy", "Market Research", "Planning", "Coaching"],
                rating: 4.8
            }
        ];
        
        const freelancersContainer = document.getElementById('freelancers-container');
        
        freelancersContainer.innerHTML = freelancers.map(freelancer => `
            <div class="freelancer-card">
                <div class="freelancer-avatar">${freelancer.name.charAt(0)}</div>
                <h3 class="freelancer-name">${freelancer.name}</h3>
                <p class="freelancer-title">${freelancer.title}</p>
                <div class="freelancer-skills">
                    ${freelancer.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
                <div class="freelancer-rating">
                    ${getStarRating(freelancer.rating)}
                    <span>${freelancer.rating}</span>
                </div>
                <button class="btn btn-outline">View Profile</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load freelancers:', error);
    }
}

async function loadReviews() {
    try {
        const reviews = [
            { 
                reviewer: "Alex Johnson", 
                rating: 5, 
                text: "Found an amazing developer for my project. The quality of work exceeded my expectations and was delivered ahead of schedule.",
                project: "E-commerce Website"
            },
            { 
                reviewer: "Maria Garcia", 
                rating: 5, 
                text: "The designer I hired created a beautiful logo and brand identity for my business. Communication was excellent throughout the project.",
                project: "Logo Design"
            },
            { 
                reviewer: "David Kim", 
                rating: 4, 
                text: "Great platform for finding talented freelancers. The escrow payment system gives peace of mind when working with new contractors.",
                project: "Mobile App Development"
            },
            { 
                reviewer: "Sarah Williams", 
                rating: 5, 
                text: "I've used FreelanceHub for multiple projects now and always found qualified professionals. Saved me so much time and effort.",
                project: "Content Writing"
            },
            { 
                reviewer: "James Wilson", 
                rating: 4, 
                text: "The freelancer I hired was knowledgeable and delivered quality work. The platform made the entire process smooth and hassle-free.",
                project: "SEO Optimization"
            },
            { 
                reviewer: "Emma Thompson", 
                rating: 5, 
                text: "As a small business owner, FreelanceHub has been invaluable for finding affordable talent. Highly recommend this platform!",
                project: "Social Media Marketing"
            }
        ];
        
        const reviewsContainer = document.getElementById('reviews-container');
        
        reviewsContainer.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="reviewer-avatar">${review.reviewer.charAt(0)}</div>
                    <div class="reviewer-info">
                        <h4>${review.reviewer}</h4>
                        <div class="review-rating">${getStarRating(review.rating)}</div>
                    </div>
                </div>
                <p class="review-text">"${review.text}"</p>
                <div class="project">Project: ${review.project}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load reviews:', error);
    }
}

// Helper Functions
function getServiceIcon(title) {
    const icons = {
        'design': 'paint-brush',
        'develop': 'code',
        'seo': 'search',
        'write': 'pencil-alt',
        'market': 'bullhorn',
        'video': 'video'
    };
    
    for (const [key, value] of Object.entries(icons)) {
        if (title.toLowerCase().includes(key)) {
            return value;
        }
    }
    
    return 'tasks';
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
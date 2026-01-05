// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.adminCredentials = {
            username: 'sumisanskrit',
            password: '9761818'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkRememberedUser();
        this.initializeFormSwitching();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Registration form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegistration(e));
        }

        // Forgot password form
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        // Password toggle buttons
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => this.togglePassword(e));
        });

        // Password strength indicator
        const regPassword = document.getElementById('reg-password');
        if (regPassword) {
            regPassword.addEventListener('input', (e) => this.checkPasswordStrength(e));
        }

        // Language toggle for login page
        const loginLangToggle = document.getElementById('login-lang-toggle');
        if (loginLangToggle) {
            loginLangToggle.addEventListener('click', () => this.toggleLoginLanguage());
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Validate credentials
        const user = this.validateUser(email, password);
        
        if (user) {
            if (user.status === 'pending') {
                this.showMessage('Your account is pending verification by admin.', 'error');
                return;
            }

            if (user.status === 'rejected') {
                this.showMessage('Your account has been rejected. Please contact admin.', 'error');
                return;
            }

            this.currentUser = user;
            
            // Store session
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify({
                    email: user.email,
                    loginTime: new Date().toISOString()
                }));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
            }

            this.showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            this.showMessage('Invalid email or password.', 'error');
        }
    }

    handleRegistration(e) {
        e.preventDefault();
        
        // Get form data
        const userData = {
            fullName: document.getElementById('reg-fullname').value,
            phone: document.getElementById('reg-phone').value,
            email: document.getElementById('reg-email').value,
            province: document.getElementById('reg-province').value,
            district: document.getElementById('reg-district').value,
            village: document.getElementById('reg-village').value,
            userType: document.getElementById('reg-usertype').value,
            password: document.getElementById('reg-password').value,
            confirmPassword: document.getElementById('reg-confirm-password').value,
            photoFile: document.getElementById('reg-photo').files[0]
        };

        // Validate data
        if (!this.validateRegistration(userData)) {
            return;
        }

        // Check if email already exists
        if (this.users.find(u => u.email === userData.email)) {
            this.showMessage('Email already registered.', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            fullName: userData.fullName,
            phone: userData.phone,
            email: userData.email,
            province: userData.province,
            district: userData.district,
            village: userData.village,
            userType: userData.userType,
            password: this.hashPassword(userData.password),
            photo: null,
            status: 'pending', // pending, active, rejected
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        // Handle photo upload if provided
        if (userData.photoFile) {
            this.handlePhotoUpload(userData.photoFile, newUser.id)
                .then(photoData => {
                    newUser.photo = photoData;
                    this.completeRegistration(newUser);
                })
                .catch(() => {
                    this.completeRegistration(newUser);
                });
        } else {
            this.completeRegistration(newUser);
        }
    }

    completeRegistration(user) {
        this.users.push(user);
        this.saveUsers();
        
        this.showMessage('Registration successful! Please wait for admin verification.', 'success');
        
        // Clear form
        document.getElementById('registerForm').reset();
        
        // Switch to login form
        setTimeout(() => {
            this.switchForm('login-form');
        }, 2000);
    }

    handlePhotoUpload(file, userId) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    uploadedAt: new Date().toISOString()
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    validateRegistration(data) {
        // Check password match
        if (data.password !== data.confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return false;
        }

        // Check password strength
        if (!this.isStrongPassword(data.password)) {
            this.showMessage('Password is not strong enough.', 'error');
            return false;
        }

        // Validate phone number (Nepali format)
        const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/;
        if (!phoneRegex.test(data.phone)) {
            this.showMessage('Please enter a valid Nepali phone number.', 'error');
            return false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return false;
        }

        return true;
    }

    isStrongPassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }

    checkPasswordStrength(e) {
        const password = e.target.value;
        const strengthIndicator = document.getElementById('password-strength');
        
        if (!strengthIndicator) return;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColors = ['#e74c3c', '#e67e22', '#f39c12', '#27ae60', '#2ecc71'];

        strengthIndicator.textContent = strengthLabels[strength] || 'Very Weak';
        strengthIndicator.style.color = strengthColors[strength] || '#e74c3c';
    }

    handleForgotPassword(e) {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;

        // Check if email exists
        const user = this.users.find(u => u.email === email);
        
        if (user) {
            // In a real application, this would send an email
            // For demo purposes, we'll show a success message
            this.showMessage('Password reset link has been sent to your email.', 'success');
            
            // Switch back to login form
            setTimeout(() => {
                this.switchForm('login-form');
            }, 2000);
        } else {
            this.showMessage('Email not found.', 'error');
        }
    }

    togglePassword(e) {
        const button = e.currentTarget;
        const input = button.previousElementSibling;
        const icon = button.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    validateUser(email, password) {
        const user = this.users.find(u => u.email === email);
        if (user && this.verifyPassword(password, user.password)) {
            return user;
        }
        return null;
    }

    verifyPassword(password, hashedPassword) {
        // Simple hash comparison (in production, use proper bcrypt or similar)
        return this.hashPassword(password) === hashedPassword;
    }

    hashPassword(password) {
        // Simple hash function (in production, use proper bcrypt or similar)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    initializeFormSwitching() {
        document.querySelectorAll('.switch-form').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetForm = e.target.getAttribute('data-target');
                this.switchForm(targetForm);
            });
        });

        // Forgot password link
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('forgot-password-form');
            });
        }
    }

    switchForm(formId) {
        // Hide all forms
        document.querySelectorAll('.login-form-container').forEach(form => {
            form.style.display = 'none';
        });

        // Show target form with animation
        const targetForm = document.getElementById(formId);
        if (targetForm) {
            targetForm.style.display = 'block';
            targetForm.style.animation = 'fadeInUp 0.3s ease-out';
        }
    }

    checkRememberedUser() {
        const remembered = localStorage.getItem('rememberedUser');
        if (remembered) {
            try {
                const data = JSON.parse(remembered);
                const loginTime = new Date(data.loginTime);
                const now = new Date();
                const daysSinceLogin = (now - loginTime) / (1000 * 60 * 60 * 24);

                // Auto-login if within 30 days
                if (daysSinceLogin < 30) {
                    const user = this.users.find(u => u.email === data.email);
                    if (user && user.status === 'active') {
                        this.currentUser = user;
                        this.showMessage('Welcome back! Redirecting...', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    }
                } else {
                    localStorage.removeItem('rememberedUser');
                }
            } catch (e) {
                localStorage.removeItem('rememberedUser');
            }
        }
    }

    toggleLoginLanguage() {
        const currentLang = document.body.getAttribute('lang') || 'en';
        const newLang = currentLang === 'en' ? 'ne' : 'en';
        
        document.body.setAttribute('lang', newLang);
        document.getElementById('login-lang-text').textContent = newLang === 'en' ? 'नेपाली' : 'English';
        
        // Update all translatable elements
        document.querySelectorAll('[data-en][data-ne]').forEach(element => {
            const enText = element.getAttribute('data-en');
            const neText = element.getAttribute('data-ne');
            element.textContent = newLang === 'en' ? enText : neText;
        });
    }

    showMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.error-message, .success-message').forEach(msg => {
            msg.remove();
        });

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;

        const form = document.querySelector('.login-form-container:not([style*="display: none"]) form');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    // User management methods
    loadUsers() {
        const stored = localStorage.getItem('sanskritUsers');
        return stored ? JSON.parse(stored) : [];
    }

    saveUsers() {
        localStorage.setItem('sanskritUsers', JSON.stringify(this.users));
    }

    getCurrentUser() {
        // Check session storage first
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            return JSON.parse(sessionUser);
        }

        // Check local storage for remembered user
        const remembered = localStorage.getItem('rememberedUser');
        if (remembered) {
            try {
                const data = JSON.parse(remembered);
                return this.users.find(u => u.email === data.email);
            } catch (e) {
                return null;
            }
        }

        return null;
    }

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('rememberedUser');
        window.location.href = 'login.html';
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (permission === 'upload') {
            return user.status === 'active';
        }
        
        if (permission === 'admin') {
            return user.role === 'admin';
        }
        
        return false;
    }
}

// Initialize authentication system
const auth = new AuthSystem();

// Global functions for other pages
function checkAuth() {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireActiveStatus() {
    const user = auth.getCurrentUser();
    if (!user || user.status !== 'active') {
        alert('Your account is not active. Please wait for admin verification.');
        return false;
    }
    return true;
}

function logout() {
    auth.logout();
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add login/logout button to navigation if on main site
    const navMenu = document.getElementById('nav-menu');
    if (navMenu && !document.getElementById('auth-link')) {
        const authLink = document.createElement('a');
        authLink.id = 'auth-link';
        authLink.className = 'nav-link';
        authLink.href = '#';
        
        if (auth.isLoggedIn()) {
            const user = auth.getCurrentUser();
            authLink.innerHTML = `<i class="fas fa-user"></i> ${user.fullName}`;
            authLink.onclick = (e) => {
                e.preventDefault();
                if (confirm('Do you want to logout?')) {
                    logout();
                }
            };
        } else {
            authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            authLink.href = 'login.html';
        }
        
        navMenu.appendChild(authLink);
    }
});
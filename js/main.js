// DOM Elements
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const langToggle = document.getElementById('lang-toggle');
const langText = document.getElementById('lang-text');
const uploadForm = document.getElementById('upload-form');
const galleryGrid = document.getElementById('gallery-grid');
const modal = document.getElementById('gallery-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalLocation = document.getElementById('modal-location');
const modalDescription = document.getElementById('modal-description');
const closeModal = document.querySelector('.close');

// Current language state
let currentLang = 'en';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeLanguageToggle();
    initializeGalleryUpload();
    initializeScrollAnimations();
    initializeModal();
    initializeScrollSpy();
});

// Navigation Functions
function initializeNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Smooth scroll function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Language Toggle Functions
function initializeLanguageToggle() {
    langToggle.addEventListener('click', toggleLanguage);
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ne' : 'en';
    document.body.setAttribute('lang', currentLang);
    
    // Update language toggle text
    langText.textContent = currentLang === 'en' ? 'नेपाली' : 'English';
    
    // Update all translatable elements
    document.querySelectorAll('[data-en][data-ne]').forEach(element => {
        const enText = element.getAttribute('data-en');
        const neText = element.getAttribute('data-ne');
        element.textContent = currentLang === 'en' ? enText : neText;
    });
    
    // Save language preference
    localStorage.setItem('preferredLanguage', currentLang);
}

// Load saved language preference
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && savedLang !== currentLang) {
        toggleLanguage();
    }
}

// Gallery Upload Functions
function initializeGalleryUpload() {
    uploadForm.addEventListener('submit', handlePhotoUpload);
}

function handlePhotoUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('photo-upload');
    const title = document.getElementById('photo-title').value;
    const location = document.getElementById('photo-location').value;
    const description = document.getElementById('photo-description').value;
    
    if (fileInput.files.length === 0) {
        alert(currentLang === 'en' ? 'Please select a photo to upload.' : 'कृपया अपलोड गर्न फोटो चयन गर्नुहोस्।');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const galleryItem = createGalleryItem(e.target.result, title, location, description);
        galleryGrid.insertBefore(galleryItem, galleryGrid.firstChild);
        
        // Reset form
        uploadForm.reset();
        
        // Show success message
        showNotification(currentLang === 'en' ? 'Photo uploaded successfully!' : 'फोटो सफलतापूर्वक अपलोड गरियो!');
    };
    
    reader.readAsDataURL(file);
}

function createGalleryItem(imageSrc, title, location, description) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item fade-in';
    
    galleryItem.innerHTML = `
        <div class="gallery-image">
            <img src="${imageSrc}" alt="${title}">
            <div class="gallery-overlay">
                <button class="view-btn" onclick="openModal(this)">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </div>
        <div class="gallery-info">
            <h4>${title}</h4>
            <p class="location"><i class="fas fa-map-marker-alt"></i> ${location}</p>
            <p class="description">${description}</p>
        </div>
    `;
    
    // Trigger fade-in animation
    setTimeout(() => {
        galleryItem.classList.add('visible');
    }, 100);
    
    return galleryItem;
}

// Modal Functions
function initializeModal() {
    closeModal.addEventListener('click', closeGalleryModal);
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeGalleryModal();
        }
    });
}

function openModal(button) {
    const galleryItem = button.closest('.gallery-item');
    const img = galleryItem.querySelector('img');
    const title = galleryItem.querySelector('h4').textContent;
    const location = galleryItem.querySelector('.location').textContent;
    const description = galleryItem.querySelector('.description').textContent;
    
    modalImage.src = img.src;
    modalImage.alt = title;
    modalTitle.textContent = title;
    modalLocation.textContent = location;
    modalDescription.textContent = description;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeGalleryModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    document.querySelectorAll('.fade-in, .about-card, .news-card, .gallery-item, .download-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Scroll Spy for Navigation
function initializeScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: var(--shadow);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Additional CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Load language preference on page load
loadLanguagePreference();

// Add active class to current navigation link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Initialize active navigation link based on current section
window.addEventListener('load', function() {
    const currentHash = window.location.hash;
    if (currentHash) {
        const activeLink = document.querySelector(`a[href="${currentHash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    } else {
        // Default to home
        document.querySelector('a[href="#home"]').classList.add('active');
    }
});

// Add loading states for download buttons
document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        this.style.pointerEvents = 'none';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.pointerEvents = 'auto';
        }, 2000);
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add mouse move effect to floating card
document.addEventListener('mousemove', (e) => {
    const floatingCard = document.querySelector('.floating-card');
    if (floatingCard) {
        const rect = floatingCard.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        const angleX = (e.clientY - cardCenterY) / 50;
        const angleY = (e.clientX - cardCenterX) / 50;
        
        floatingCard.style.transform = `perspective(1000px) rotateX(${-angleX}deg) rotateY(${angleY}deg)`;
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeGalleryModal();
    }
});

// Add touch support for mobile devices
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndY < touchStartY - 50) {
        // Swipe up - scroll to next section
        const sections = ['home', 'about', 'news', 'gallery', 'download'];
        const currentSection = document.querySelector('.nav-link.active').getAttribute('href').substring(1);
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex < sections.length - 1) {
            scrollToSection(sections[currentIndex + 1]);
        }
    }
}

// Add performance optimization - lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
}

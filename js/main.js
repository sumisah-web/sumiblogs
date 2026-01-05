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

// Update the main.js file to integrate with authentication and add location features

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
    initializeAuthButton();
    loadGalleryPhotos();
    initializeDownloadAutoDetect();
    initializeExplorePlaces();
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

// Gallery Upload Functions - Updated with authentication
function initializeGalleryUpload() {
    if (uploadForm) {
        uploadForm.addEventListener('submit', handlePhotoUpload);
    }
}

function handlePhotoUpload(e) {
    e.preventDefault();
    
    // Check if user is logged in and active
    if (!auth || !auth.isLoggedIn()) {
        showNotification('Please login to upload photos.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    if (!auth.hasPermission('upload')) {
        showNotification('Your account is not verified. Please wait for admin approval.', 'error');
        return;
    }
    
    const fileInput = document.getElementById('photo-upload');
    const title = document.getElementById('photo-title').value;
    const location = document.getElementById('photo-location').value;
    const description = document.getElementById('photo-description').value;
    
    if (fileInput.files.length === 0) {
        showNotification(currentLang === 'en' ? 'Please select a photo to upload.' : 'कृपया अपलोड गर्न फोटो चयन गर्नुहोस्।', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Extract GPS coordinates from image metadata
    extractGPSCoordinates(file)
        .then(coordinates => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const currentUser = auth.getCurrentUser();
                
                const galleryItem = createGalleryItem(
                    e.target.result, 
                    title, 
                    location, 
                    description,
                    coordinates,
                    currentUser.fullName
                );
                
                // Add to gallery with pending status
                galleryGrid.insertBefore(galleryItem, galleryGrid.firstChild);
                
                // Save photo data with pending status for admin approval
                savePhotoForApproval({
                    id: Date.now().toString(),
                    userId: currentUser.id,
                    title: title,
                    location: location,
                    description: description,
                    data: e.target.result,
                    coordinates: coordinates,
                    uploadedAt: new Date().toISOString(),
                    status: 'pending' // Will be approved by admin
                });
                
                // Reset form
                uploadForm.reset();
                
                showNotification('Photo uploaded successfully! Pending admin approval.', 'success');
            };
            
            reader.readAsDataURL(file);
        })
        .catch(error => {
            console.error('Error extracting coordinates:', error);
            // Continue without coordinates if extraction fails
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const currentUser = auth.getCurrentUser();
                
                const galleryItem = createGalleryItem(
                    e.target.result, 
                    title, 
                    location, 
                    description,
                    null,
                    currentUser.fullName
                );
                
                galleryGrid.insertBefore(galleryItem, galleryGrid.firstChild);
                
                savePhotoForApproval({
                    id: Date.now().toString(),
                    userId: currentUser.id,
                    title: title,
                    location: location,
                    description: description,
                    data: e.target.result,
                    coordinates: null,
                    uploadedAt: new Date().toISOString(),
                    status: 'pending'
                });
                
                uploadForm.reset();
                showNotification('Photo uploaded successfully! Pending admin approval.', 'success');
            };
            
            reader.readAsDataURL(file);
        });
}

// Extract GPS coordinates from image metadata
function extractGPSCoordinates(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const view = new DataView(e.target.result);
            
            // Check if it's a JPEG
            if (view.getUint16(0, false) !== 0xFFD8) {
                resolve(null);
                return;
            }
            
            let length = view.byteLength;
            let offset = 2;
            
            while (offset < length) {
                const marker = view.getUint16(offset, false);
                offset += 2;
                
                if (marker === 0xFFE1) { // EXIF marker
                    const exifLength = view.getUint16(offset, false);
                    offset += 2;
                    
                    // Extract EXIF data
                    const exifData = new DataView(view.buffer.slice(offset, offset + exifLength - 2));
                    const coords = parseExifGPS(exifData);
                    resolve(coords);
                    return;
                } else if ((marker & 0xFF00) !== 0xFF00) {
                    break;
                } else {
                    offset += view.getUint16(offset, false);
                }
            }
            
            resolve(null);
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // Read first 64KB for EXIF
    });
}

// Parse EXIF GPS data
function parseExifGPS(exifData) {
    try {
        // Simple EXIF parser - in production, use a library like exif-js
        const gpsInfo = {};
        
        // Look for GPS IFD
        let offset = 0;
        if (exifData.getUint16(0, false) === 0x4D4D) { // Big endian
            const ifdOffset = exifData.getUint32(4, false);
            const numEntries = exifData.getUint16(ifdOffset, false);
            
            for (let i = 0; i < numEntries; i++) {
                const entryOffset = ifdOffset + 2 + i * 12;
                const tag = exifData.getUint16(entryOffset, false);
                
                if (tag === 0x8825) { // GPSInfo tag
                    const gpsOffset = exifData.getUint32(entryOffset + 8, false);
                    return parseGPSIFD(exifData, gpsOffset);
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error parsing EXIF GPS:', error);
        return null;
    }
}

// Parse GPS IFD
function parseGPSIFD(exifData, offset) {
    const numEntries = exifData.getUint16(offset, false);
    let lat = null, lon = null;
    
    for (let i = 0; i < numEntries; i++) {
        const entryOffset = offset + 2 + i * 12;
        const tag = exifData.getUint16(entryOffset, false);
        const type = exifData.getUint16(entryOffset + 2, false);
        const count = exifData.getUint32(entryOffset + 4, false);
        const valueOffset = exifData.getUint32(entryOffset + 8, false);
        
        if (tag === 2) { // GPSLatitude
            lat = parseGPSCoordinate(exifData, type, count, valueOffset);
        } else if (tag === 4) { // GPSLongitude
            lon = parseGPSCoordinate(exifData, type, count, valueOffset);
        }
    }
    
    return (lat && lon) ? { latitude: lat, longitude: lon } : null;
}

// Parse GPS coordinate
function parseGPSCoordinate(exifData, type, count, valueOffset) {
    if (type !== 5) return null; // Rational type
    
    let values = [];
    for (let i = 0; i < count; i++) {
        const offset = valueOffset + i * 8;
        const numerator = exifData.getUint32(offset, false);
        const denominator = exifData.getUint32(offset + 4, false);
        values.push(numerator / denominator);
    }
    
    // Convert DMS to decimal degrees
    if (values.length === 3) {
        return values[0] + values[1] / 60 + values[2] / 3600;
    }
    
    return null;
}

// Save photo for admin approval
function savePhotoForApproval(photoData) {
    let photos = JSON.parse(localStorage.getItem('galleryPhotos') || '[]');
    photos.push(photoData);
    localStorage.setItem('galleryPhotos', JSON.stringify(photos));
    
    // Add activity for admin
    const currentUser = auth.getCurrentUser();
    if (window.adminDashboard) {
        window.adminDashboard.addActivity('photo', `New photo uploaded: ${photoData.title}`, `by ${currentUser.fullName}`);
    }
}

// Updated createGalleryItem function
function createGalleryItem(imageSrc, title, location, description, coordinates = null, uploaderName = '') {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item fade-in';
    
    let locationHtml = `<p class="location"><i class="fas fa-map-marker-alt"></i> ${location}</p>`;
    if (coordinates) {
        locationHtml += `<p class="coordinates"><i class="fas fa-crosshairs"></i> ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}</p>`;
    }
    
    let uploaderHtml = uploaderName ? `<p class="uploader"><i class="fas fa-user"></i> ${uploaderName}</p>` : '';

    galleryItem.innerHTML = `
        <div class="gallery-image">
            <img src="${imageSrc}" alt="${title}">
            <div class="gallery-overlay">
                <button class="view-btn" onclick="openModal(this)">
                    <i class="fas fa-eye"></i>
                </button>
                ${coordinates ? `<button class="map-btn" onclick="showOnMap(${coordinates.latitude}, ${coordinates.longitude})" title="View on Map">
                    <i class="fas fa-map"></i>
                </button>` : ''}
            </div>
        </div>
        <div class="gallery-info">
            <h4>${title}</h4>
            ${locationHtml}
            <p class="description">${description}</p>
            ${uploaderHtml}
        </div>
    `;
    
    // Trigger fade-in animation
    setTimeout(() => {
        galleryItem.classList.add('visible');
    }, 100);
    
    return galleryItem;
}

// Show location on map
function showOnMap(lat, lon) {
    const mapUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    window.open(mapUrl, '_blank');
}

// Load gallery photos (modified to show only approved photos)
function loadGalleryPhotos() {
    const photos = JSON.parse(localStorage.getItem('galleryPhotos') || '[]');
    const approvedPhotos = photos.filter(p => p.status === 'approved');
    
    // Add existing sample photos if no photos exist
    if (approvedPhotos.length === 0) {
        return; // Keep existing sample photos
    }
    
    // Add approved photos to gallery
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    approvedPhotos.forEach(photo => {
        const user = auth ? auth.getUserById(photo.userId) : null;
        const galleryItem = createGalleryItem(
            photo.data,
            photo.title,
            photo.location,
            photo.description,
            photo.coordinates,
            user ? user.fullName : 'Unknown'
        );
        galleryGrid.appendChild(galleryItem);
    });
}

// Auto-detect download files
function initializeDownloadAutoDetect() {
    const downloadSection = document.getElementById('download');
    if (!downloadSection) return;
    
    // In a real implementation, you would scan the download folder
    // For demo purposes, we'll show the existing files
    const downloadGrid = document.querySelector('.download-grid');
    if (!downloadGrid) return;
    
    // Add auto-detected files (this would be server-side in real implementation)
    const autoDetectedFiles = [
        {
            title: 'Sanskrit Learning Materials',
            description: 'Comprehensive collection of Sanskrit learning resources',
            size: '15.2 MB',
            type: 'PDF',
            icon: 'fa-book',
            url: 'download/learning-materials.pdf'
        },
        {
            title: 'Ancient Texts Collection',
            description: 'Collection of ancient Sanskrit texts and translations',
            size: '8.7 MB',
            type: 'PDF',
            icon: 'fa-scroll',
            url: 'download/ancient-texts.pdf'
        }
    ];
    
    autoDetectedFiles.forEach(file => {
        const card = document.createElement('div');
        card.className = 'download-card fade-in';
        card.innerHTML = `
            <div class="download-icon">
                <i class="fas ${file.icon}"></i>
            </div>
            <h3>${file.title}</h3>
            <p>${file.description}</p>
            <div class="download-info">
                <span class="file-size">${file.size}</span>
                <span class="file-type">${file.type}</span>
            </div>
            <a href="${file.url}" class="download-btn" download>
                <i class="fas fa-download"></i> Download
            </a>
        `;
        downloadGrid.appendChild(card);
    });
}

// Initialize Explore Places feature
function initializeExplorePlaces() {
    const exploreBtn = document.createElement('button');
    exploreBtn.className = 'explore-btn';
    exploreBtn.innerHTML = '<i class="fas fa-compass"></i> Explore Places';
    exploreBtn.onclick = showExplorePlaces;
    
    // Add to navigation or hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.appendChild(exploreBtn);
    }
}

// Show explore places modal
function showExplorePlaces() {
    const photos = JSON.parse(localStorage.getItem('galleryPhotos') || '[]');
    const approvedPhotos = photos.filter(p => p.status === 'approved' && p.coordinates);
    
    if (approvedPhotos.length === 0) {
        showNotification('No geotagged photos available yet.', 'info');
        return;
    }
    
    // Create modal with map
    const modal = document.createElement('div');
    modal.className = 'explore-modal';
    modal.innerHTML = `
        <div class="explore-modal-content">
            <span class="close">&times;</span>
            <h2>Explore Places</h2>
            <div id="explore-map"></div>
            <div class="explore-photos">
                ${approvedPhotos.map(photo => `
                    <div class="explore-photo-item" onclick="focusOnMap(${photo.coordinates.latitude}, ${photo.coordinates.longitude})">
                        <img src="${photo.data}" alt="${photo.title}">
                        <h4>${photo.title}</h4>
                        <p>${photo.location}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Initialize simple map (in production, use Google Maps or similar)
    initializeSimpleMap(approvedPhotos);
    
    // Close modal functionality
    modal.querySelector('.close').onclick = () => modal.remove();
    window.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

// Simple map implementation (replace with Google Maps in production)
function initializeSimpleMap(photos) {
    const mapContainer = document.getElementById('explore-map');
    if (!mapContainer) return;
    
    // Create a simple representation of locations
    mapContainer.innerHTML = `
        <div class="simple-map">
            ${photos.map((photo, index) => `
                <div class="map-marker" 
                     style="left: ${20 + (index * 15)}%; top: ${30 + (index * 10)}%;"
                     onclick="showPhotoDetails('${photo.id}')"
                     title="${photo.title}">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
            `).join('')}
        </div>
    `;
}

// Focus on map marker
function focusOnMap(lat, lon) {
    // In production, this would center the map on the coordinates
    showNotification(`Focusing on location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`, 'info');
}

// Show photo details
function showPhotoDetails(photoId) {
    const photos = JSON.parse(localStorage.getItem('galleryPhotos') || '[]');
    const photo = photos.find(p => p.id === photoId);
    
    if (photo) {
        showNotification(`${photo.title} - ${photo.location}`, 'info');
    }
}

// Authentication button in navigation
function initializeAuthButton() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;
    
    const authLink = document.createElement('a');
    authLink.id = 'auth-link';
    authLink.className = 'nav-link';
    authLink.href = '#';
    
    function updateAuthButton() {
        if (auth && auth.isLoggedIn()) {
            const user = auth.getCurrentUser();
            authLink.innerHTML = `<i class="fas fa-user"></i> ${user.fullName}`;
            authLink.onclick = (e) => {
                e.preventDefault();
                if (confirm(currentLang === 'en' ? 'Do you want to logout?' : 'के तपाईं लगआउट गर्न चाहनुहुन्छ?')) {
                    auth.logout();
                }
            };
        } else {
            authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            authLink.href = 'login.html';
            authLink.onclick = null;
        }
    }
    
    updateAuthButton();
    navMenu.appendChild(authLink);
    
    // Update button when authentication state changes
    setInterval(updateAuthButton, 1000);
}

// Modal Functions
function initializeModal() {
    if (closeModal) {
        closeModal.addEventListener('click', closeGalleryModal);
    }
    
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
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
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
function showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--accent-color)' : type === 'error' ? 'var(--secondary-color)' : 'var(--primary-color)'};
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
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
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
        const homeLink = document.querySelector('a[href="#home"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
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
    if (e.key === 'Escape' && modal && modal.style.display === 'block') {
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

// Add CSS for explore button and coordinates
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .explore-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);
        padding: 1rem 2rem;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-top: 2rem;
        font-size: 1.1rem;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .explore-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
    }
    
    .coordinates {
        font-size: 0.8rem;
        color: var(--primary-color);
        margin-top: 0.3rem;
    }
    
    .map-btn {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: var(--accent-color);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1rem;
        transition: var(--transition);
        z-index: 10;
    }
    
    .map-btn:hover {
        background: #27ae60;
        transform: scale(1.1);
    }
    
    .explore-modal {
        display: none;
        position: fixed;
        z-index: 2000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.9);
    }
    
    .explore-modal-content {
        position: relative;
        margin: 5% auto;
        max-width: 90%;
        max-height: 80vh;
        background: var(--white);
        border-radius: 10px;
        overflow: hidden;
        padding: 2rem;
    }
    
    .simple-map {
        height: 300px;
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        border-radius: 10px;
        position: relative;
        margin: 1rem 0;
    }
    
    .map-marker {
        position: absolute;
        color: var(--secondary-color);
        font-size: 1.5rem;
        cursor: pointer;
        transition: transform 0.2s;
    }
    
    .map-marker:hover {
        transform: scale(1.2);
    }
    
    .explore-photos {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        max-height: 300px;
        overflow-y: auto;
        margin-top: 1rem;
    }
    
    .explore-photo-item {
        background: var(--light-color);
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: var(--transition);
    }
    
    .explore-photo-item:hover {
        background: rgba(74, 144, 226, 0.1);
        transform: translateY(-2px);
    }
    
    .explore-photo-item img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 5px;
        margin-bottom: 0.5rem;
    }
    
    .uploader {
        font-size: 0.8rem;
        color: var(--text-light);
        margin-top: 0.5rem;
    }
`;
document.head.appendChild(additionalStyles);

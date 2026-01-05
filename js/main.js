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
// Map and Gallery Functions
let map;
let markers = [];
let currentMapView = 'overview';

// Initialize map functionality
function initializeMap() {
    // Create a simple interactive map using Leaflet or similar library
    // For now, we'll create a placeholder that can be replaced with actual map implementation
    
    const mapContainer = document.getElementById('gallery-map');
    const expandedMapContainer = document.getElementById('expanded-map');
    
    // Placeholder map implementation
    createInteractiveMap(mapContainer, false);
    createInteractiveMap(expandedMapContainer, true);
}

function createInteractiveMap(container, isExpanded = false) {
    // This is a placeholder implementation
    // In production, you would integrate with Google Maps, Leaflet, or Mapbox
    
    container.innerHTML = `
        <div class="map-placeholder">
            <i class="fas fa-map-marked-alt"></i>
            <p>${currentLang === 'en' ? 'Interactive Map View' : 'इंटरएक्टिभ नक्सा दृश्य'}</p>
            <small>${currentLang === 'en' ? 'Click on map buttons to view locations' : 'स्थानहरू हेर्न नक्सा बटनहरूमा क्लिक गर्नुहोस्'}</small>
        </div>
    `;
    
    // Add click event listeners to gallery items for map interaction
    document.querySelectorAll('.gallery-item').forEach(item => {
        const lat = parseFloat(item.dataset.lat);
        const lng = parseFloat(item.dataset.lng);
        const location = item.dataset.location;
        
        if (lat && lng) {
            // Store marker data
            markers.push({
                lat: lat,
                lng: lng,
                location: location,
                element: item
            });
        }
    });
    
    // If using a real map library, you would initialize it here
    // Example with Leaflet:
    /*
    if (typeof L !== 'undefined') {
        const mapInstance = L.map(container).setView([25.3176, 82.9739], 5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);
        
        // Add markers
        markers.forEach(marker => {
            L.marker([marker.lat, marker.lng])
                .addTo(mapInstance)
                .bindPopup(marker.location)
                .on('click', () => {
                    focusOnLocation(marker.lat, marker.lng);
                });
        });
        
        if (isExpanded) {
            mapInstance.invalidateSize();
        }
        
        return mapInstance;
    }
    */
}

// Focus on specific location
function focusOnLocation(lat, lng) {
    console.log(`Focusing on location: ${lat}, ${lng}`);
    
    // Highlight the corresponding gallery item
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.remove('highlighted');
        if (parseFloat(item.dataset.lat) === lat && parseFloat(item.dataset.lng) === lng) {
            item.classList.add('highlighted');
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
    
    // In a real implementation, you would center the map on these coordinates
    // and show a popup with location information
    
    // Show expanded map modal
    openMapModal(lat, lng);
}

// Reset map view
function resetMapView() {
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.remove('highlighted');
    });
    
    // Reset map to show all markers
    if (map) {
        // map.fitBounds(L.latLngBounds(markers.map(m => [m.lat, m.lng])));
    }
}

// Toggle map view
function toggleMapView() {
    const mapContainer = document.querySelector('.map-container');
    mapContainer.classList.toggle('expanded');
    
    if (mapContainer.classList.contains('expanded')) {
        // Recenter map if needed
        setTimeout(() => {
            if (map) {
                // map.invalidateSize();
            }
        }, 300);
    }
}

// Open expanded map modal
function openMapModal(lat, lng) {
    const modal = document.getElementById('map-modal');
    const expandedMap = document.getElementById('expanded-map');
    
    // Find the corresponding gallery item
    const galleryItem = document.querySelector(`[data-lat="${lat}"][data-lng="${lng}"]`);
    if (galleryItem) {
        const title = galleryItem.querySelector('h4').textContent;
        const location = galleryItem.querySelector('.location').textContent;
        const description = galleryItem.querySelector('.description').textContent;
        
        document.getElementById('map-modal-title').textContent = title;
        document.getElementById('map-modal-location').textContent = location;
        document.getElementById('map-modal-description').textContent = description;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Initialize expanded map
    setTimeout(() => {
        createInteractiveMap(expandedMap, true);
    }, 100);
}

// Close map modal
function closeMapModal() {
    const modal = document.getElementById('map-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Extract GPS coordinates from image metadata (EXIF data)
async function extractGPSFromImage(imageElement) {
    // This function would use a library like exif-js to extract GPS data
    // For now, we'll use the data attributes that would be populated from server-side
    
    return new Promise((resolve) => {
        // In a real implementation, you would:
        /*
        EXIF.getData(imageElement, function() {
            const gpsLat = EXIF.getTag(this, "GPSLatitude");
            const gpsLng = EXIF.getTag(this, "GPSLongitude");
            const latRef = EXIF.getTag(this, "GPSLatitudeRef");
            const lngRef = EXIF.getTag(this, "GPSLongitudeRef");
            
            if (gpsLat && gpsLng) {
                const lat = convertDMSToDD(gpsLat, latRef);
                const lng = convertDMSToDD(gpsLng, lngRef);
                resolve({ lat, lng });
            } else {
                resolve(null);
            }
        });
        */
        
        // For demo purposes, use data attributes
        const galleryItem = imageElement.closest('.gallery-item');
        const lat = parseFloat(galleryItem.dataset.lat);
        const lng = parseFloat(galleryItem.dataset.lng);
        
        resolve(lat && lng ? { lat, lng } : null);
    });
}

// Convert DMS to Decimal Degrees
function convertDMSToDD(dms, ref) {
    let dd = dms[0] + dms[1]/60 + dms[2]/3600;
    if (ref === "S" || ref === "W") {
        dd = dd * -1;
    }
    return dd;
}

// Initialize gallery enhancements
function initializeGalleryEnhancements() {
    // Add GPS coordinate extraction for all gallery images
    document.querySelectorAll('.gallery-item img').forEach(async (img) => {
        const coords = await extractGPSFromImage(img);
        if (coords) {
            // Update the displayed coordinates
            const coordElement = img.closest('.gallery-item').querySelector('.coordinates');
            if (coordElement) {
                coordElement.innerHTML = `<i class="fas fa-globe"></i> ${coords.lat.toFixed(4)}°N, ${coords.lng.toFixed(4)}°E`;
            }
        }
    });
    
    // Initialize the map
    initializeMap();
}

// Add CSS for highlighted gallery items
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .gallery-item.highlighted {
        transform: scale(1.02);
        box-shadow: 0 15px 40px rgba(74, 144, 226, 0.3);
        border: 3px solid var(--primary-color);
    }
    
    .gallery-item.highlighted .gallery-image {
        filter: brightness(1.1);
    }
    
    .map-container.expanded {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 800px;
        height: 500px;
        z-index: 2000;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .map-container.expanded .gallery-map {
        height: 100%;
    }
`;
document.head.appendChild(additionalStyles);

// Remove upload functionality
function removeUploadFunctionality() {
    // Hide upload section
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
        uploadSection.style.display = 'none';
    }
    
    // Remove any upload-related event listeners
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.removeEventListener('submit', handlePhotoUpload);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    
    // Initialize gallery enhancements
    initializeGalleryEnhancements();
    
    // Remove upload functionality
    removeUploadFunctionality();
});

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

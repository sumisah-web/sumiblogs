// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.pendingMembers = [];
        this.pendingPhotos = [];
        this.init();
    }

    init() {
        this.checkAdminAuth();
        this.setupNavigation();
        this.loadDashboardData();
        this.setupEventListeners();
        this.startPeriodicUpdates();
    }

    checkAdminAuth() {
        const adminUser = sessionStorage.getItem('adminUser');
        if (!adminUser) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const adminData = JSON.parse(adminUser);
            if (adminData.username !== 'sumisanskrit') {
                window.location.href = 'login.html';
                return;
            }
        } catch (e) {
            window.location.href = 'login.html';
            return;
        }
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }

    switchSection(section) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update active section
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;

        // Load section-specific data
        switch(section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'members':
                this.loadMembersData();
                break;
            case 'photos':
                this.loadPhotosData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    loadDashboardData() {
        const users = this.getAllUsers();
        const photos = this.getAllPhotos();
        
        // Update statistics
        document.getElementById('total-members').textContent = users.length;
        document.getElementById('pending-members').textContent = users.filter(u => u.status === 'pending').length;
        document.getElementById('active-members').textContent = users.filter(u => u.status === 'active').length;
        document.getElementById('total-photos').textContent = photos.length;

        // Update badges
        document.getElementById('pending-members-count').textContent = users.filter(u => u.status === 'pending').length;
        document.getElementById('pending-photos-count').textContent = photos.filter(p => p.status === 'pending').length;

        // Load recent activity
        this.loadRecentActivity();
    }

    loadMembersData() {
        const users = this.getAllUsers();
        const tableBody = document.getElementById('members-table-body');
        
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-photo ${!user.photo ? 'placeholder' : ''}">
                        ${user.photo ? 
                            `<img src="${user.photo.data}" alt="${user.fullName}" class="user-photo">` : 
                            '<i class="fas fa-user"></i>'
                        }
                    </div>
                </td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.district}, ${user.province}</td>
                <td>${user.userType}</td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        ${user.status === 'pending' ? 
                            `<button class="btn btn-success" onclick="approveMember('${user.id}')" title="Approve">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-danger" onclick="rejectMember('${user.id}')" title="Reject">
                                <i class="fas fa-times"></i>
                            </button>` :
                            `<button class="btn btn-secondary" onclick="viewMember('${user.id}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-danger" onclick="deleteMember('${user.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>`
                        }
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    loadPhotosData() {
        const photos = this.getAllPhotos().filter(p => p.status === 'pending');
        const grid = document.getElementById('photos-verification-grid');
        
        if (!grid) return;

        grid.innerHTML = '';
        
        photos.forEach(photo => {
            const user = this.getUserById(photo.userId);
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.innerHTML = `
                <img src="${photo.data}" alt="${photo.title}">
                <div class="photo-card-info">
                    <h4>${photo.title}</h4>
                    <p><i class="fas fa-user"></i> ${user ? user.fullName : 'Unknown'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${photo.location}</p>
                    <p><i class="fas fa-calendar"></i> ${new Date(photo.uploadedAt).toLocaleDateString()}</p>
                    <div class="photo-actions">
                        <button class="btn btn-success" onclick="viewPhotoForApproval('${photo.id}')" title="Review">
                            <i class="fas fa-eye"></i> Review
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    loadSettingsData() {
        // Load system statistics
        const users = this.getAllUsers();
        const photos = this.getAllPhotos();
        
        // Calculate storage usage (approximate)
        let storageUsed = 0;
        photos.forEach(photo => {
            if (photo.data) {
                // Approximate size calculation for base64 images
                const base64Length = photo.data.length;
                const sizeInBytes = (base64Length * 3) / 4;
                storageUsed += sizeInBytes;
            }
        });

        // User photos storage
        users.forEach(user => {
            if (user.photo && user.photo.data) {
                const base64Length = user.photo.data.length;
                const sizeInBytes = (base64Length * 3) / 4;
                storageUsed += sizeInBytes;
            }
        });

        document.getElementById('storage-used').textContent = `${(storageUsed / (1024 * 1024)).toFixed(2)} MB`;
        document.getElementById('db-size').textContent = `${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB`;
        
        const lastBackup = localStorage.getItem('lastBackup');
        document.getElementById('last-backup').textContent = lastBackup ? new Date(lastBackup).toLocaleString() : 'Never';
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;

        const activities = this.getRecentActivity();
        activityContainer.innerHTML = '';

        activities.slice(0, 10).forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            let icon, color;
            switch(activity.type) {
                case 'user':
                    icon = 'fa-user';
                    color = 'user';
                    break;
                case 'photo':
                    icon = 'fa-image';
                    color = 'photo';
                    break;
                case 'system':
                    icon = 'fa-cog';
                    color = 'system';
                    break;
                default:
                    icon = 'fa-info';
                    color = 'system';
            }

            activityItem.innerHTML = `
                <div class="activity-icon ${color}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <small>${activity.details}</small>
                </div>
                <div class="activity-time">
                    ${this.getTimeAgo(activity.timestamp)}
                </div>
            `;
            
            activityContainer.appendChild(activityItem);
        });
    }

    getRecentActivity() {
        const activities = JSON.parse(localStorage.getItem('recentActivity') || '[]');
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    addActivity(type, message, details = '') {
        const activities = this.getRecentActivity();
        activities.unshift({
            type,
            message,
            details,
            timestamp: new Date().toISOString()
        });

        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.pop();
        }

        localStorage.setItem('recentActivity', JSON.stringify(activities));
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    setupEventListeners() {
        // Admin credentials form
        const credentialsForm = document.getElementById('admin-credentials-form');
        if (credentialsForm) {
            credentialsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateAdminCredentials();
            });
        }

        // Photo modal
        const modal = document.getElementById('photo-modal');
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Member management
    approveMember(userId) {
        if (!confirm('Are you sure you want to approve this member?')) return;

        const users = this.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            user.status = 'active';
            this.saveUsers(users);
            
            this.addActivity('user', `Approved member: ${user.fullName}`, user.email);
            this.showNotification('Member approved successfully!', 'success');
            this.loadMembersData();
            this.loadDashboardData();
        }
    }

    rejectMember(userId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        const users = this.getAllUsers();
        const user = users.find(u => u.id === userId);
        
        if (user) {
            user.status = 'rejected';
            user.rejectionReason = reason;
            this.saveUsers(users);
            
            this.addActivity('user', `Rejected member: ${user.fullName}`, reason);
            this.showNotification('Member rejected successfully!', 'success');
            this.loadMembersData();
            this.loadDashboardData();
        }
    }

    deleteMember(userId) {
        if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) return;

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            const user = users[userIndex];
            users.splice(userIndex, 1);
            this.saveUsers(users);
            
            this.addActivity('user', `Deleted member: ${user.fullName}`, user.email);
            this.showNotification('Member deleted successfully!', 'success');
            this.loadMembersData();
            this.loadDashboardData();
        }
    }

    // Photo management
    viewPhotoForApproval(photoId) {
        const photos = this.getAllPhotos();
        const photo = photos.find(p => p.id === photoId);
        const user = this.getUserById(photo.userId);

        if (photo && user) {
            const modal = document.getElementById('photo-modal');
            document.getElementById('modal-photo').src = photo.data;
            document.getElementById('photo-title').textContent = photo.title;
            document.getElementById('photo-location').textContent = photo.location;
            document.getElementById('photo-description').textContent = photo.description;
            document.getElementById('photo-uploader').innerHTML = `<strong>Uploaded by:</strong> ${user.fullName} (${user.email})`;
            document.getElementById('photo-date').innerHTML = `<strong>Uploaded on:</strong> ${new Date(photo.uploadedAt).toLocaleString()}`;

            // Store current photo ID for approval/rejection
            modal.dataset.photoId = photoId;
            modal.style.display = 'block';
        }
    }

    approvePhoto() {
        const modal = document.getElementById('photo-modal');
        const photoId = modal.dataset.photoId;

        if (!photoId) return;

        const photos = this.getAllPhotos();
        const photo = photos.find(p => p.id === photoId);
        
        if (photo) {
            photo.status = 'approved';
            this.savePhotos(photos);
            
            const user = this.getUserById(photo.userId);
            this.addActivity('photo', `Approved photo: ${photo.title}`, `by ${user.fullName}`);
            this.showNotification('Photo approved successfully!', 'success');
            
            modal.style.display = 'none';
            this.loadPhotosData();
            this.loadDashboardData();
        }
    }

    rejectPhoto() {
        const modal = document.getElementById('photo-modal');
        const photoId = modal.dataset.photoId;
        const reason = prompt('Please provide a reason for rejection:');
        
        if (!photoId || !reason) return;

        const photos = this.getAllPhotos();
        const photo = photos.find(p => p.id === photoId);
        
        if (photo) {
            photo.status = 'rejected';
            photo.rejectionReason = reason;
            this.savePhotos(photos);
            
            const user = this.getUserById(photo.userId);
            this.addActivity('photo', `Rejected photo: ${photo.title}`, reason);
            this.showNotification('Photo rejected successfully!', 'success');
            
            modal.style.display = 'none';
            this.loadPhotosData();
            this.loadDashboardData();
        }
    }

    // Settings
    updateAdminCredentials() {
        const currentUsername = document.getElementById('current-username').value;
        const currentPassword = document.getElementById('current-password').value;
        const newUsername = document.getElementById('new-username').value;
        const newPassword = document.getElementById('new-password').value;

        // Verify current credentials
        if (currentUsername !== 'sumisanskrit' || currentPassword !== '9761818') {
            this.showNotification('Current credentials are incorrect!', 'error');
            return;
        }

        // Validate new credentials
        if (newUsername.length < 3) {
            this.showNotification('New username must be at least 3 characters long!', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('New password must be at least 8 characters long!', 'error');
            return;
        }

        // Update credentials (in a real app, this would be stored securely)
        localStorage.setItem('adminUsername', newUsername);
        localStorage.setItem('adminPassword', newPassword);
        
        this.showNotification('Admin credentials updated successfully!', 'success');
        
        // Clear form
        document.getElementById('admin-credentials-form').reset();
    }

    backupData() {
        const data = {
            users: this.getAllUsers(),
            photos: this.getAllPhotos(),
            activities: this.getRecentActivity(),
            backupDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `sanskrit_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        localStorage.setItem('lastBackup', new Date().toISOString());
        this.showNotification('Data backup completed successfully!', 'success');
        this.loadSettingsData();
    }

    // Utility methods
    getAllUsers() {
        return JSON.parse(localStorage.getItem('sanskritUsers') || '[]');
    }

    saveUsers(users) {
        localStorage.setItem('sanskritUsers', JSON.stringify(users));
    }

    getAllPhotos() {
        return JSON.parse(localStorage.getItem('galleryPhotos') || '[]');
    }

    savePhotos(photos) {
        localStorage.setItem('galleryPhotos', JSON.stringify(photos));
    }

    getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(u => u.id === userId);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--accent-color)' : 'var(--secondary-color)'};
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

    startPeriodicUpdates() {
        // Update dashboard every 30 seconds
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadDashboardData();
            }
        }, 30000);
    }

    // Global functions for HTML onclick events
    approveMember(userId) {
        this.approveMember(userId);
    }

    rejectMember(userId) {
        this.rejectMember(userId);
    }

    deleteMember(userId) {
        this.deleteMember(userId);
    }

    viewPhotoForApproval(photoId) {
        this.viewPhotoForApproval(photoId);
    }

    approvePhoto() {
        this.approvePhoto();
    }

    rejectPhoto() {
        this.rejectPhoto();
    }

    backupData() {
        this.backupData();
    }

    exportMembers() {
        const users = this.getAllUsers();
        const csvContent = this.convertToCSV(users);
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    convertToCSV(data) {
        const headers = ['Name', 'Email', 'Phone', 'Province', 'District', 'Village', 'Type', 'Status', 'Joined Date'];
        const rows = data.map(user => [
            user.fullName,
            user.email,
            user.phone,
            user.province,
            user.district,
            user.village,
            user.userType,
            user.status,
            new Date(user.createdAt).toLocaleDateString()
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Admin authentication functions
function adminLogout() {
    sessionStorage.removeItem('adminUser');
    window.location.href = 'login.html';
}

function checkAdminAuth() {
    const adminUser = sessionStorage.getItem('adminUser');
    if (!adminUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();

// Global functions for HTML onclick events
function approveMember(userId) {
    adminDashboard.approveMember(userId);
}

function rejectMember(userId) {
    adminDashboard.rejectMember(userId);
}

function deleteMember(userId) {
    adminDashboard.deleteMember(userId);
}

function viewPhotoForApproval(photoId) {
    adminDashboard.viewPhotoForApproval(photoId);
}

function approvePhoto() {
    adminDashboard.approvePhoto();
}

function rejectPhoto() {
    adminDashboard.rejectPhoto();
}

function backupData() {
    adminDashboard.backupData();
}

function exportMembers() {
    adminDashboard.exportMembers();
}

function adminLogout() {
    adminLogout();
}

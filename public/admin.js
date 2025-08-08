// Admin Dashboard JavaScript

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.shopName = 'Your Shop';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupTabs();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchSection(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update active content section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            wishlists: 'Customer Wishlists',
            notifications: 'Notification Management',
            analytics: 'Analytics & Reports',
            settings: 'App Settings'
        };
        document.getElementById('page-title').textContent = titles[section];

        this.currentSection = section;
        this.loadSectionData(section);
    }

    switchTab(tab) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update active tab pane
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');
    }

    setupTabs() {
        // Initialize first tab as active
        const firstTab = document.querySelector('.tab-btn');
        if (firstTab) {
            firstTab.click();
        }
    }

    async loadDashboardData() {
        try {
            this.showLoading();
            
            // Simulate API calls - replace with actual API endpoints
            const stats = await this.fetchStats();
            this.updateStats(stats);
            
            const recentActivity = await this.fetchRecentActivity();
            this.updateRecentActivity(recentActivity);
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showToast('Error loading dashboard data', 'error');
            this.hideLoading();
        }
    }

    async loadSectionData(section) {
        switch (section) {
            case 'wishlists':
                await this.loadWishlists();
                break;
            case 'notifications':
                await this.loadNotifications();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
            case 'settings':
                await this.loadSettings();
                break;
        }
    }

    async fetchStats() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    totalWishlists: Math.floor(Math.random() * 1000) + 100,
                    activeCustomers: Math.floor(Math.random() * 500) + 50,
                    notificationsSent: Math.floor(Math.random() * 5000) + 500,
                    conversionRate: (Math.random() * 10 + 5).toFixed(1)
                });
            }, 1000);
        });
    }

    async fetchRecentActivity() {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        icon: 'heart',
                        text: 'Customer added product to wishlist',
                        time: '2 minutes ago'
                    },
                    {
                        icon: 'bell',
                        text: 'Back in stock notification sent',
                        time: '5 minutes ago'
                    },
                    {
                        icon: 'shopping-cart',
                        text: 'Wishlist item purchased',
                        time: '10 minutes ago'
                    },
                    {
                        icon: 'user-plus',
                        text: 'New customer created wishlist',
                        time: '15 minutes ago'
                    }
                ]);
            }, 800);
        });
    }

    updateStats(stats) {
        document.getElementById('total-wishlists').textContent = stats.totalWishlists.toLocaleString();
        document.getElementById('active-customers').textContent = stats.activeCustomers.toLocaleString();
        document.getElementById('notifications-sent').textContent = stats.notificationsSent.toLocaleString();
        document.getElementById('conversion-rate').textContent = `${stats.conversionRate}%`;
    }

    updateRecentActivity(activities) {
        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '';

        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }

    async loadWishlists() {
        try {
            this.showLoading();
            
            // Simulate API call
            const wishlists = await this.fetchWishlists();
            this.updateWishlistsTable(wishlists);
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading wishlists:', error);
            this.showToast('Error loading wishlists', 'error');
            this.hideLoading();
        }
    }

    async fetchWishlists() {
        return new Promise(resolve => {
            setTimeout(() => {
                const wishlists = [];
                for (let i = 1; i <= 10; i++) {
                    wishlists.push({
                        id: i,
                        customerName: `Customer ${i}`,
                        wishlistName: `Wishlist ${i}`,
                        itemCount: Math.floor(Math.random() * 10) + 1,
                        created: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                        updated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                    });
                }
                resolve(wishlists);
            }, 1000);
        });
    }

    updateWishlistsTable(wishlists) {
        const tbody = document.getElementById('wishlists-table-body');
        tbody.innerHTML = '';

        wishlists.forEach(wishlist => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${wishlist.customerName}</td>
                <td>${wishlist.wishlistName}</td>
                <td>${wishlist.itemCount}</td>
                <td>${wishlist.created}</td>
                <td>${wishlist.updated}</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewWishlist(${wishlist.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadNotifications() {
        try {
            this.showLoading();
            
            const [pending, sent, subscriptions] = await Promise.all([
                this.fetchPendingNotifications(),
                this.fetchSentNotifications(),
                this.fetchSubscriptions()
            ]);
            
            this.updateNotifications('pending', pending);
            this.updateNotifications('sent', sent);
            this.updateSubscriptions(subscriptions);
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showToast('Error loading notifications', 'error');
            this.hideLoading();
        }
    }

    async fetchPendingNotifications() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        type: 'back_in_stock',
                        customer: 'Customer 1',
                        product: 'Product A',
                        created: '2 hours ago'
                    },
                    {
                        id: 2,
                        type: 'price_drop',
                        customer: 'Customer 2',
                        product: 'Product B',
                        created: '1 hour ago'
                    }
                ]);
            }, 800);
        });
    }

    async fetchSentNotifications() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        type: 'back_in_stock',
                        customer: 'Customer 3',
                        product: 'Product C',
                        sent: '1 day ago'
                    },
                    {
                        id: 2,
                        type: 'price_drop',
                        customer: 'Customer 4',
                        product: 'Product D',
                        sent: '2 days ago'
                    }
                ]);
            }, 800);
        });
    }

    async fetchSubscriptions() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        customer: 'Customer 5',
                        product: 'Product E',
                        type: 'back_in_stock',
                        created: '1 week ago'
                    },
                    {
                        id: 2,
                        customer: 'Customer 6',
                        product: 'Product F',
                        type: 'price_drop',
                        created: '3 days ago'
                    }
                ]);
            }, 800);
        });
    }

    updateNotifications(type, notifications) {
        const container = document.getElementById(`${type}-notifications`);
        container.innerHTML = '';

        notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            
            const iconMap = {
                back_in_stock: 'box',
                price_drop: 'tag',
                low_stock: 'exclamation-triangle'
            };

            item.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-${iconMap[notification.type] || 'bell'}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notification.customer} - ${notification.product}</h4>
                    <p>${notification.type.replace('_', ' ').toUpperCase()} notification ${type === 'sent' ? 'sent' : 'pending'} ${notification.sent || notification.created}</p>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateSubscriptions(subscriptions) {
        const container = document.getElementById('subscriptions-list');
        container.innerHTML = '';

        subscriptions.forEach(subscription => {
            const item = document.createElement('div');
            item.className = 'notification-item';
            item.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-user"></i>
                </div>
                <div class="notification-content">
                    <h4>${subscription.customer} - ${subscription.product}</h4>
                    <p>Subscribed to ${subscription.type.replace('_', ' ')} notifications ${subscription.created}</p>
                </div>
            `;
            container.appendChild(item);
        });
    }

    async loadAnalytics() {
        try {
            this.showLoading();
            
            const [popularProducts, engagementData] = await Promise.all([
                this.fetchPopularProducts(),
                this.fetchEngagementData()
            ]);
            
            this.updatePopularProducts(popularProducts);
            this.updateEngagementChart(engagementData);
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showToast('Error loading analytics', 'error');
            this.hideLoading();
        }
    }

    async fetchPopularProducts() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { name: 'Product A', wishlists: 45 },
                    { name: 'Product B', wishlists: 38 },
                    { name: 'Product C', wishlists: 32 },
                    { name: 'Product D', wishlists: 28 },
                    { name: 'Product E', wishlists: 24 }
                ]);
            }, 1000);
        });
    }

    async fetchEngagementData() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    data: [12, 19, 3, 5, 2, 3, 9]
                });
            }, 1000);
        });
    }

    updatePopularProducts(products) {
        const container = document.getElementById('popular-products');
        container.innerHTML = '';

        products.forEach((product, index) => {
            const item = document.createElement('div');
            item.className = 'product-item';
            item.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid #f1f5f9;
            `;
            
            if (index === products.length - 1) {
                item.style.borderBottom = 'none';
            }

            item.innerHTML = `
                <span>${product.name}</span>
                <span style="font-weight: 600; color: #667eea;">${product.wishlists}</span>
            `;
            container.appendChild(item);
        });
    }

    updateEngagementChart(data) {
        // In a real app, you would use Chart.js or similar library
        const canvas = document.getElementById('engagement-chart');
        const ctx = canvas.getContext('2d');
        
        // Simple bar chart simulation
        canvas.width = 400;
        canvas.height = 200;
        
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / data.data.length;
        const maxValue = Math.max(...data.data);
        
        data.data.forEach((value, index) => {
            const barHeight = (value / maxValue) * (canvas.height - 40);
            const x = index * barWidth + 10;
            const y = canvas.height - barHeight - 20;
            
            ctx.fillStyle = '#667eea';
            ctx.fillRect(x, y, barWidth - 20, barHeight);
            
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(data.labels[index], x + (barWidth - 20) / 2, canvas.height - 5);
        });
    }

    async loadSettings() {
        // Load current settings
        const settings = {
            emailNotifications: true,
            notificationFrequency: 'immediate',
            webhookUrl: ''
        };

        document.getElementById('email-notifications').checked = settings.emailNotifications;
        document.getElementById('notification-frequency').value = settings.notificationFrequency;
        document.getElementById('webhook-url').value = settings.webhookUrl;
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle'
        };

        toast.innerHTML = `
            <i class="fas fa-${iconMap[type]}"></i>
            <span>${message}</span>
        `;

        document.getElementById('toast-container').appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Global functions
function refreshWishlists() {
    dashboard.loadWishlists();
    dashboard.showToast('Wishlists refreshed', 'success');
}

function sendTestNotification() {
    dashboard.showToast('Test notification sent', 'success');
}

function viewWishlist(id) {
    dashboard.showToast(`Viewing wishlist ${id}`, 'info');
}

function updateAnalytics() {
    dashboard.loadAnalytics();
    dashboard.showToast('Analytics updated', 'success');
}

function saveSettings() {
    const settings = {
        emailNotifications: document.getElementById('email-notifications').checked,
        notificationFrequency: document.getElementById('notification-frequency').value,
        webhookUrl: document.getElementById('webhook-url').value
    };

    // In a real app, you would send this to your API
    console.log('Saving settings:', settings);
    dashboard.showToast('Settings saved successfully', 'success');
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
});


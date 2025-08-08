// Swym Relay Wishlist Widget
// This script can be embedded in Shopify themes to add wishlist functionality

(function() {
    'use strict';

    class SwymRelayWidget {
        constructor(options = {}) {
            this.options = {
                apiUrl: options.apiUrl || window.location.origin,
                shop: options.shop || window.Shopify?.shop || 'demo-shop',
                customerId: options.customerId || this.getCustomerId(),
                theme: options.theme || 'default',
                position: options.position || 'bottom-right',
                ...options
            };

            this.wishlistItems = new Set();
            this.init();
        }

        init() {
            this.loadStyles();
            this.createWishlistButton();
            this.createWishlistModal();
            this.bindEvents();
            this.loadWishlistItems();
        }

        loadStyles() {
            const styles = `
                .swym-wishlist-btn {
                    position: relative;
                    background: none;
                    border: 2px solid #333;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .swym-wishlist-btn:hover {
                    background-color: #333;
                    color: white;
                }

                .swym-wishlist-btn.active {
                    background-color: #e74c3c;
                    border-color: #e74c3c;
                    color: white;
                }

                .swym-wishlist-btn.active:hover {
                    background-color: #c0392b;
                    border-color: #c0392b;
                }

                .swym-heart-icon {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }

                .swym-wishlist-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }

                .swym-modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .swym-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #eee;
                }

                .swym-modal-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0;
                }

                .swym-close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .swym-wishlist-items {
                    display: grid;
                    gap: 1rem;
                }

                .swym-wishlist-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    border: 1px solid #eee;
                    border-radius: 4px;
                }

                .swym-item-image {
                    width: 80px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: 4px;
                }

                .swym-item-details {
                    flex: 1;
                }

                .swym-item-title {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .swym-item-price {
                    color: #666;
                    margin-bottom: 0.5rem;
                }

                .swym-item-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .swym-btn {
                    padding: 0.5rem 1rem;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                }

                .swym-btn:hover {
                    background: #f5f5f5;
                }

                .swym-btn-primary {
                    background: #333;
                    color: white;
                    border-color: #333;
                }

                .swym-btn-primary:hover {
                    background: #555;
                    border-color: #555;
                }

                .swym-btn-danger {
                    background: #e74c3c;
                    color: white;
                    border-color: #e74c3c;
                }

                .swym-btn-danger:hover {
                    background: #c0392b;
                    border-color: #c0392b;
                }

                .swym-empty-wishlist {
                    text-align: center;
                    padding: 2rem;
                    color: #666;
                }

                .swym-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #333;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 4px;
                    z-index: 10001;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }

                .swym-notification.show {
                    transform: translateX(0);
                }

                .swym-floating-wishlist {
                    position: fixed;
                    ${this.options.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
                    ${this.options.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
                    background: white;
                    border: 2px solid #333;
                    border-radius: 50px;
                    padding: 12px 16px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    z-index: 1000;
                }

                .swym-floating-wishlist:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                }

                .swym-wishlist-count {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #e74c3c;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .swym-modal-content {
                        width: 95%;
                        padding: 1.5rem;
                    }
                    
                    .swym-wishlist-item {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .swym-item-image {
                        align-self: center;
                    }
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        createWishlistButton() {
            // Create wishlist buttons for product pages
            const productForms = document.querySelectorAll('form[action*="/cart/add"]');
            
            productForms.forEach(form => {
                const productId = this.getProductIdFromForm(form);
                if (productId) {
                    const button = this.createButton(productId);
                    form.appendChild(button);
                }
            });

            // Create floating wishlist button
            this.createFloatingButton();
        }

        createButton(productId) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'swym-wishlist-btn';
            button.dataset.productId = productId;
            
            const isInWishlist = this.wishlistItems.has(productId);
            button.classList.toggle('active', isInWishlist);
            
            button.innerHTML = `
                <svg class="swym-heart-icon" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                ${isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            `;

            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleWishlistItem(productId, button);
            });

            return button;
        }

        createFloatingButton() {
            const floatingBtn = document.createElement('div');
            floatingBtn.className = 'swym-floating-wishlist';
            floatingBtn.innerHTML = `
                <svg class="swym-heart-icon" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span class="swym-wishlist-count">0</span>
            `;

            floatingBtn.addEventListener('click', () => {
                this.openWishlistModal();
            });

            document.body.appendChild(floatingBtn);
            this.floatingBtn = floatingBtn;
        }

        createWishlistModal() {
            const modal = document.createElement('div');
            modal.className = 'swym-wishlist-modal';
            modal.innerHTML = `
                <div class="swym-modal-content">
                    <div class="swym-modal-header">
                        <h2 class="swym-modal-title">My Wishlist</h2>
                        <button class="swym-close-btn">&times;</button>
                    </div>
                    <div class="swym-wishlist-items" id="swym-wishlist-items">
                        <div class="swym-empty-wishlist">
                            <p>Your wishlist is empty</p>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            this.modal = modal;
        }

        bindEvents() {
            // Close modal events
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeWishlistModal();
                }
            });

            this.modal.querySelector('.swym-close-btn').addEventListener('click', () => {
                this.closeWishlistModal();
            });

            // Escape key to close modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                    this.closeWishlistModal();
                }
            });
        }

        async toggleWishlistItem(productId, button) {
            try {
                const isInWishlist = this.wishlistItems.has(productId);
                
                if (isInWishlist) {
                    await this.removeFromWishlist(productId);
                    this.wishlistItems.delete(productId);
                    button.classList.remove('active');
                    button.innerHTML = `
                        <svg class="swym-heart-icon" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Add to Wishlist
                    `;
                    this.showNotification('Removed from wishlist');
                } else {
                    await this.addToWishlist(productId);
                    this.wishlistItems.add(productId);
                    button.classList.add('active');
                    button.innerHTML = `
                        <svg class="swym-heart-icon" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Remove from Wishlist
                    `;
                    this.showNotification('Added to wishlist');
                }

                this.updateWishlistCount();
            } catch (error) {
                console.error('Error toggling wishlist item:', error);
                this.showNotification('Error updating wishlist', 'error');
            }
        }

        async addToWishlist(productId) {
            const response = await fetch(`${this.options.apiUrl}/api/wishlist/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: this.options.customerId,
                    name: 'Default Wishlist'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create wishlist');
            }

            const { wishlist } = await response.json();
            
            const addResponse = await fetch(`${this.options.apiUrl}/api/wishlist/${wishlist.id}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: productId
                })
            });

            if (!addResponse.ok) {
                throw new Error('Failed to add item to wishlist');
            }

            return addResponse.json();
        }

        async removeFromWishlist(productId) {
            // In a real implementation, you would need to track wishlist IDs
            // For now, we'll simulate the API call
            const response = await fetch(`${this.options.apiUrl}/api/wishlist/default/items`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: productId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from wishlist');
            }

            return response.json();
        }

        async loadWishlistItems() {
            try {
                // In a real implementation, you would load from API
                // For now, we'll use localStorage
                const saved = localStorage.getItem(`swym_wishlist_${this.options.shop}_${this.options.customerId}`);
                if (saved) {
                    this.wishlistItems = new Set(JSON.parse(saved));
                    this.updateWishlistCount();
                }
            } catch (error) {
                console.error('Error loading wishlist items:', error);
            }
        }

        saveWishlistItems() {
            try {
                localStorage.setItem(
                    `swym_wishlist_${this.options.shop}_${this.options.customerId}`,
                    JSON.stringify([...this.wishlistItems])
                );
            } catch (error) {
                console.error('Error saving wishlist items:', error);
            }
        }

        updateWishlistCount() {
            const count = this.wishlistItems.size;
            const countElement = this.floatingBtn.querySelector('.swym-wishlist-count');
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'flex' : 'none';
            this.saveWishlistItems();
        }

        openWishlistModal() {
            this.modal.style.display = 'flex';
            this.loadWishlistModal();
        }

        closeWishlistModal() {
            this.modal.style.display = 'none';
        }

        async loadWishlistModal() {
            const container = this.modal.querySelector('#swym-wishlist-items');
            
            if (this.wishlistItems.size === 0) {
                container.innerHTML = `
                    <div class="swym-empty-wishlist">
                        <p>Your wishlist is empty</p>
                    </div>
                `;
                return;
            }

            // In a real implementation, you would fetch product details from Shopify API
            container.innerHTML = '';
            
            for (const productId of this.wishlistItems) {
                const item = document.createElement('div');
                item.className = 'swym-wishlist-item';
                item.innerHTML = `
                    <img class="swym-item-image" src="https://via.placeholder.com/80" alt="Product">
                    <div class="swym-item-details">
                        <div class="swym-item-title">Product ${productId}</div>
                        <div class="swym-item-price">$29.99</div>
                        <div class="swym-item-actions">
                            <button class="swym-btn swym-btn-primary" onclick="window.location.href='/products/product-${productId}'">
                                View Product
                            </button>
                            <button class="swym-btn swym-btn-danger" onclick="swymWidget.removeFromWishlistModal('${productId}')">
                                Remove
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(item);
            }
        }

        removeFromWishlistModal(productId) {
            this.wishlistItems.delete(productId);
            this.updateWishlistCount();
            this.loadWishlistModal();
            this.showNotification('Removed from wishlist');
            
            // Update button state if on product page
            const button = document.querySelector(`[data-product-id="${productId}"]`);
            if (button) {
                button.classList.remove('active');
                button.innerHTML = `
                    <svg class="swym-heart-icon" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    Add to Wishlist
                `;
            }
        }

        showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = 'swym-notification';
            notification.textContent = message;
            
            if (type === 'error') {
                notification.style.background = '#e74c3c';
            }

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }

        getProductIdFromForm(form) {
            const input = form.querySelector('input[name="id"]');
            return input ? input.value : null;
        }

        getCustomerId() {
            // Try to get customer ID from Shopify
            if (window.Shopify && window.Shopify.customer) {
                return window.Shopify.customer.id;
            }
            
            // Generate anonymous customer ID
            let customerId = localStorage.getItem('swym_customer_id');
            if (!customerId) {
                customerId = 'anonymous_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('swym_customer_id', customerId);
            }
            return customerId;
        }
    }

    // Initialize widget when DOM is ready
    function initSwymWidget() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.swymWidget = new SwymRelayWidget();
            });
        } else {
            window.swymWidget = new SwymRelayWidget();
        }
    }

    initSwymWidget();
})();


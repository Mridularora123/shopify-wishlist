class Wishlist {
    constructor() {
        // In a real app, this would connect to a database
        this.wishlists = new Map();
        this.wishlistItems = new Map();
    }

    // Create a new wishlist for a customer
    createWishlist(customerId, shopDomain, name = 'Default Wishlist') {
        const wishlistId = `${shopDomain}_${customerId}_${Date.now()}`;
        const wishlist = {
            id: wishlistId,
            customerId,
            shopDomain,
            name,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.wishlists.set(wishlistId, wishlist);
        return wishlist;
    }

    // Add item to wishlist
    addItemToWishlist(wishlistId, productId, variantId = null) {
        const wishlist = this.wishlists.get(wishlistId);
        if (!wishlist) {
            throw new Error('Wishlist not found');
        }

        const item = {
            productId,
            variantId,
            addedAt: new Date()
        };

        // Check if item already exists
        const existingItem = wishlist.items.find(
            item => item.productId === productId && item.variantId === variantId
        );

        if (!existingItem) {
            wishlist.items.push(item);
            wishlist.updatedAt = new Date();
            this.wishlists.set(wishlistId, wishlist);
        }

        return wishlist;
    }

    // Remove item from wishlist
    removeItemFromWishlist(wishlistId, productId, variantId = null) {
        const wishlist = this.wishlists.get(wishlistId);
        if (!wishlist) {
            throw new Error('Wishlist not found');
        }

        wishlist.items = wishlist.items.filter(
            item => !(item.productId === productId && item.variantId === variantId)
        );
        wishlist.updatedAt = new Date();
        this.wishlists.set(wishlistId, wishlist);

        return wishlist;
    }

    // Get wishlist by ID
    getWishlist(wishlistId) {
        return this.wishlists.get(wishlistId);
    }

    // Get all wishlists for a customer
    getCustomerWishlists(customerId, shopDomain) {
        const customerWishlists = [];
        for (const [id, wishlist] of this.wishlists) {
            if (wishlist.customerId === customerId && wishlist.shopDomain === shopDomain) {
                customerWishlists.push(wishlist);
            }
        }
        return customerWishlists;
    }

    // Get all items that need stock notifications
    getItemsForStockNotification(shopDomain) {
        const items = [];
        for (const [id, wishlist] of this.wishlists) {
            if (wishlist.shopDomain === shopDomain) {
                wishlist.items.forEach(item => {
                    items.push({
                        ...item,
                        wishlistId: id,
                        customerId: wishlist.customerId
                    });
                });
            }
        }
        return items;
    }
}

module.exports = new Wishlist();


const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const { requireInstallation } = require('../middleware/auth');

// Get customer wishlists
router.get('/customer/:customerId', requireInstallation, (req, res) => {
    try {
        const { customerId } = req.params;
        const { shop } = req.query;

        const wishlists = Wishlist.getCustomerWishlists(customerId, shop);
        res.json({ success: true, wishlists });
    } catch (error) {
        console.error('Error fetching customer wishlists:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create a new wishlist
router.post('/create', requireInstallation, (req, res) => {
    try {
        const { customerId, name } = req.body;
        const { shop } = req.query;

        if (!customerId) {
            return res.status(400).json({ success: false, error: 'Customer ID is required' });
        }

        const wishlist = Wishlist.createWishlist(customerId, shop, name);
        res.json({ success: true, wishlist });
    } catch (error) {
        console.error('Error creating wishlist:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add item to wishlist
router.post('/:wishlistId/items', requireInstallation, (req, res) => {
    try {
        const { wishlistId } = req.params;
        const { productId, variantId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        const wishlist = Wishlist.addItemToWishlist(wishlistId, productId, variantId);
        res.json({ success: true, wishlist });
    } catch (error) {
        console.error('Error adding item to wishlist:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove item from wishlist
router.delete('/:wishlistId/items', requireInstallation, (req, res) => {
    try {
        const { wishlistId } = req.params;
        const { productId, variantId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        const wishlist = Wishlist.removeItemFromWishlist(wishlistId, productId, variantId);
        res.json({ success: true, wishlist });
    } catch (error) {
        console.error('Error removing item from wishlist:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get wishlist by ID
router.get('/:wishlistId', requireInstallation, (req, res) => {
    try {
        const { wishlistId } = req.params;
        const wishlist = Wishlist.getWishlist(wishlistId);

        if (!wishlist) {
            return res.status(404).json({ success: false, error: 'Wishlist not found' });
        }

        res.json({ success: true, wishlist });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Subscribe to product notifications
router.post('/notifications/subscribe', requireInstallation, (req, res) => {
    try {
        const { customerId, productId, variantId, notificationType } = req.body;
        const { shop } = req.query;

        if (!customerId || !productId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Customer ID and Product ID are required' 
            });
        }

        const subscription = Notification.subscribeToProduct(
            customerId, 
            shop, 
            productId, 
            variantId, 
            notificationType
        );

        res.json({ success: true, subscription });
    } catch (error) {
        console.error('Error subscribing to notifications:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Unsubscribe from notifications
router.post('/notifications/unsubscribe', requireInstallation, (req, res) => {
    try {
        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Subscription ID is required' 
            });
        }

        const subscription = Notification.unsubscribe(subscriptionId);
        res.json({ success: true, subscription });
    } catch (error) {
        console.error('Error unsubscribing from notifications:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get customer subscriptions
router.get('/notifications/customer/:customerId', requireInstallation, (req, res) => {
    try {
        const { customerId } = req.params;
        const { shop } = req.query;

        const subscriptions = Notification.getCustomerSubscriptions(customerId, shop);
        res.json({ success: true, subscriptions });
    } catch (error) {
        console.error('Error fetching customer subscriptions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;


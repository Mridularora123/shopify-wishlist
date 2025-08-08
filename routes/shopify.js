const express = require('express');
const router = express.Router();
const ShopifyService = require('../services/shopifyService');
const { requireInstallation } = require('../middleware/auth');

// Get shop information
router.get('/shop', requireInstallation, async (req, res) => {
    try {
        const { shop } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        const shopifyService = new ShopifyService(shop, accessToken);
        const shopInfo = await shopifyService.getShop();
        
        res.json({ success: true, shop: shopInfo });
    } catch (error) {
        console.error('Error fetching shop info:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get product details
router.get('/products/:productId', requireInstallation, async (req, res) => {
    try {
        const { productId } = req.params;
        const { shop } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        const shopifyService = new ShopifyService(shop, accessToken);
        const product = await shopifyService.getProduct(productId);
        
        res.json({ success: true, product });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get multiple products
router.post('/products/batch', requireInstallation, async (req, res) => {
    try {
        const { productIds } = req.body;
        const { shop } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({ success: false, error: 'Product IDs array is required' });
        }
        
        const shopifyService = new ShopifyService(shop, accessToken);
        const products = await shopifyService.getProducts(productIds);
        
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get customer details
router.get('/customers/:customerId', requireInstallation, async (req, res) => {
    try {
        const { customerId } = req.params;
        const { shop } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        const shopifyService = new ShopifyService(shop, accessToken);
        const customer = await shopifyService.getCustomer(customerId);
        
        res.json({ success: true, customer });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get product variant details
router.get('/variants/:variantId', requireInstallation, async (req, res) => {
    try {
        const { variantId } = req.params;
        const { shop } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        const shopifyService = new ShopifyService(shop, accessToken);
        const variant = await shopifyService.getVariant(variantId);
        
        res.json({ success: true, variant });
    } catch (error) {
        console.error('Error fetching variant:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search products
router.get('/products/search/:query', requireInstallation, async (req, res) => {
    try {
        const { query } = req.params;
        const { shop, limit } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        const shopifyService = new ShopifyService(shop, accessToken);
        const products = await shopifyService.searchProducts(query, limit);
        
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create webhooks
router.post('/webhooks/create', requireInstallation, async (req, res) => {
    try {
        const { topic, address } = req.body;
        const { shop } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        if (!topic || !address) {
            return res.status(400).json({ success: false, error: 'Topic and address are required' });
        }
        
        const shopifyService = new ShopifyService(shop, accessToken);
        const webhook = await shopifyService.createWebhook(topic, address);
        
        res.json({ success: true, webhook });
    } catch (error) {
        console.error('Error creating webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all webhooks
router.get('/webhooks', requireInstallation, async (req, res) => {
    try {
        const { shop } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        const shopifyService = new ShopifyService(shop, accessToken);
        const webhooks = await shopifyService.getWebhooks();
        
        res.json({ success: true, webhooks });
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete webhook
router.delete('/webhooks/:webhookId', requireInstallation, async (req, res) => {
    try {
        const { webhookId } = req.params;
        const { shop } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        const shopifyService = new ShopifyService(shop, accessToken);
        await shopifyService.deleteWebhook(webhookId);
        
        res.json({ success: true, message: 'Webhook deleted successfully' });
    } catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Setup required webhooks for the app
router.post('/webhooks/setup', requireInstallation, async (req, res) => {
    try {
        const { shop } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        const appUrl = process.env.SHOPIFY_APP_URL;
        
        const shopifyService = new ShopifyService(shop, accessToken);
        
        // Required webhooks for Swym Relay functionality
        const requiredWebhooks = [
            {
                topic: 'products/update',
                address: `${appUrl}/webhooks/products/update`
            },
            {
                topic: 'inventory_levels/update',
                address: `${appUrl}/webhooks/inventory_levels/update`
            },
            {
                topic: 'orders/create',
                address: `${appUrl}/webhooks/orders/create`
            },
            {
                topic: 'app/uninstalled',
                address: `${appUrl}/webhooks/app/uninstalled`
            }
        ];
        
        const createdWebhooks = [];
        
        for (const webhookConfig of requiredWebhooks) {
            try {
                const webhook = await shopifyService.createWebhook(webhookConfig.topic, webhookConfig.address);
                createdWebhooks.push(webhook);
            } catch (error) {
                console.error(`Error creating webhook for ${webhookConfig.topic}:`, error);
                // Continue with other webhooks even if one fails
            }
        }
        
        res.json({ 
            success: true, 
            message: `Created ${createdWebhooks.length} webhooks`,
            webhooks: createdWebhooks 
        });
    } catch (error) {
        console.error('Error setting up webhooks:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get inventory levels
router.get('/inventory/:locationId', requireInstallation, async (req, res) => {
    try {
        const { locationId } = req.params;
        const { shop, inventory_item_ids } = req.query;
        const accessToken = 'your_access_token_here'; // In real app, get from database
        
        if (!inventory_item_ids) {
            return res.status(400).json({ success: false, error: 'Inventory item IDs are required' });
        }
        
        const inventoryItemIds = inventory_item_ids.split(',');
        const shopifyService = new ShopifyService(shop, accessToken);
        const inventoryLevels = await shopifyService.getInventoryLevels(locationId, inventoryItemIds);
        
        res.json({ success: true, inventoryLevels });
    } catch (error) {
        console.error('Error fetching inventory levels:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;


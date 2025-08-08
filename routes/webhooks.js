const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyWebhook } = require('../middleware/auth');
const webhookProcessor = require('../services/webhookProcessor');

// Product update webhook
router.post('/products/update', verifyWebhook, async (req, res) => {
    try {
        const product = req.body;
        const shop = req.shop;

        console.log(`Product updated: ${product.id} in shop: ${shop}`);

        const result = await webhookProcessor.process('products/update', product, shop);
        
        if (result.success) {
            res.status(200).json({ 
                success: true, 
                message: 'Product update processed successfully',
                data: result.result 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        console.error('Error processing product update webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Inventory level update webhook
router.post('/inventory_levels/update', verifyWebhook, async (req, res) => {
    try {
        const inventoryLevel = req.body;
        const shop = req.shop;

        console.log(`Inventory updated for variant: ${inventoryLevel.inventory_item_id} in shop: ${shop}`);

        const result = await webhookProcessor.process('inventory_levels/update', inventoryLevel, shop);
        
        if (result.success) {
            res.status(200).json({ 
                success: true, 
                message: 'Inventory update processed successfully',
                data: result.result 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        console.error('Error processing inventory update webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Order creation webhook (for analytics)
router.post('/orders/create', verifyWebhook, async (req, res) => {
    try {
        const order = req.body;
        const shop = req.shop;

        console.log(`Order created: ${order.id} in shop: ${shop}`);

        const result = await webhookProcessor.process('orders/create', order, shop);
        
        if (result.success) {
            res.status(200).json({ 
                success: true, 
                message: 'Order creation processed successfully',
                data: result.result 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        console.error('Error processing order creation webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// App uninstall webhook
router.post('/app/uninstalled', verifyWebhook, async (req, res) => {
    try {
        const data = req.body;
        const shop = req.shop;
        
        console.log(`App uninstalled from shop: ${shop}`);

        const result = await webhookProcessor.process('app/uninstalled', data, shop);
        
        if (result.success) {
            res.status(200).json({ 
                success: true, 
                message: 'App uninstall processed successfully',
                data: result.result 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        console.error('Error processing app uninstall webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Manual webhook processing endpoint (for testing)
router.post('/process/:topic', verifyWebhook, async (req, res) => {
    try {
        const { topic } = req.params;
        const data = req.body;
        const shop = req.shop;

        console.log(`Manual webhook processing: ${topic} for shop: ${shop}`);

        const result = await webhookProcessor.process(topic, data, shop);
        
        res.json({
            success: result.success,
            message: result.success ? 'Webhook processed successfully' : 'Webhook processing failed',
            data: result.success ? result.result : result.error
        });
    } catch (error) {
        console.error('Error in manual webhook processing:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Scheduled tasks endpoint (can be called by cron jobs)
router.post('/scheduled/:shop', async (req, res) => {
    try {
        const { shop } = req.params;
        const { authorization } = req.headers;

        // Simple authorization check for scheduled tasks
        if (authorization !== `Bearer ${process.env.WEBHOOK_SECRET || 'your-secret-key'}`) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        console.log(`Processing scheduled tasks for shop: ${shop}`);

        const result = await webhookProcessor.processScheduledTasks(shop);
        
        res.json({
            success: true,
            message: 'Scheduled tasks processed successfully',
            data: result
        });
    } catch (error) {
        console.error('Error processing scheduled tasks:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Webhook verification endpoint
router.get('/verify', (req, res) => {
    res.json({
        success: true,
        message: 'Webhook endpoint is active',
        timestamp: new Date().toISOString(),
        endpoints: [
            'POST /webhooks/products/update',
            'POST /webhooks/inventory_levels/update',
            'POST /webhooks/orders/create',
            'POST /webhooks/app/uninstalled',
            'POST /webhooks/process/:topic',
            'POST /webhooks/scheduled/:shop'
        ]
    });
});

module.exports = router;


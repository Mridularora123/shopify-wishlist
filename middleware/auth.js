const shopify = require('../config/shopify');

// Middleware to verify Shopify webhook
const verifyWebhook = (req, res, next) => {
    try {
        const hmac = req.get('X-Shopify-Hmac-Sha256');
        const body = req.body;
        const shop = req.get('X-Shopify-Shop-Domain');

        if (!hmac || !shop) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // In a real app, you would verify the HMAC signature here
        // const calculatedHmac = crypto
        //     .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
        //     .update(body, 'utf8')
        //     .digest('base64');

        // if (calculatedHmac !== hmac) {
        //     return res.status(401).json({ error: 'Unauthorized' });
        // }

        req.shop = shop;
        next();
    } catch (error) {
        console.error('Webhook verification error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Middleware to verify Shopify app requests
const verifyShopifyApp = async (req, res, next) => {
    try {
        const { shop, hmac, timestamp, ...query } = req.query;

        if (!shop || !hmac) {
            return res.status(401).json({ error: 'Missing required parameters' });
        }

        // In a real app, you would verify the request signature here
        // const queryString = Object.keys(query)
        //     .sort()
        //     .map(key => `${key}=${query[key]}`)
        //     .join('&');

        // const calculatedHmac = crypto
        //     .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
        //     .update(queryString)
        //     .digest('hex');

        // if (calculatedHmac !== hmac) {
        //     return res.status(401).json({ error: 'Invalid signature' });
        // }

        req.shop = shop;
        next();
    } catch (error) {
        console.error('App verification error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Middleware to check if shop is installed
const requireInstallation = async (req, res, next) => {
    try {
        const shop = req.shop || req.query.shop;
        
        if (!shop) {
            return res.status(400).json({ error: 'Shop parameter required' });
        }

        // In a real app, you would check if the shop has installed the app
        // and has valid access tokens stored in your database

        req.shop = shop;
        next();
    } catch (error) {
        console.error('Installation check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    verifyWebhook,
    verifyShopifyApp,
    requireInstallation
};


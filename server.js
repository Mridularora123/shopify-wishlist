const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

// Import routes
const wishlistRoutes = require('./routes/wishlist');
const webhookRoutes = require('./routes/webhooks');
const shopifyRoutes = require('./routes/shopify');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS middleware - allow all origins for development
app.use(cors({
    origin: true,
    credentials: true
}));

// Body parsing middleware
app.use('/webhooks', express.raw({ type: 'application/json' })); // Raw body for webhooks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/webhooks', webhookRoutes);

// Basic routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Shopify app installation route
app.get('/install', (req, res) => {
    const { shop } = req.query;
    
    if (!shop) {
        return res.status(400).json({ error: 'Shop parameter is required' });
    }

    // In a real app, you would redirect to Shopify OAuth
    const installUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?` +
        `client_id=${process.env.SHOPIFY_API_KEY}&` +
        `scope=${process.env.SHOPIFY_SCOPES}&` +
        `redirect_uri=${process.env.SHOPIFY_APP_URL}/auth/callback&` +
        `state=${Date.now()}`;

    res.redirect(installUrl);
});

// OAuth callback route
app.get('/auth/callback', (req, res) => {
    const { code, shop, state } = req.query;
    
    if (!code || !shop) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // In a real app, you would exchange the code for an access token
    // and store it securely in your database
    
    res.json({ 
        success: true, 
        message: 'App installed successfully',
        shop: shop
    });
});

// Admin dashboard route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Shopify Swym Relay App is running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 App URL: ${process.env.SHOPIFY_APP_URL || `http://localhost:${PORT}`}`);
});


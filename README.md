# Shopify Swym Relay Clone - Complete Implementation Guide

A comprehensive Shopify private app implementation that replicates the core functionality of Swym Relay, including wishlist management, back-in-stock notifications, price drop alerts, and customer engagement features.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Shopify CLI Deployment](#shopify-cli-deployment)
7. [Render.com Hosting](#rendercom-hosting)
8. [Configuration](#configuration)
9. [API Documentation](#api-documentation)
10. [Webhook Integration](#webhook-integration)
11. [Frontend Integration](#frontend-integration)
12. [Testing](#testing)
13. [Deployment](#deployment)
14. [Monitoring & Maintenance](#monitoring--maintenance)
15. [Troubleshooting](#troubleshooting)
16. [Contributing](#contributing)
17. [License](#license)

## Overview

This project is a complete implementation of a Shopify private app that provides wishlist functionality similar to Swym Relay. The application enables customers to save products for later, receive notifications when items are back in stock or prices drop, and helps merchants increase customer engagement and conversion rates.

The application is built using Node.js and Express.js for the backend, with a responsive web interface for the admin dashboard. It integrates seamlessly with Shopify's API and webhook system to provide real-time updates and notifications.

## Features

### Core Wishlist Functionality
- **Customer Wishlists**: Allow customers to create and manage multiple wishlists
- **Product Management**: Add/remove products and variants to/from wishlists
- **Anonymous Support**: Support for guest customers without requiring login
- **Persistent Storage**: Wishlist data persists across sessions

### Notification System
- **Back-in-Stock Alerts**: Automatic notifications when wishlist items become available
- **Price Drop Notifications**: Alerts when product prices decrease
- **Low Stock Warnings**: Notifications when inventory levels are low
- **Email Integration**: Automated email notifications with customizable templates
- **Subscription Management**: Customers can manage their notification preferences

### Admin Dashboard
- **Analytics Dashboard**: Comprehensive overview of wishlist activity and performance
- **Customer Management**: View and manage customer wishlists and subscriptions
- **Notification Center**: Monitor and manage all notification activities
- **Settings Panel**: Configure app settings and notification preferences
- **Real-time Updates**: Live dashboard updates using modern web technologies

### Shopify Integration
- **OAuth Authentication**: Secure app installation and authorization
- **Webhook Processing**: Real-time processing of product, inventory, and order updates
- **API Integration**: Full integration with Shopify's REST Admin API
- **Theme Compatibility**: Frontend widget compatible with all Shopify themes
- **Multi-store Support**: Support for multiple Shopify stores

### Technical Features
- **RESTful API**: Well-structured API endpoints for all functionality
- **Responsive Design**: Mobile-friendly admin dashboard and customer interface
- **Security**: Comprehensive security measures including CORS, helmet, and webhook verification
- **Scalability**: Designed for high-traffic stores with efficient data handling
- **Error Handling**: Robust error handling and logging throughout the application

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
shopify-swym-relay/
├── config/                 # Configuration files
│   └── shopify.js         # Shopify API configuration
├── middleware/            # Express middleware
│   └── auth.js           # Authentication and verification
├── models/               # Data models
│   ├── Wishlist.js      # Wishlist data management
│   └── Notification.js   # Notification management
├── routes/              # API route handlers
│   ├── wishlist.js     # Wishlist API endpoints
│   ├── webhooks.js     # Webhook handlers
│   └── shopify.js      # Shopify API integration
├── services/           # Business logic services
│   ├── emailService.js        # Email notification service
│   ├── shopifyService.js      # Shopify API service
│   └── webhookProcessor.js    # Webhook processing logic
├── public/            # Static frontend files
│   ├── index.html    # Landing page
│   ├── admin.html    # Admin dashboard
│   ├── admin.css     # Dashboard styles
│   ├── admin.js      # Dashboard functionality
│   └── wishlist-widget.js  # Frontend widget
├── server.js         # Main application server
├── package.json      # Node.js dependencies
├── render.yaml       # Render.com deployment config
├── Dockerfile        # Container configuration
└── README.md         # This documentation
```

### Technology Stack

**Backend:**
- Node.js 18+ with Express.js framework
- Shopify API integration using @shopify/shopify-api
- Nodemailer for email notifications
- Axios for HTTP requests
- CORS and Helmet for security

**Frontend:**
- Vanilla JavaScript with modern ES6+ features
- Responsive CSS with Flexbox and Grid
- Font Awesome icons for UI elements
- Chart.js for analytics visualization

**Deployment:**
- Render.com for cloud hosting
- Docker containerization support
- Environment-based configuration
- Automated CI/CD pipeline

## Prerequisites

Before setting up the application, ensure you have the following prerequisites installed and configured:

### System Requirements
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: For version control and deployment
- **Shopify Partner Account**: Required for creating private apps
- **Email Service**: Gmail or other SMTP service for notifications

### Shopify Requirements
- **Shopify Store**: A Shopify store for testing and deployment
- **Private App Credentials**: API key and secret from Shopify
- **Webhook Endpoints**: Accessible URLs for webhook delivery
- **Required Permissions**: Appropriate API scopes for app functionality

### Development Tools (Optional)
- **Postman**: For API testing
- **VS Code**: Recommended code editor
- **Docker**: For containerized deployment
- **ngrok**: For local webhook testing

## Installation & Setup

Follow these detailed steps to set up the application locally:

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd shopify-swym-relay
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Express.js for the web server
- Shopify API SDK for integration
- Nodemailer for email functionality
- Security middleware (CORS, Helmet)
- Development tools (Nodemon)

### Step 3: Environment Configuration

Create a `.env` file in the root directory with the following configuration:

```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_customers,write_customers,read_orders,write_orders
SHOPIFY_APP_URL=https://your-app-url.onrender.com

# Database Configuration (if using a database)
DATABASE_URL=your_database_url_here

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Server Configuration
PORT=3000
NODE_ENV=development

# Webhook Security
WEBHOOK_SECRET=your_webhook_secret_key
```

### Step 4: Shopify App Setup

1. **Create a Private App in Shopify:**
   - Log into your Shopify Partner Dashboard
   - Navigate to Apps > Create App > Custom App
   - Fill in the app details and configuration
   - Note down the API key and secret

2. **Configure App Permissions:**
   - Set the required scopes in your app configuration
   - Enable webhook endpoints for real-time updates
   - Configure OAuth redirect URLs

3. **Install the App:**
   - Use the installation URL to install the app on your test store
   - Complete the OAuth flow to authorize the app
   - Verify the installation was successful

### Step 5: Local Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` with the following endpoints:
- `/` - Landing page
- `/admin` - Admin dashboard
- `/health` - Health check endpoint
- `/api/wishlist/*` - Wishlist API endpoints
- `/api/shopify/*` - Shopify integration endpoints
- `/webhooks/*` - Webhook handlers

## Shopify CLI Deployment

For deploying as a Shopify private app using the Shopify CLI, follow these comprehensive steps:

### Step 1: Install Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
```

### Step 2: Initialize Shopify App

```bash
shopify app init
```

Follow the prompts to configure your app:
- Choose "Node.js" as the framework
- Select "Express" as the web framework
- Configure the app name and description

### Step 3: Configure App Settings

Update the `shopify.app.toml` file with your app configuration:

```toml
# Learn more about configuring your app at https://shopify.dev/docs/apps/tools/cli/configuration

name = "swym-relay-clone"
client_id = "your_client_id"
application_url = "https://your-app-url.onrender.com"
embedded = true

[access_scopes]
scopes = "read_products,write_products,read_customers,write_customers,read_orders,write_orders"

[auth]
redirect_urls = [
  "https://your-app-url.onrender.com/auth/callback"
]

[webhooks]
api_version = "2023-10"

  [[webhooks.subscriptions]]
  topics = [ "products/update" ]
  uri = "https://your-app-url.onrender.com/webhooks/products/update"

  [[webhooks.subscriptions]]
  topics = [ "inventory_levels/update" ]
  uri = "https://your-app-url.onrender.com/webhooks/inventory_levels/update"

  [[webhooks.subscriptions]]
  topics = [ "orders/create" ]
  uri = "https://your-app-url.onrender.com/webhooks/orders/create"

  [[webhooks.subscriptions]]
  topics = [ "app/uninstalled" ]
  uri = "https://your-app-url.onrender.com/webhooks/app/uninstalled"

[pos]
embedded = false
```

### Step 4: Deploy to Shopify

```bash
shopify app deploy
```

This command will:
- Build your application
- Upload it to Shopify's infrastructure
- Configure webhooks and permissions
- Provide installation URLs

### Step 5: Install on Store

```bash
shopify app install
```

Follow the installation flow to add the app to your Shopify store.

## Render.com Hosting

Render.com provides an excellent platform for hosting Node.js applications with automatic deployments and scaling. Here's how to deploy your Shopify app:

### Step 1: Prepare for Deployment

Ensure your application is ready for production:

1. **Update package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required'",
    "dev": "nodemon server.js"
  }
}
```

2. **Configure environment variables:**
   - All sensitive data should be in environment variables
   - No hardcoded credentials in the code
   - Proper error handling for missing variables

### Step 2: Create Render Service

1. **Connect Repository:**
   - Push your code to GitHub, GitLab, or Bitbucket
   - Connect your repository to Render.com
   - Select the branch for deployment (usually `main`)

2. **Configure Service:**
   - Service Type: Web Service
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Choose based on your needs (Starter plan is sufficient for testing)

### Step 3: Environment Variables

Configure the following environment variables in Render:

```
NODE_ENV=production
PORT=10000
SHOPIFY_API_KEY=your_actual_api_key
SHOPIFY_API_SECRET=your_actual_secret
SHOPIFY_SCOPES=read_products,write_products,read_customers,write_customers,read_orders,write_orders
SHOPIFY_APP_URL=https://your-service-name.onrender.com
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
WEBHOOK_SECRET=your_secure_webhook_secret
```

### Step 4: Deploy and Verify

1. **Trigger Deployment:**
   - Render will automatically deploy when you push to the connected branch
   - Monitor the build logs for any errors
   - Verify the service starts successfully

2. **Test Endpoints:**
   - Visit your app URL to ensure it's accessible
   - Test the health endpoint: `https://your-app.onrender.com/health`
   - Verify webhook endpoints are reachable

### Step 5: Configure Shopify Webhooks

Update your Shopify app configuration to use the Render.com URLs:

```bash
curl -X POST \
  https://your-shop.myshopify.com/admin/api/2023-10/webhooks.json \
  -H 'X-Shopify-Access-Token: your_access_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "webhook": {
      "topic": "products/update",
      "address": "https://your-app.onrender.com/webhooks/products/update",
      "format": "json"
    }
  }'
```

Repeat for all required webhook topics.

## Configuration

The application supports extensive configuration through environment variables and configuration files:

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SHOPIFY_API_KEY` | Shopify app API key | Yes | - |
| `SHOPIFY_API_SECRET` | Shopify app secret | Yes | - |
| `SHOPIFY_SCOPES` | Required API permissions | Yes | `read_products,write_products` |
| `SHOPIFY_APP_URL` | Public app URL | Yes | - |
| `PORT` | Server port | No | `3000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `EMAIL_SERVICE` | Email service provider | No | `gmail` |
| `EMAIL_USER` | Email username | No | - |
| `EMAIL_PASS` | Email password/app password | No | - |
| `WEBHOOK_SECRET` | Webhook verification secret | No | `your-secret-key` |
| `DATABASE_URL` | Database connection string | No | - |

### Shopify Configuration

The `config/shopify.js` file contains the Shopify API configuration:

```javascript
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');

const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SHOPIFY_SCOPES.split(','),
    hostName: process.env.SHOPIFY_APP_URL.replace(/https?:\/\//, ''),
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
    logger: {
        level: 'info',
    },
});
```

### Email Configuration

Configure email notifications in the `services/emailService.js`:

```javascript
const transporter = nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in the `EMAIL_PASS` variable

## API Documentation

The application provides a comprehensive RESTful API for all functionality:

### Wishlist Endpoints

#### GET /api/wishlist/customer/:customerId
Retrieve all wishlists for a specific customer.

**Parameters:**
- `customerId` (path): Customer ID
- `shop` (query): Shop domain

**Response:**
```json
{
  "success": true,
  "wishlists": [
    {
      "id": "shop_customer_timestamp",
      "customerId": "123",
      "shopDomain": "example.myshopify.com",
      "name": "Default Wishlist",
      "items": [],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/wishlist/create
Create a new wishlist for a customer.

**Request Body:**
```json
{
  "customerId": "123",
  "name": "My Wishlist"
}
```

**Response:**
```json
{
  "success": true,
  "wishlist": {
    "id": "shop_customer_timestamp",
    "customerId": "123",
    "shopDomain": "example.myshopify.com",
    "name": "My Wishlist",
    "items": [],
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/wishlist/:wishlistId/items
Add an item to a wishlist.

**Parameters:**
- `wishlistId` (path): Wishlist ID

**Request Body:**
```json
{
  "productId": "456",
  "variantId": "789"
}
```

**Response:**
```json
{
  "success": true,
  "wishlist": {
    "id": "shop_customer_timestamp",
    "items": [
      {
        "productId": "456",
        "variantId": "789",
        "addedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### DELETE /api/wishlist/:wishlistId/items
Remove an item from a wishlist.

**Parameters:**
- `wishlistId` (path): Wishlist ID

**Request Body:**
```json
{
  "productId": "456",
  "variantId": "789"
}
```

### Notification Endpoints

#### POST /api/wishlist/notifications/subscribe
Subscribe to product notifications.

**Request Body:**
```json
{
  "customerId": "123",
  "productId": "456",
  "variantId": "789",
  "notificationType": "back_in_stock"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "subscription_id",
    "customerId": "123",
    "productId": "456",
    "variantId": "789",
    "notificationType": "back_in_stock",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/wishlist/notifications/unsubscribe
Unsubscribe from notifications.

**Request Body:**
```json
{
  "subscriptionId": "subscription_id"
}
```

### Shopify Integration Endpoints

#### GET /api/shopify/shop
Get shop information.

**Parameters:**
- `shop` (query): Shop domain

**Response:**
```json
{
  "success": true,
  "shop": {
    "id": 123,
    "name": "Example Shop",
    "domain": "example.myshopify.com",
    "email": "shop@example.com"
  }
}
```

#### GET /api/shopify/products/:productId
Get product details.

**Parameters:**
- `productId` (path): Product ID
- `shop` (query): Shop domain

**Response:**
```json
{
  "success": true,
  "product": {
    "id": 456,
    "title": "Example Product",
    "handle": "example-product",
    "variants": [],
    "images": []
  }
}
```

## Webhook Integration

The application handles several Shopify webhooks for real-time updates:

### Supported Webhooks

1. **products/update**: Triggered when product information changes
2. **inventory_levels/update**: Triggered when inventory levels change
3. **orders/create**: Triggered when new orders are created
4. **app/uninstalled**: Triggered when the app is uninstalled

### Webhook Processing

All webhooks are processed through the `webhookProcessor` service:

```javascript
// Example webhook processing
const result = await webhookProcessor.process('products/update', productData, shop);

if (result.success) {
    console.log('Webhook processed successfully:', result.result);
} else {
    console.error('Webhook processing failed:', result.error);
}
```

### Webhook Security

Webhooks are secured using HMAC verification:

```javascript
const verifyWebhook = (req, res, next) => {
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    const body = req.body;
    const shop = req.get('X-Shopify-Shop-Domain');

    // Verify HMAC signature
    const calculatedHmac = crypto
        .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(body, 'utf8')
        .digest('base64');

    if (calculatedHmac !== hmac) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
};
```

### Setting Up Webhooks

Use the Shopify API to create webhooks:

```bash
curl -X POST \
  https://your-shop.myshopify.com/admin/api/2023-10/webhooks.json \
  -H 'X-Shopify-Access-Token: your_access_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "webhook": {
      "topic": "products/update",
      "address": "https://your-app.onrender.com/webhooks/products/update",
      "format": "json"
    }
  }'
```

Or use the provided API endpoint:

```bash
curl -X POST \
  "https://your-app.onrender.com/api/shopify/webhooks/setup?shop=your-shop.myshopify.com" \
  -H 'Content-Type: application/json'
```

## Frontend Integration

The application includes a JavaScript widget that can be embedded in Shopify themes:

### Widget Installation

1. **Add the widget script to your theme:**
```html
<script src="https://your-app.onrender.com/wishlist-widget.js"></script>
```

2. **Initialize the widget:**
```javascript
// The widget auto-initializes, but you can customize it:
window.swymWidget = new SwymRelayWidget({
    apiUrl: 'https://your-app.onrender.com',
    shop: 'your-shop.myshopify.com',
    theme: 'default',
    position: 'bottom-right'
});
```

### Widget Features

- **Add to Wishlist Buttons**: Automatically added to product forms
- **Floating Wishlist Icon**: Shows wishlist count and provides quick access
- **Wishlist Modal**: Full-featured wishlist management interface
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Integration**: Adapts to your store's design

### Customization

The widget can be customized through CSS:

```css
/* Customize wishlist button */
.swym-wishlist-btn {
    background-color: #your-brand-color;
    border-color: #your-brand-color;
}

/* Customize floating button */
.swym-floating-wishlist {
    background: linear-gradient(45deg, #color1, #color2);
}

/* Customize modal */
.swym-modal-content {
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
```

## Testing

The application includes comprehensive testing capabilities:

### Manual Testing

1. **Start the development server:**
```bash
npm run dev
```

2. **Test API endpoints:**
```bash
# Health check
curl http://localhost:3000/health

# Create wishlist
curl -X POST http://localhost:3000/api/wishlist/create \
  -H "Content-Type: application/json" \
  -d '{"customerId": "test123", "name": "Test Wishlist"}' \
  -G -d "shop=test-shop.myshopify.com"

# Add item to wishlist
curl -X POST http://localhost:3000/api/wishlist/WISHLIST_ID/items \
  -H "Content-Type: application/json" \
  -d '{"productId": "456", "variantId": "789"}' \
  -G -d "shop=test-shop.myshopify.com"
```

3. **Test webhook endpoints:**
```bash
# Test product update webhook
curl -X POST http://localhost:3000/webhooks/products/update \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Shop-Domain: test-shop.myshopify.com" \
  -d '{"id": 123, "title": "Test Product", "variants": [{"id": 456, "inventory_quantity": 10}]}'
```

### Frontend Testing

1. **Open the admin dashboard:**
   - Navigate to `http://localhost:3000/admin`
   - Test all dashboard sections and functionality
   - Verify responsive design on different screen sizes

2. **Test the wishlist widget:**
   - Open `http://localhost:3000`
   - Test wishlist functionality
   - Verify modal operations and notifications

### Production Testing

Before deploying to production:

1. **Environment Variables**: Verify all required environment variables are set
2. **Database Connections**: Test database connectivity if using external storage
3. **Email Functionality**: Send test emails to verify email service configuration
4. **Webhook Delivery**: Test webhook endpoints with actual Shopify data
5. **Performance**: Load test the application with expected traffic levels

## Deployment

### Production Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Database is set up and accessible
- [ ] Email service is configured and tested
- [ ] Shopify app is created and configured
- [ ] Webhooks are set up and tested
- [ ] SSL certificate is configured
- [ ] Domain is configured and DNS is updated
- [ ] Monitoring and logging are set up
- [ ] Backup strategy is in place

### Render.com Deployment

1. **Push to Repository:**
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

2. **Monitor Deployment:**
   - Check Render dashboard for deployment status
   - Review build logs for any errors
   - Verify service is running and healthy

3. **Post-Deployment Verification:**
   - Test all API endpoints
   - Verify webhook delivery
   - Test email notifications
   - Check admin dashboard functionality

### Docker Deployment

For containerized deployment:

1. **Build the image:**
```bash
docker build -t shopify-swym-relay .
```

2. **Run the container:**
```bash
docker run -p 3000:3000 \
  -e SHOPIFY_API_KEY=your_key \
  -e SHOPIFY_API_SECRET=your_secret \
  -e SHOPIFY_APP_URL=https://your-domain.com \
  shopify-swym-relay
```

3. **Deploy to container platform:**
   - Push to Docker Hub or container registry
   - Deploy to Kubernetes, AWS ECS, or similar platform

## Monitoring & Maintenance

### Application Monitoring

1. **Health Checks:**
   - Monitor the `/health` endpoint
   - Set up uptime monitoring (Pingdom, UptimeRobot)
   - Configure alerts for downtime

2. **Performance Monitoring:**
   - Monitor response times
   - Track memory and CPU usage
   - Monitor database performance

3. **Error Tracking:**
   - Implement error logging (Winston, Bunyan)
   - Set up error tracking (Sentry, Rollbar)
   - Monitor webhook delivery failures

### Log Management

Configure comprehensive logging:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Database Maintenance

If using a database:

1. **Regular Backups:**
   - Automated daily backups
   - Test backup restoration procedures
   - Store backups in multiple locations

2. **Performance Optimization:**
   - Monitor query performance
   - Optimize slow queries
   - Regular database maintenance

3. **Data Cleanup:**
   - Remove old notification records
   - Clean up inactive wishlists
   - Archive historical data

### Security Updates

1. **Dependency Updates:**
```bash
npm audit
npm update
```

2. **Security Patches:**
   - Monitor security advisories
   - Apply patches promptly
   - Test updates in staging environment

3. **Access Control:**
   - Regular access reviews
   - Rotate API keys and secrets
   - Monitor access logs

## Troubleshooting

### Common Issues

#### 1. Webhook Delivery Failures

**Symptoms:**
- Notifications not being sent
- Inventory updates not processed
- Webhook endpoint returning errors

**Solutions:**
- Verify webhook URLs are accessible
- Check HMAC signature verification
- Review webhook processing logs
- Test webhook endpoints manually

#### 2. Email Delivery Issues

**Symptoms:**
- Customers not receiving notifications
- Email service authentication errors
- SMTP connection failures

**Solutions:**
- Verify email service credentials
- Check spam/junk folders
- Test email configuration
- Review email service logs

#### 3. Shopify API Rate Limiting

**Symptoms:**
- API requests failing with 429 status
- Slow response times
- Timeout errors

**Solutions:**
- Implement request throttling
- Use API call limits efficiently
- Cache frequently accessed data
- Optimize API usage patterns

#### 4. Database Connection Issues

**Symptoms:**
- Application crashes on startup
- Data not persisting
- Connection timeout errors

**Solutions:**
- Verify database credentials
- Check network connectivity
- Monitor connection pool usage
- Implement connection retry logic

### Debug Mode

Enable debug mode for detailed logging:

```bash
NODE_ENV=development DEBUG=* npm run dev
```

### Log Analysis

Common log patterns to monitor:

```bash
# Monitor webhook processing
grep "webhook" logs/combined.log

# Check for errors
grep "ERROR" logs/error.log

# Monitor API usage
grep "API" logs/combined.log | grep -E "(GET|POST|PUT|DELETE)"
```

### Performance Debugging

1. **Memory Leaks:**
```bash
node --inspect server.js
```

2. **CPU Profiling:**
```bash
node --prof server.js
```

3. **Database Queries:**
   - Enable query logging
   - Monitor slow queries
   - Analyze query execution plans

## Contributing

We welcome contributions to improve the Shopify Swym Relay clone! Here's how to contribute:

### Development Setup

1. **Fork the repository**
2. **Clone your fork:**
```bash
git clone https://github.com/your-username/shopify-swym-relay.git
```

3. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

4. **Make your changes and test thoroughly**

5. **Submit a pull request with:**
   - Clear description of changes
   - Test results
   - Documentation updates

### Code Standards

- Follow ESLint configuration
- Write comprehensive tests
- Update documentation
- Use meaningful commit messages

### Reporting Issues

When reporting issues, include:
- Detailed description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Relevant log entries

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Author:** Manus AI  
**Version:** 1.0.0  
**Last Updated:** January 2024

For support and questions, please open an issue on the GitHub repository or contact the development team.


# Shopify Swym Relay - Complete Deployment Guide

This comprehensive guide covers all aspects of deploying your Shopify Swym Relay clone, from initial setup to production deployment on Render.com.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Shopify App Configuration](#shopify-app-configuration)
3. [Environment Setup](#environment-setup)
4. [Local Development](#local-development)
5. [Render.com Deployment](#rendercom-deployment)
6. [Shopify CLI Integration](#shopify-cli-integration)
7. [Webhook Configuration](#webhook-configuration)
8. [Testing & Verification](#testing--verification)
9. [Production Optimization](#production-optimization)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before beginning the deployment process, ensure you have completed the following prerequisites:

### Required Accounts & Services

- [ ] **Shopify Partner Account**: Create at [partners.shopify.com](https://partners.shopify.com)
- [ ] **Shopify Development Store**: Set up a test store for development
- [ ] **Render.com Account**: Sign up at [render.com](https://render.com)
- [ ] **GitHub/GitLab Account**: For code repository hosting
- [ ] **Email Service Account**: Gmail or other SMTP provider for notifications

### Development Environment

- [ ] **Node.js 16+**: Installed and verified (`node --version`)
- [ ] **npm 8+**: Package manager (`npm --version`)
- [ ] **Git**: Version control system
- [ ] **Code Editor**: VS Code or preferred editor
- [ ] **Postman/Insomnia**: For API testing (optional)

### Domain & SSL

- [ ] **Custom Domain**: Optional but recommended for production
- [ ] **SSL Certificate**: Automatically provided by Render.com
- [ ] **DNS Configuration**: If using custom domain

## Shopify App Configuration

### Step 1: Create Shopify Private App

1. **Access Shopify Admin:**
   - Log into your Shopify store admin panel
   - Navigate to Settings > Apps and sales channels
   - Click "Develop apps for your store"

2. **Create Private App:**
   - Click "Create an app"
   - Enter app name: "Swym Relay Clone"
   - Enter app URL: `https://your-app-name.onrender.com` (you'll get this after Render deployment)

3. **Configure App Scopes:**
   ```
   Products: read_products, write_products
   Customers: read_customers, write_customers
   Orders: read_orders, write_orders
   Inventory: read_inventory, write_inventory
   ```

4. **Generate API Credentials:**
   - Click "Create app"
   - Note down the API key and API secret key
   - Generate access token for Admin API

### Step 2: Configure OAuth Settings

1. **Allowed Redirection URLs:**
   ```
   https://your-app-name.onrender.com/auth/callback
   https://your-app-name.onrender.com/auth/shopify/callback
   ```

2. **App URL:**
   ```
   https://your-app-name.onrender.com
   ```

3. **Embedded App Settings:**
   - Enable "Embedded app"
   - Set frame ancestors to allow Shopify admin

## Environment Setup

### Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd shopify-swym-relay
npm install
```

### Step 2: Environment Variables

Create a `.env` file with the following configuration:

```env
# Shopify Configuration
SHOPIFY_API_KEY=your_api_key_from_shopify
SHOPIFY_API_SECRET=your_api_secret_from_shopify
SHOPIFY_SCOPES=read_products,write_products,read_customers,write_customers,read_orders,write_orders,read_inventory,write_inventory
SHOPIFY_APP_URL=https://your-app-name.onrender.com

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Security
WEBHOOK_SECRET=your-secure-random-string-here

# Database (optional - for persistent storage)
DATABASE_URL=your-database-connection-string
```

### Step 3: Gmail App Password Setup

For email notifications using Gmail:

1. **Enable 2-Factor Authentication:**
   - Go to Google Account settings
   - Security > 2-Step Verification
   - Enable 2FA

2. **Generate App Password:**
   - Security > App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password
   - Use this as `EMAIL_PASS` in your environment variables

## Local Development

### Step 1: Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### Step 2: Test Core Functionality

1. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Admin Dashboard:**
   - Open `http://localhost:3000/admin`
   - Verify all sections load correctly

3. **API Endpoints:**
   ```bash
   # Test wishlist creation
   curl -X POST http://localhost:3000/api/wishlist/create \
     -H "Content-Type: application/json" \
     -d '{"customerId": "test123", "name": "Test Wishlist"}' \
     -G -d "shop=your-shop.myshopify.com"
   ```

### Step 3: Local Webhook Testing

For testing webhooks locally, use ngrok:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Expose local server:**
   ```bash
   ngrok http 3000
   ```

3. **Update webhook URLs:**
   Use the ngrok URL (e.g., `https://abc123.ngrok.io`) for webhook endpoints

## Render.com Deployment

### Step 1: Prepare Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify package.json:**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "build": "echo 'No build step required'",
       "dev": "nodemon server.js"
     },
     "engines": {
       "node": ">=16.0.0",
       "npm": ">=8.0.0"
     }
   }
   ```

### Step 2: Create Render Service

1. **Connect Repository:**
   - Log into Render.com
   - Click "New +" > "Web Service"
   - Connect your GitHub/GitLab repository
   - Select the repository and branch (main)

2. **Configure Service:**
   ```
   Name: shopify-swym-relay
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Starter (or higher based on needs)
   ```

3. **Advanced Settings:**
   ```
   Auto-Deploy: Yes
   Health Check Path: /health
   ```

### Step 3: Environment Variables

Configure the following environment variables in Render:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Render default |
| `SHOPIFY_API_KEY` | Your API key | From Shopify app |
| `SHOPIFY_API_SECRET` | Your API secret | From Shopify app |
| `SHOPIFY_SCOPES` | `read_products,write_products,read_customers,write_customers,read_orders,write_orders` | Required permissions |
| `SHOPIFY_APP_URL` | `https://your-service-name.onrender.com` | Your Render URL |
| `EMAIL_SERVICE` | `gmail` | Or your email provider |
| `EMAIL_USER` | `your-email@gmail.com` | Email for notifications |
| `EMAIL_PASS` | `your-app-password` | Gmail app password |
| `WEBHOOK_SECRET` | `your-secure-secret` | Random secure string |

### Step 4: Deploy and Monitor

1. **Trigger Deployment:**
   - Render will automatically deploy when you push to the connected branch
   - Monitor the deployment logs in the Render dashboard

2. **Verify Deployment:**
   - Check that the service starts successfully
   - Visit your app URL to ensure it's accessible
   - Test the health endpoint

3. **Check Logs:**
   - Monitor application logs for any errors
   - Verify all services are connecting properly

## Shopify CLI Integration

For advanced Shopify integration using the CLI:

### Step 1: Install Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
```

### Step 2: Initialize Shopify App

```bash
shopify app init
```

Follow the prompts:
- Framework: Node.js
- Package manager: npm
- Template: Express

### Step 3: Configure shopify.app.toml

```toml
# Learn more about configuring your app at https://shopify.dev/docs/apps/tools/cli/configuration

name = "swym-relay-clone"
client_id = "your_client_id"
application_url = "https://your-app-name.onrender.com"
embedded = true

[access_scopes]
scopes = "read_products,write_products,read_customers,write_customers,read_orders,write_orders"

[auth]
redirect_urls = [
  "https://your-app-name.onrender.com/auth/callback"
]

[webhooks]
api_version = "2023-10"

  [[webhooks.subscriptions]]
  topics = [ "products/update" ]
  uri = "https://your-app-name.onrender.com/webhooks/products/update"

  [[webhooks.subscriptions]]
  topics = [ "inventory_levels/update" ]
  uri = "https://your-app-name.onrender.com/webhooks/inventory_levels/update"

  [[webhooks.subscriptions]]
  topics = [ "orders/create" ]
  uri = "https://your-app-name.onrender.com/webhooks/orders/create"

  [[webhooks.subscriptions]]
  topics = [ "app/uninstalled" ]
  uri = "https://your-app-name.onrender.com/webhooks/app/uninstalled"
```

### Step 4: Deploy with CLI

```bash
shopify app deploy
```

This will:
- Build and deploy your app
- Configure webhooks automatically
- Provide installation URLs

## Webhook Configuration

### Step 1: Automatic Webhook Setup

Use the provided API endpoint to set up all required webhooks:

```bash
curl -X POST \
  "https://your-app-name.onrender.com/api/shopify/webhooks/setup?shop=your-shop.myshopify.com" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-access-token"
```

### Step 2: Manual Webhook Setup

If automatic setup fails, create webhooks manually:

```bash
# Product updates
curl -X POST \
  https://your-shop.myshopify.com/admin/api/2023-10/webhooks.json \
  -H 'X-Shopify-Access-Token: your_access_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "webhook": {
      "topic": "products/update",
      "address": "https://your-app-name.onrender.com/webhooks/products/update",
      "format": "json"
    }
  }'

# Inventory updates
curl -X POST \
  https://your-shop.myshopify.com/admin/api/2023-10/webhooks.json \
  -H 'X-Shopify-Access-Token: your_access_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "webhook": {
      "topic": "inventory_levels/update",
      "address": "https://your-app-name.onrender.com/webhooks/inventory_levels/update",
      "format": "json"
    }
  }'

# Order creation
curl -X POST \
  https://your-shop.myshopify.com/admin/api/2023-10/webhooks.json \
  -H 'X-Shopify-Access-Token: your_access_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "webhook": {
      "topic": "orders/create",
      "address": "https://your-app-name.onrender.com/webhooks/orders/create",
      "format": "json"
    }
  }'

# App uninstall
curl -X POST \
  https://your-shop.myshopify.com/admin/api/2023-10/webhooks.json \
  -H 'X-Shopify-Access-Token: your_access_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "webhook": {
      "topic": "app/uninstalled",
      "address": "https://your-app-name.onrender.com/webhooks/app/uninstalled",
      "format": "json"
    }
  }'
```

### Step 3: Verify Webhook Setup

```bash
# List all webhooks
curl -X GET \
  https://your-shop.myshopify.com/admin/api/2023-10/webhooks.json \
  -H 'X-Shopify-Access-Token: your_access_token'
```

## Testing & Verification

### Step 1: Functional Testing

1. **API Endpoints:**
   ```bash
   # Health check
   curl https://your-app-name.onrender.com/health
   
   # Wishlist creation
   curl -X POST https://your-app-name.onrender.com/api/wishlist/create \
     -H "Content-Type: application/json" \
     -d '{"customerId": "test123", "name": "Test Wishlist"}' \
     -G -d "shop=your-shop.myshopify.com"
   ```

2. **Admin Dashboard:**
   - Visit `https://your-app-name.onrender.com/admin`
   - Test all dashboard sections
   - Verify data loading and interactions

3. **Webhook Endpoints:**
   ```bash
   # Test product update webhook
   curl -X POST https://your-app-name.onrender.com/webhooks/products/update \
     -H "Content-Type: application/json" \
     -H "X-Shopify-Shop-Domain: your-shop.myshopify.com" \
     -d '{"id": 123, "title": "Test Product", "variants": [{"id": 456, "inventory_quantity": 10}]}'
   ```

### Step 2: Integration Testing

1. **Shopify Integration:**
   - Create a test product in your Shopify store
   - Update the product and verify webhook delivery
   - Test inventory changes and notifications

2. **Email Notifications:**
   - Subscribe to product notifications
   - Trigger back-in-stock or price drop events
   - Verify email delivery and content

3. **Frontend Widget:**
   - Install the widget on a test theme
   - Test wishlist functionality
   - Verify responsive design

### Step 3: Performance Testing

1. **Load Testing:**
   ```bash
   # Install Apache Bench
   sudo apt-get install apache2-utils
   
   # Test concurrent requests
   ab -n 1000 -c 10 https://your-app-name.onrender.com/health
   ```

2. **Memory Usage:**
   - Monitor memory usage in Render dashboard
   - Check for memory leaks during extended operation

3. **Response Times:**
   - Monitor API response times
   - Optimize slow endpoints

## Production Optimization

### Step 1: Performance Optimization

1. **Enable Compression:**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Caching Headers:**
   ```javascript
   app.use('/static', express.static('public', {
     maxAge: '1d',
     etag: false
   }));
   ```

3. **Database Optimization:**
   - Implement connection pooling
   - Add database indexes
   - Optimize queries

### Step 2: Security Hardening

1. **Rate Limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

2. **Input Validation:**
   ```javascript
   const { body, validationResult } = require('express-validator');
   
   app.post('/api/wishlist/create',
     body('customerId').isLength({ min: 1 }).trim().escape(),
     body('name').isLength({ min: 1, max: 100 }).trim().escape(),
     (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
       }
       // Process request
     }
   );
   ```

3. **HTTPS Enforcement:**
   ```javascript
   app.use((req, res, next) => {
     if (req.header('x-forwarded-proto') !== 'https') {
       res.redirect(`https://${req.header('host')}${req.url}`);
     } else {
       next();
     }
   });
   ```

### Step 3: Monitoring Setup

1. **Application Monitoring:**
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
       new winston.transports.Console(),
       new winston.transports.File({ filename: 'app.log' })
     ]
   });
   ```

2. **Health Monitoring:**
   ```javascript
   app.get('/health', (req, res) => {
     const healthcheck = {
       uptime: process.uptime(),
       message: 'OK',
       timestamp: Date.now(),
       memory: process.memoryUsage(),
       environment: process.env.NODE_ENV
     };
     
     res.status(200).json(healthcheck);
   });
   ```

3. **Error Tracking:**
   - Implement error tracking service (Sentry, Rollbar)
   - Set up alerts for critical errors
   - Monitor webhook delivery failures

## Monitoring & Maintenance

### Step 1: Uptime Monitoring

1. **Set up monitoring service:**
   - UptimeRobot, Pingdom, or similar
   - Monitor main app URL and health endpoint
   - Configure alerts for downtime

2. **Monitor key endpoints:**
   ```
   https://your-app-name.onrender.com/health
   https://your-app-name.onrender.com/admin
   https://your-app-name.onrender.com/api/wishlist/health
   ```

### Step 2: Performance Monitoring

1. **Response Time Monitoring:**
   - Set up alerts for slow response times (>2 seconds)
   - Monitor database query performance
   - Track API endpoint performance

2. **Resource Usage:**
   - Monitor CPU and memory usage
   - Set up alerts for high resource usage
   - Plan for scaling when needed

### Step 3: Log Management

1. **Centralized Logging:**
   ```javascript
   // Configure structured logging
   const logger = winston.createLogger({
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     transports: [
       new winston.transports.Console(),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

2. **Log Analysis:**
   - Monitor error rates
   - Track webhook processing success/failure
   - Analyze user behavior patterns

### Step 4: Regular Maintenance

1. **Dependency Updates:**
   ```bash
   # Check for outdated packages
   npm outdated
   
   # Update packages
   npm update
   
   # Security audit
   npm audit
   npm audit fix
   ```

2. **Database Maintenance:**
   - Regular backups
   - Clean up old data
   - Optimize database performance

3. **Security Updates:**
   - Monitor security advisories
   - Update dependencies promptly
   - Review access logs regularly

## Troubleshooting

### Common Deployment Issues

#### 1. Build Failures

**Symptoms:**
- Deployment fails during build phase
- Missing dependencies errors
- Node version conflicts

**Solutions:**
```bash
# Verify Node version in package.json
{
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Environment Variable Issues

**Symptoms:**
- App crashes on startup
- "undefined" values in configuration
- Authentication failures

**Solutions:**
- Verify all required environment variables are set in Render
- Check for typos in variable names
- Ensure sensitive values are properly escaped
- Test locally with same environment variables

#### 3. Webhook Delivery Failures

**Symptoms:**
- Webhooks not being received
- 404 or 500 errors on webhook endpoints
- HMAC verification failures

**Solutions:**
```bash
# Test webhook endpoint manually
curl -X POST https://your-app-name.onrender.com/webhooks/verify \
  -H "Content-Type: application/json"

# Check webhook configuration in Shopify
curl -X GET \
  https://your-shop.myshopify.com/admin/api/2023-10/webhooks.json \
  -H 'X-Shopify-Access-Token: your_access_token'

# Verify HMAC signature implementation
# Ensure webhook secret matches between Shopify and your app
```

#### 4. Database Connection Issues

**Symptoms:**
- App crashes when accessing data
- Connection timeout errors
- Data not persisting

**Solutions:**
- Verify database URL format
- Check network connectivity
- Implement connection retry logic
- Monitor connection pool usage

#### 5. Email Delivery Problems

**Symptoms:**
- Notifications not being sent
- SMTP authentication errors
- Emails going to spam

**Solutions:**
```javascript
// Test email configuration
const nodemailer = require('nodemailer');

const testEmailConfig = async () => {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('Email configuration is valid');
  } catch (error) {
    console.error('Email configuration error:', error);
  }
};
```

### Performance Issues

#### 1. Slow Response Times

**Diagnosis:**
```bash
# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-app-name.onrender.com/health

# Create curl-format.txt:
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

**Solutions:**
- Implement caching for frequently accessed data
- Optimize database queries
- Use connection pooling
- Consider upgrading Render plan

#### 2. Memory Leaks

**Diagnosis:**
```javascript
// Monitor memory usage
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100 + ' MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100 + ' MB'
  });
}, 30000);
```

**Solutions:**
- Review event listeners for proper cleanup
- Implement proper connection closing
- Use weak references where appropriate
- Profile application with Node.js inspector

### Recovery Procedures

#### 1. Service Recovery

```bash
# Force restart service in Render
# Use Render dashboard or API

# Check service logs
# Monitor for startup errors

# Verify environment variables
# Ensure all required variables are set

# Test critical endpoints
curl https://your-app-name.onrender.com/health
```

#### 2. Data Recovery

```bash
# If using database, restore from backup
# Verify data integrity after restoration

# Re-sync with Shopify if needed
# Fetch latest product and customer data

# Verify webhook subscriptions
# Re-create webhooks if necessary
```

#### 3. Rollback Procedures

```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

### Support Resources

1. **Render.com Documentation:**
   - [Render Docs](https://render.com/docs)
   - [Node.js Deployment Guide](https://render.com/docs/deploy-node-express-app)

2. **Shopify Developer Resources:**
   - [Shopify API Documentation](https://shopify.dev/api)
   - [Webhook Documentation](https://shopify.dev/api/admin-rest/2023-10/resources/webhook)

3. **Community Support:**
   - Shopify Developer Community
   - Stack Overflow
   - GitHub Issues

---

This deployment guide provides comprehensive instructions for successfully deploying your Shopify Swym Relay clone. Follow each section carefully and test thoroughly at each step to ensure a smooth deployment process.


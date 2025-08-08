const axios = require('axios');

class ShopifyService {
    constructor(shop, accessToken) {
        this.shop = shop;
        this.accessToken = accessToken;
        this.baseURL = `https://${shop}.myshopify.com/admin/api/2023-10`;
    }

    // Get headers for API requests
    getHeaders() {
        return {
            'X-Shopify-Access-Token': this.accessToken,
            'Content-Type': 'application/json'
        };
    }

    // Get product by ID
    async getProduct(productId) {
        try {
            const response = await axios.get(
                `${this.baseURL}/products/${productId}.json`,
                { headers: this.getHeaders() }
            );
            return response.data.product;
        } catch (error) {
            console.error('Error fetching product:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get multiple products
    async getProducts(productIds) {
        try {
            const idsQuery = productIds.join(',');
            const response = await axios.get(
                `${this.baseURL}/products.json?ids=${idsQuery}`,
                { headers: this.getHeaders() }
            );
            return response.data.products;
        } catch (error) {
            console.error('Error fetching products:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get customer by ID
    async getCustomer(customerId) {
        try {
            const response = await axios.get(
                `${this.baseURL}/customers/${customerId}.json`,
                { headers: this.getHeaders() }
            );
            return response.data.customer;
        } catch (error) {
            console.error('Error fetching customer:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get product variant
    async getVariant(variantId) {
        try {
            const response = await axios.get(
                `${this.baseURL}/variants/${variantId}.json`,
                { headers: this.getHeaders() }
            );
            return response.data.variant;
        } catch (error) {
            console.error('Error fetching variant:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get inventory levels for a location
    async getInventoryLevels(locationId, inventoryItemIds) {
        try {
            const idsQuery = inventoryItemIds.join(',');
            const response = await axios.get(
                `${this.baseURL}/inventory_levels.json?location_ids=${locationId}&inventory_item_ids=${idsQuery}`,
                { headers: this.getHeaders() }
            );
            return response.data.inventory_levels;
        } catch (error) {
            console.error('Error fetching inventory levels:', error.response?.data || error.message);
            throw error;
        }
    }

    // Create a webhook
    async createWebhook(topic, address) {
        try {
            const webhook = {
                webhook: {
                    topic: topic,
                    address: address,
                    format: 'json'
                }
            };

            const response = await axios.post(
                `${this.baseURL}/webhooks.json`,
                webhook,
                { headers: this.getHeaders() }
            );
            return response.data.webhook;
        } catch (error) {
            console.error('Error creating webhook:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get all webhooks
    async getWebhooks() {
        try {
            const response = await axios.get(
                `${this.baseURL}/webhooks.json`,
                { headers: this.getHeaders() }
            );
            return response.data.webhooks;
        } catch (error) {
            console.error('Error fetching webhooks:', error.response?.data || error.message);
            throw error;
        }
    }

    // Delete a webhook
    async deleteWebhook(webhookId) {
        try {
            await axios.delete(
                `${this.baseURL}/webhooks/${webhookId}.json`,
                { headers: this.getHeaders() }
            );
            return true;
        } catch (error) {
            console.error('Error deleting webhook:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get shop information
    async getShop() {
        try {
            const response = await axios.get(
                `${this.baseURL}/shop.json`,
                { headers: this.getHeaders() }
            );
            return response.data.shop;
        } catch (error) {
            console.error('Error fetching shop info:', error.response?.data || error.message);
            throw error;
        }
    }

    // Search products
    async searchProducts(query, limit = 50) {
        try {
            const response = await axios.get(
                `${this.baseURL}/products.json?title=${encodeURIComponent(query)}&limit=${limit}`,
                { headers: this.getHeaders() }
            );
            return response.data.products;
        } catch (error) {
            console.error('Error searching products:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = ShopifyService;


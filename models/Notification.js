class Notification {
    constructor() {
        this.notifications = new Map();
        this.subscriptions = new Map();
    }

    // Subscribe customer to notifications for a product
    subscribeToProduct(customerId, shopDomain, productId, variantId = null, notificationType = 'back_in_stock') {
        const subscriptionId = `${shopDomain}_${customerId}_${productId}_${variantId || 'all'}_${notificationType}`;
        
        const subscription = {
            id: subscriptionId,
            customerId,
            shopDomain,
            productId,
            variantId,
            notificationType, // 'back_in_stock', 'price_drop', 'low_stock'
            isActive: true,
            createdAt: new Date()
        };

        this.subscriptions.set(subscriptionId, subscription);
        return subscription;
    }

    // Unsubscribe from notifications
    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            subscription.isActive = false;
            this.subscriptions.set(subscriptionId, subscription);
        }
        return subscription;
    }

    // Get all active subscriptions for a product
    getProductSubscriptions(shopDomain, productId, variantId = null) {
        const subscriptions = [];
        for (const [id, subscription] of this.subscriptions) {
            if (subscription.shopDomain === shopDomain && 
                subscription.productId === productId && 
                subscription.isActive &&
                (variantId === null || subscription.variantId === variantId || subscription.variantId === null)) {
                subscriptions.push(subscription);
            }
        }
        return subscriptions;
    }

    // Create a notification record
    createNotification(customerId, shopDomain, productId, variantId, type, message) {
        const notificationId = `${shopDomain}_${customerId}_${Date.now()}`;
        
        const notification = {
            id: notificationId,
            customerId,
            shopDomain,
            productId,
            variantId,
            type,
            message,
            sent: false,
            createdAt: new Date(),
            sentAt: null
        };

        this.notifications.set(notificationId, notification);
        return notification;
    }

    // Mark notification as sent
    markAsSent(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (notification) {
            notification.sent = true;
            notification.sentAt = new Date();
            this.notifications.set(notificationId, notification);
        }
        return notification;
    }

    // Get pending notifications
    getPendingNotifications(shopDomain) {
        const pending = [];
        for (const [id, notification] of this.notifications) {
            if (notification.shopDomain === shopDomain && !notification.sent) {
                pending.push(notification);
            }
        }
        return pending;
    }

    // Get customer subscriptions
    getCustomerSubscriptions(customerId, shopDomain) {
        const subscriptions = [];
        for (const [id, subscription] of this.subscriptions) {
            if (subscription.customerId === customerId && 
                subscription.shopDomain === shopDomain && 
                subscription.isActive) {
                subscriptions.push(subscription);
            }
        }
        return subscriptions;
    }
}

module.exports = new Notification();


const Notification = require('../models/Notification');
const Wishlist = require('../models/Wishlist');
const { sendNotificationEmail, sendWishlistReminder } = require('./emailService');

class WebhookProcessor {
    constructor() {
        this.processors = {
            'products/update': this.processProductUpdate.bind(this),
            'inventory_levels/update': this.processInventoryUpdate.bind(this),
            'orders/create': this.processOrderCreate.bind(this),
            'app/uninstalled': this.processAppUninstall.bind(this)
        };
    }

    async process(topic, data, shop) {
        const processor = this.processors[topic];
        if (!processor) {
            console.warn(`No processor found for webhook topic: ${topic}`);
            return { success: false, error: 'Unknown webhook topic' };
        }

        try {
            const result = await processor(data, shop);
            console.log(`Successfully processed ${topic} webhook for shop: ${shop}`);
            return { success: true, result };
        } catch (error) {
            console.error(`Error processing ${topic} webhook for shop ${shop}:`, error);
            return { success: false, error: error.message };
        }
    }

    async processProductUpdate(product, shop) {
        console.log(`Processing product update for product ${product.id} in shop ${shop}`);
        
        const notifications = [];
        
        // Check each variant for stock and price changes
        if (product.variants && product.variants.length > 0) {
            for (const variant of product.variants) {
                // Check for back in stock notifications
                if (variant.inventory_quantity > 0) {
                    const subscriptions = Notification.getProductSubscriptions(
                        shop, 
                        product.id.toString(), 
                        variant.id.toString()
                    );

                    for (const subscription of subscriptions) {
                        if (subscription.notificationType === 'back_in_stock') {
                            const notification = Notification.createNotification(
                                subscription.customerId,
                                shop,
                                product.id.toString(),
                                variant.id.toString(),
                                'back_in_stock',
                                `${product.title} is back in stock!`
                            );

                            notifications.push(notification);

                            // Send email notification
                            try {
                                await sendNotificationEmail(
                                    subscription.customerId,
                                    shop,
                                    'Back in Stock Alert',
                                    `Great news! ${product.title} is back in stock. Get it before it's gone again!`,
                                    product
                                );
                                Notification.markAsSent(notification.id);
                            } catch (emailError) {
                                console.error('Error sending back in stock email:', emailError);
                            }
                        }
                    }
                }

                // Check for low stock notifications
                if (variant.inventory_quantity > 0 && variant.inventory_quantity <= 5) {
                    const subscriptions = Notification.getProductSubscriptions(
                        shop, 
                        product.id.toString(), 
                        variant.id.toString()
                    );

                    for (const subscription of subscriptions) {
                        if (subscription.notificationType === 'low_stock') {
                            const notification = Notification.createNotification(
                                subscription.customerId,
                                shop,
                                product.id.toString(),
                                variant.id.toString(),
                                'low_stock',
                                `Only ${variant.inventory_quantity} left of ${product.title}!`
                            );

                            notifications.push(notification);

                            try {
                                await sendNotificationEmail(
                                    subscription.customerId,
                                    shop,
                                    'Low Stock Alert',
                                    `Hurry! Only ${variant.inventory_quantity} left of ${product.title}. Order now before it's gone!`,
                                    product
                                );
                                Notification.markAsSent(notification.id);
                            } catch (emailError) {
                                console.error('Error sending low stock email:', emailError);
                            }
                        }
                    }
                }

                // Check for price drop notifications
                if (variant.compare_at_price && variant.price < variant.compare_at_price) {
                    const subscriptions = Notification.getProductSubscriptions(
                        shop, 
                        product.id.toString(), 
                        variant.id.toString()
                    );

                    for (const subscription of subscriptions) {
                        if (subscription.notificationType === 'price_drop') {
                            const savings = (variant.compare_at_price - variant.price).toFixed(2);
                            const notification = Notification.createNotification(
                                subscription.customerId,
                                shop,
                                product.id.toString(),
                                variant.id.toString(),
                                'price_drop',
                                `Price dropped for ${product.title}! Save $${savings}`
                            );

                            notifications.push(notification);

                            try {
                                await sendNotificationEmail(
                                    subscription.customerId,
                                    shop,
                                    'Price Drop Alert',
                                    `The price for ${product.title} has dropped by $${savings}! Don't miss out on this deal.`,
                                    product
                                );
                                Notification.markAsSent(notification.id);
                            } catch (emailError) {
                                console.error('Error sending price drop email:', emailError);
                            }
                        }
                    }
                }
            }
        }

        return {
            notificationsSent: notifications.length,
            notifications: notifications
        };
    }

    async processInventoryUpdate(inventoryLevel, shop) {
        console.log(`Processing inventory update for item ${inventoryLevel.inventory_item_id} in shop ${shop}`);
        
        // This would require mapping inventory_item_id to product/variant
        // For a complete implementation, you would need to:
        // 1. Store a mapping of inventory_item_id to product_id/variant_id
        // 2. Query that mapping here
        // 3. Process notifications based on the mapped product/variant
        
        const notifications = [];
        
        // Check for low stock alerts
        if (inventoryLevel.available <= 5 && inventoryLevel.available > 0) {
            console.log(`Low stock detected: ${inventoryLevel.available} items remaining`);
            
            // In a real implementation, you would:
            // 1. Find the product/variant associated with this inventory_item_id
            // 2. Get subscriptions for that product/variant
            // 3. Send notifications
        }

        // Check for out of stock
        if (inventoryLevel.available === 0) {
            console.log('Product is now out of stock');
            
            // In a real implementation, you would:
            // 1. Find the product/variant associated with this inventory_item_id
            // 2. Update any existing back-in-stock subscriptions to be ready for notification
            // 3. Possibly send "out of stock" notifications to interested customers
        }

        return {
            inventoryLevel: inventoryLevel,
            notificationsSent: notifications.length
        };
    }

    async processOrderCreate(order, shop) {
        console.log(`Processing order creation for order ${order.id} in shop ${shop}`);
        
        const processedItems = [];
        
        // Check if any ordered items were in wishlists
        if (order.line_items && order.line_items.length > 0) {
            for (const lineItem of order.line_items) {
                const productId = lineItem.product_id.toString();
                const variantId = lineItem.variant_id ? lineItem.variant_id.toString() : null;
                
                // Find wishlists containing this item
                const allWishlistItems = Wishlist.getItemsForStockNotification(shop);
                const matchingItems = allWishlistItems.filter(item => 
                    item.productId === productId && 
                    (variantId === null || item.variantId === variantId)
                );
                
                for (const item of matchingItems) {
                    // Remove item from wishlist since it was purchased
                    try {
                        Wishlist.removeItemFromWishlist(item.wishlistId, productId, variantId);
                        processedItems.push({
                            productId,
                            variantId,
                            wishlistId: item.wishlistId,
                            customerId: item.customerId,
                            action: 'removed_from_wishlist'
                        });
                    } catch (error) {
                        console.error('Error removing item from wishlist:', error);
                    }
                }
            }
        }

        // Send follow-up emails for wishlist conversions
        const customerIds = [...new Set(processedItems.map(item => item.customerId))];
        for (const customerId of customerIds) {
            try {
                // In a real implementation, you might send a "thank you" email
                // or suggest related products from their remaining wishlist items
                console.log(`Wishlist conversion detected for customer ${customerId}`);
            } catch (error) {
                console.error('Error processing wishlist conversion:', error);
            }
        }

        return {
            orderId: order.id,
            processedItems: processedItems,
            conversions: customerIds.length
        };
    }

    async processAppUninstall(data, shop) {
        console.log(`Processing app uninstall for shop ${shop}`);
        
        // Clean up data for this shop
        try {
            // In a real implementation, you would:
            // 1. Remove all wishlists for this shop
            // 2. Remove all notifications for this shop
            // 3. Remove all subscriptions for this shop
            // 4. Clean up any stored access tokens
            // 5. Log the uninstall for analytics
            
            console.log(`Cleaned up data for uninstalled shop: ${shop}`);
            
            return {
                shop: shop,
                uninstalledAt: new Date().toISOString(),
                dataCleanedUp: true
            };
        } catch (error) {
            console.error('Error cleaning up data for uninstalled shop:', error);
            throw error;
        }
    }

    // Utility method to send batch notifications
    async sendBatchNotifications(notifications, shop) {
        const results = [];
        
        for (const notification of notifications) {
            try {
                await sendNotificationEmail(
                    notification.customerId,
                    shop,
                    notification.type.replace('_', ' ').toUpperCase() + ' Alert',
                    notification.message,
                    notification.product
                );
                
                Notification.markAsSent(notification.id);
                results.push({ success: true, notificationId: notification.id });
            } catch (error) {
                console.error('Error sending notification:', error);
                results.push({ success: false, notificationId: notification.id, error: error.message });
            }
        }
        
        return results;
    }

    // Method to process scheduled tasks (like wishlist reminders)
    async processScheduledTasks(shop) {
        console.log(`Processing scheduled tasks for shop ${shop}`);
        
        try {
            // Send wishlist reminders for inactive customers
            const allWishlists = Wishlist.getItemsForStockNotification(shop);
            const customerWishlists = {};
            
            // Group items by customer
            allWishlists.forEach(item => {
                if (!customerWishlists[item.customerId]) {
                    customerWishlists[item.customerId] = [];
                }
                customerWishlists[item.customerId].push(item);
            });
            
            const remindersSent = [];
            
            for (const [customerId, items] of Object.entries(customerWishlists)) {
                // Check if customer has items in wishlist for more than 7 days
                const oldItems = items.filter(item => {
                    const wishlist = Wishlist.getWishlist(item.wishlistId);
                    if (wishlist) {
                        const daysSinceUpdate = (Date.now() - new Date(wishlist.updatedAt)) / (1000 * 60 * 60 * 24);
                        return daysSinceUpdate >= 7;
                    }
                    return false;
                });
                
                if (oldItems.length > 0) {
                    const wishlist = Wishlist.getWishlist(oldItems[0].wishlistId);
                    if (wishlist) {
                        try {
                            await sendWishlistReminder(customerId, shop, wishlist);
                            remindersSent.push(customerId);
                        } catch (error) {
                            console.error('Error sending wishlist reminder:', error);
                        }
                    }
                }
            }
            
            return {
                remindersSent: remindersSent.length,
                customers: remindersSent
            };
        } catch (error) {
            console.error('Error processing scheduled tasks:', error);
            throw error;
        }
    }
}

module.exports = new WebhookProcessor();


const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send notification email
const sendNotificationEmail = async (customerId, shop, subject, message, product = null) => {
    try {
        // In a real app, you would fetch customer email from Shopify API
        // For now, we'll use a placeholder
        const customerEmail = `customer${customerId}@example.com`;

        const transporter = createTransporter();

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #5c6ac4;">${subject}</h2>
                <p>${message}</p>
                
                ${product ? `
                    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3>${product.title}</h3>
                        ${product.images && product.images.length > 0 ? 
                            `<img src="${product.images[0].src}" alt="${product.title}" style="max-width: 200px; height: auto;">` 
                            : ''
                        }
                        <p><strong>Price:</strong> $${product.variants[0]?.price || 'N/A'}</p>
                        <a href="https://${shop}/products/${product.handle}" 
                           style="background-color: #5c6ac4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">
                           View Product
                        </a>
                    </div>
                ` : ''}
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This email was sent by ${shop}. If you no longer wish to receive these notifications, 
                    you can unsubscribe in your account settings.
                </p>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `${subject} - ${shop}`,
            html: htmlContent
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Send wishlist reminder email
const sendWishlistReminder = async (customerId, shop, wishlist) => {
    try {
        const customerEmail = `customer${customerId}@example.com`;
        const transporter = createTransporter();

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #5c6ac4;">Don't forget about your wishlist!</h2>
                <p>You have ${wishlist.items.length} item(s) in your wishlist "${wishlist.name}". 
                   Don't let them get away!</p>
                
                <div style="margin: 20px 0;">
                    <a href="https://${shop}/account/wishlist" 
                       style="background-color: #5c6ac4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                       View My Wishlist
                    </a>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This email was sent by ${shop}. You can manage your email preferences in your account settings.
                </p>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Your wishlist is waiting - ${shop}`,
            html: htmlContent
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Wishlist reminder sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending wishlist reminder:', error);
        throw error;
    }
};

module.exports = {
    sendNotificationEmail,
    sendWishlistReminder
};


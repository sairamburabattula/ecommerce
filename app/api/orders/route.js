import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const storeId = searchParams.get('storeId');

        let query = `
            SELECT o.*, 
                   a.name as addressName, a.street, a.city, a.state, a.zip, a.country, a.phone,
                   u.name as buyerName, u.email as buyerEmail,
                   s.name as storeName, s.username as storeUsername
            FROM orders o
            LEFT JOIN addresses a ON o.addressId = a.id
            LEFT JOIN users u ON o.userId = u.id
            LEFT JOIN stores s ON o.storeId = s.id
            WHERE 1=1
        `;
        const params = [];

        if (userId) {
            query += ' AND o.userId = ?';
            params.push(userId);
        }

        if (storeId) {
            query += ' AND o.storeId = ?';
            params.push(storeId);
        }

        query += ' ORDER BY o.createdAt DESC';

        const orders = db.prepare(query).all(...params);

        // Fetch all order items and their products
        const orderItems = db.prepare(`
            SELECT oi.*, p.name as productName, p.images as productImages, p.category as productCategory
            FROM order_items oi
            LEFT JOIN products p ON oi.productId = p.id
        `).all();

        const formatted = orders.map(ord => {
            const items = orderItems.filter(oi => oi.orderId === ord.id).map(oi => {
                let images = [];
                try {
                    images = JSON.parse(oi.productImages || '[]');
                } catch (e) {
                    images = [oi.productImages];
                }
                return {
                    orderId: oi.orderId,
                    productId: oi.productId,
                    quantity: oi.quantity,
                    price: Number(oi.price),
                    product: {
                        id: oi.productId,
                        name: oi.productName || 'Product',
                        category: oi.productCategory || 'General',
                        images: images.length > 0 ? images : ['/assets/product_img1.png']
                    }
                };
            });

            let couponObj = {};
            try {
                couponObj = JSON.parse(ord.coupon || '{}');
            } catch (e) {}

            return {
                id: ord.id,
                total: Number(ord.total),
                status: ord.status,
                userId: ord.userId,
                storeId: ord.storeId,
                addressId: ord.addressId,
                isPaid: Boolean(ord.isPaid),
                paymentMethod: ord.paymentMethod,
                isCouponUsed: Boolean(ord.isCouponUsed),
                coupon: couponObj,
                createdAt: ord.createdAt,
                updatedAt: ord.updatedAt,
                orderItems: items,
                address: {
                    name: ord.addressName || 'Customer',
                    street: ord.street || '',
                    city: ord.city || '',
                    state: ord.state || '',
                    zip: ord.zip || '',
                    country: ord.country || '',
                    phone: ord.phone || ''
                },
                user: {
                    name: ord.buyerName || 'Customer',
                    email: ord.buyerEmail || ''
                },
                store: {
                    name: ord.storeName || 'Happy Shop',
                    username: ord.storeUsername || 'happyshop'
                }
            };
        });

        return NextResponse.json({ success: true, orders: formatted });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { items, addressId, paymentMethod, coupon, userId } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Cart items cannot be empty' }, { status: 400 });
        }

        const buyerId = userId || 'user_customer';
        const method = paymentMethod || 'COD';
        const isPaid = method === 'STRIPE' ? 1 : 0;

        // Group items by storeId if multiple, or assign to store
        // For simplicity and multi-vendor consistency, create order
        const orderId = 'ord_' + Date.now();

        let subtotal = 0;
        let defaultStoreId = 'store_1';

        for (const item of items) {
            subtotal += Number(item.price) * Number(item.quantity);
            if (item.storeId) {
                defaultStoreId = item.storeId;
            }
        }

        let discount = 0;
        let couponData = '{}';
        let isCouponUsed = 0;

        if (coupon && coupon.discount) {
            discount = (subtotal * Number(coupon.discount)) / 100;
            couponData = JSON.stringify(coupon);
            isCouponUsed = 1;
        }

        const total = Math.max(0, subtotal - discount);

        const insertOrder = db.prepare(`
            INSERT INTO orders (id, total, status, userId, storeId, addressId, isPaid, paymentMethod, isCouponUsed, coupon)
            VALUES (?, ?, 'ORDER_PLACED', ?, ?, ?, ?, ?, ?, ?)
        `);

        insertOrder.run(
            orderId,
            total,
            buyerId,
            defaultStoreId,
            addressId || 'addr_1',
            isPaid,
            method,
            isCouponUsed,
            couponData
        );

        const insertItem = db.prepare(`
            INSERT INTO order_items (orderId, productId, quantity, price)
            VALUES (?, ?, ?, ?)
        `);

        for (const item of items) {
            insertItem.run(orderId, item.id || item.productId, item.quantity, Number(item.price));
        }

        return NextResponse.json({
            success: true,
            orderId,
            message: 'Order placed successfully!'
        });
    } catch (error) {
        console.error('Error placing order:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

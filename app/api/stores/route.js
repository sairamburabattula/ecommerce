import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const userId = searchParams.get('userId');
        const username = searchParams.get('username');

        if (username) {
            const store = db.prepare('SELECT * FROM stores WHERE LOWER(username) = LOWER(?)').get(username);
            if (!store) {
                return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
            }
            const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE storeId = ?').get(store.id).count;
            return NextResponse.json({ success: true, store: { ...store, isActive: Boolean(store.isActive), productCount } });
        }

        if (userId) {
            const store = db.prepare('SELECT * FROM stores WHERE userId = ?').get(userId);
            return NextResponse.json({ success: true, store: store ? { ...store, isActive: Boolean(store.isActive) } : null });
        }

        let query = 'SELECT s.*, u.name as ownerName, u.email as ownerEmail FROM stores s LEFT JOIN users u ON s.userId = u.id';
        const params = [];

        if (status) {
            query += ' WHERE s.status = ?';
            params.push(status);
        }

        query += ' ORDER BY s.createdAt DESC';

        const stores = db.prepare(query).all(...params).map(s => ({
            ...s,
            isActive: Boolean(s.isActive),
            productCount: db.prepare('SELECT COUNT(*) as count FROM products WHERE storeId = ?').get(s.id).count,
            user: {
                name: s.ownerName || 'Store Owner',
                email: s.ownerEmail || s.email,
                image: s.logo || '/assets/gs_logo.jpg'
            }
        }));

        return NextResponse.json({ success: true, stores });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, username, description, email, contact, address, logo, userId } = body;

        if (!name || !username || !email) {
            return NextResponse.json({ success: false, message: 'Store name, username, and email are required' }, { status: 400 });
        }

        // Check if username already taken
        const existing = db.prepare('SELECT id FROM stores WHERE LOWER(username) = LOWER(?)').get(username);
        if (existing) {
            return NextResponse.json({ success: false, message: 'Store username is already taken. Please choose another.' }, { status: 400 });
        }

        const id = 'store_' + Date.now();
        const ownerId = userId || 'user_customer';

        const stmt = db.prepare(`
            INSERT INTO stores (id, userId, name, description, username, address, status, isActive, logo, email, contact)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?, ?)
        `);

        stmt.run(
            id,
            ownerId,
            name,
            description || '',
            username.toLowerCase().replace(/\s+/g, '-'),
            address || '',
            logo || '/assets/happy_store.webp',
            email,
            contact || ''
        );

        return NextResponse.json({
            success: true,
            storeId: id,
            status: 'pending',
            message: 'Your store application has been submitted and is pending admin approval!'
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 'user_customer';

        const addresses = db.prepare('SELECT * FROM addresses WHERE userId = ? ORDER BY createdAt DESC').all(userId);
        return NextResponse.json({ success: true, addresses });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, street, city, state, zip, country, phone, userId } = body;

        if (!name || !street || !city || !phone) {
            return NextResponse.json({ success: false, message: 'Name, street, city, and phone are required' }, { status: 400 });
        }

        const id = 'addr_' + Date.now();
        const targetUser = userId || 'user_customer';

        const stmt = db.prepare(`
            INSERT INTO addresses (id, userId, name, email, street, city, state, zip, country, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, targetUser, name, email || '', street, city, state || '', zip || '', country || '', phone);

        const newAddress = db.prepare('SELECT * FROM addresses WHERE id = ?').get(id);

        return NextResponse.json({ success: true, address: newAddress, message: 'Address saved successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

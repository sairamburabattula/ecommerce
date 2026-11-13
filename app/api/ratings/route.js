import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { rating, review, productId, orderId, userId } = body;

        if (!rating || !productId) {
            return NextResponse.json({ success: false, message: 'Rating and product ID are required' }, { status: 400 });
        }

        const id = 'rat_' + Date.now();
        const user = userId || 'user_customer';

        const stmt = db.prepare(`
            INSERT INTO ratings (id, rating, review, userId, productId, orderId)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, Number(rating), review || '', user, productId, orderId || null);

        return NextResponse.json({ success: true, message: 'Rating submitted successfully!', rating: { id, rating: Number(rating), review, productId, orderId } });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

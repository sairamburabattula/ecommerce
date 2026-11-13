import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const coupons = db.prepare('SELECT * FROM coupons ORDER BY createdAt DESC').all().map(c => ({
            ...c,
            forNewUser: Boolean(c.forNewUser),
            forMember: Boolean(c.forMember),
            isPublic: Boolean(c.isPublic)
        }));
        return NextResponse.json({ success: true, coupons });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { code, description, discount, forNewUser, forMember, isPublic, expiresAt } = body;

        if (!code || !discount) {
            return NextResponse.json({ success: false, message: 'Coupon code and discount are required' }, { status: 400 });
        }

        const formattedCode = code.trim().toUpperCase();

        const stmt = db.prepare(`
            INSERT OR REPLACE INTO coupons (code, description, discount, forNewUser, forMember, isPublic, expiresAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            formattedCode,
            description || '',
            Number(discount),
            forNewUser ? 1 : 0,
            forMember ? 1 : 0,
            isPublic ? 1 : 0,
            expiresAt ? new Date(expiresAt).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString()
        );

        return NextResponse.json({ success: true, message: 'Coupon added successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
        }

        db.prepare('DELETE FROM coupons WHERE code = ?').run(code.toUpperCase());
        return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { code, amount } = body;

        if (!code) {
            return NextResponse.json({ success: false, message: 'Please enter a coupon code' }, { status: 400 });
        }

        const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)').get(code.trim());

        if (!coupon) {
            return NextResponse.json({ success: false, message: 'Invalid coupon code' }, { status: 404 });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ success: false, message: 'This coupon has expired' }, { status: 400 });
        }

        const discountPercent = Number(coupon.discount);
        const subtotal = Number(amount) || 0;
        const discountAmount = Math.round((subtotal * discountPercent) / 100 * 100) / 100;
        const finalAmount = Math.max(0, subtotal - discountAmount);

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                discount: discountPercent,
                description: coupon.description,
                discountAmount,
                finalAmount
            },
            message: `Coupon applied! ${discountPercent}% discount applied.`
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

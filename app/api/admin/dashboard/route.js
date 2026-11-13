import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
        const storeCount = db.prepare('SELECT COUNT(*) as count FROM stores').get().count;
        const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
        const revenueResult = db.prepare('SELECT SUM(total) as revenue FROM orders WHERE isPaid = 1 OR status != "CANCELLED"').get();
        const revenue = Math.round((revenueResult.revenue || 0) * 100) / 100;

        const allOrders = db.prepare('SELECT id, total, status, createdAt FROM orders ORDER BY createdAt ASC').all();

        return NextResponse.json({
            success: true,
            dashboardData: {
                products: productCount,
                revenue,
                orders: orderCount,
                stores: storeCount,
                allOrders
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

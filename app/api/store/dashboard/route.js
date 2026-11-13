import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId') || 'store_1';

        const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE storeId = ?').get(storeId).count;
        const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE storeId = ?').get(storeId).count;
        const earningsResult = db.prepare('SELECT SUM(total) as earnings FROM orders WHERE storeId = ?').get(storeId);
        const totalEarnings = Math.round((earningsResult.earnings || 0) * 100) / 100;

        const ratings = db.prepare(`
            SELECT r.*, u.name as userName, u.image as userImage, p.name as productName, p.category as productCategory
            FROM ratings r
            JOIN products p ON r.productId = p.id
            LEFT JOIN users u ON r.userId = u.id
            WHERE p.storeId = ?
            ORDER BY r.createdAt DESC
        `).all(storeId).map(r => ({
            id: r.id,
            rating: r.rating,
            review: r.review,
            createdAt: r.createdAt,
            user: {
                name: r.userName || 'Verified Buyer',
                image: r.userImage || '/assets/profile_pic1.jpg'
            },
            product: {
                id: r.productId,
                name: r.productName,
                category: r.productCategory
            }
        }));

        return NextResponse.json({
            success: true,
            dashboardData: {
                totalProducts,
                totalEarnings,
                totalOrders,
                ratings
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const prod = db.prepare(`
            SELECT p.*, s.name as storeName, s.username as storeUsername, s.logo as storeLogo, s.description as storeDescription
            FROM products p
            LEFT JOIN stores s ON p.storeId = s.id
            WHERE p.id = ?
        `).get(id);

        if (!prod) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        let parsedImages = [];
        try {
            parsedImages = JSON.parse(prod.images || '[]');
        } catch (e) {
            parsedImages = [prod.images];
        }

        const ratings = db.prepare(`
            SELECT r.*, u.name as userName, u.image as userImage 
            FROM ratings r
            LEFT JOIN users u ON r.userId = u.id
            WHERE r.productId = ?
            ORDER BY r.createdAt DESC
        `).all(id);

        const formatted = {
            id: prod.id,
            name: prod.name,
            description: prod.description,
            mrp: Number(prod.mrp),
            price: Number(prod.price),
            images: parsedImages.length > 0 ? parsedImages : ['/assets/product_img1.png'],
            category: prod.category,
            inStock: Boolean(prod.inStock),
            storeId: prod.storeId,
            createdAt: prod.createdAt,
            updatedAt: prod.updatedAt,
            store: {
                id: prod.storeId,
                name: prod.storeName || 'Happy Shop',
                username: prod.storeUsername || 'happyshop',
                logo: prod.storeLogo || '/assets/happy_store.webp',
                description: prod.storeDescription || ''
            },
            rating: ratings.map(r => ({
                id: r.id,
                rating: r.rating,
                review: r.review,
                createdAt: r.createdAt,
                user: {
                    name: r.userName || 'Verified Buyer',
                    image: r.userImage || '/assets/profile_pic1.jpg'
                }
            }))
        };

        return NextResponse.json({ success: true, product: formatted });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { inStock, name, price, description } = body;

        if (inStock !== undefined) {
            db.prepare('UPDATE products SET inStock = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(inStock ? 1 : 0, id);
        }

        if (name !== undefined) {
            db.prepare('UPDATE products SET name = ?, price = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
                .run(name, Number(price), description, id);
        }

        return NextResponse.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        db.prepare('DELETE FROM products WHERE id = ?').run(id);
        db.prepare('DELETE FROM ratings WHERE productId = ?').run(id);
        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const storeId = searchParams.get('storeId');
        const username = searchParams.get('username');

        let query = 'SELECT p.*, s.name as storeName, s.username as storeUsername, s.logo as storeLogo FROM products p LEFT JOIN stores s ON p.storeId = s.id WHERE 1=1';
        const params = [];

        if (category && category.toLowerCase() !== 'all') {
            query += ' AND LOWER(p.category) = LOWER(?)';
            params.push(category);
        }

        if (storeId) {
            query += ' AND p.storeId = ?';
            params.push(storeId);
        }

        if (username) {
            query += ' AND LOWER(s.username) = LOWER(?)';
            params.push(username);
        }

        if (search) {
            query += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)';
            const term = `%${search.toLowerCase()}%`;
            params.push(term, term);
        }

        query += ' ORDER BY p.createdAt DESC';

        const products = db.prepare(query).all(...params);

        // Fetch ratings for products
        const ratings = db.prepare(`
            SELECT r.*, u.name as userName, u.image as userImage 
            FROM ratings r
            LEFT JOIN users u ON r.userId = u.id
        `).all();

        const formatted = products.map(prod => {
            let parsedImages = [];
            try {
                parsedImages = JSON.parse(prod.images || '[]');
            } catch (e) {
                parsedImages = [prod.images];
            }

            const productRatings = ratings
                .filter(r => r.productId === prod.id)
                .map(r => ({
                    id: r.id,
                    rating: r.rating,
                    review: r.review,
                    createdAt: r.createdAt,
                    user: {
                        name: r.userName || 'Verified Buyer',
                        image: r.userImage || '/assets/profile_pic1.jpg'
                    }
                }));

            return {
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
                    logo: prod.storeLogo || '/assets/happy_store.webp'
                },
                rating: productRatings
            };
        });

        return NextResponse.json({ success: true, products: formatted });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, description, mrp, price, category, images, storeId } = body;

        if (!name || !price || !category) {
            return NextResponse.json({ success: false, message: 'Name, price and category are required' }, { status: 400 });
        }

        const id = 'prod_' + Date.now();
        const imageList = Array.isArray(images) && images.length > 0 ? images : ['/assets/product_img1.png'];

        const stmt = db.prepare(`
            INSERT INTO products (id, name, description, mrp, price, images, category, inStock, storeId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            name,
            description || '',
            Number(mrp) || Number(price),
            Number(price),
            JSON.stringify(imageList),
            category,
            1,
            storeId || 'store_1'
        );

        return NextResponse.json({ success: true, productId: id, message: 'Product created successfully' });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

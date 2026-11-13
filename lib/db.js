import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

// Store DB file in <project_root>/data/gocart.db
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'gocart.db');

// Global singleton across hot reloads in development
let dbInstance = global.__gocart_db__;

if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath);
    global.__gocart_db__ = dbInstance;

    // Enable WAL mode for high concurrency
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');

    // Initialize Schema
    dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            image TEXT,
            role TEXT DEFAULT 'customer',
            cart TEXT DEFAULT '{}',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS stores (
            id TEXT PRIMARY KEY,
            userId TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            username TEXT UNIQUE NOT NULL,
            address TEXT,
            status TEXT DEFAULT 'pending',
            isActive INTEGER DEFAULT 1,
            logo TEXT,
            email TEXT,
            contact TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            mrp REAL NOT NULL,
            price REAL NOT NULL,
            images TEXT NOT NULL,
            category TEXT NOT NULL,
            inStock INTEGER DEFAULT 1,
            storeId TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS addresses (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            street TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            zip TEXT NOT NULL,
            country TEXT NOT NULL,
            phone TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS coupons (
            code TEXT PRIMARY KEY,
            description TEXT,
            discount REAL NOT NULL,
            forNewUser INTEGER DEFAULT 0,
            forMember INTEGER DEFAULT 0,
            isPublic INTEGER DEFAULT 1,
            expiresAt TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            total REAL NOT NULL,
            status TEXT DEFAULT 'ORDER_PLACED',
            userId TEXT NOT NULL,
            storeId TEXT,
            addressId TEXT,
            isPaid INTEGER DEFAULT 0,
            paymentMethod TEXT DEFAULT 'COD',
            isCouponUsed INTEGER DEFAULT 0,
            coupon TEXT DEFAULT '{}',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS order_items (
            orderId TEXT NOT NULL,
            productId TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            PRIMARY KEY (orderId, productId)
        );

        CREATE TABLE IF NOT EXISTS ratings (
            id TEXT PRIMARY KEY,
            rating REAL NOT NULL,
            review TEXT,
            userId TEXT NOT NULL,
            productId TEXT NOT NULL,
            orderId TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Auto-seed if empty
    seedDatabase(dbInstance);
}

function seedDatabase(db) {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
        // Seed Default Users
        const insertUser = db.prepare('INSERT OR REPLACE INTO users (id, name, email, image, role, cart) VALUES (?, ?, ?, ?, ?, ?)');
        insertUser.run('user_customer', 'Alex Johnson', 'customer@cartify.com', '/assets/profile_pic1.jpg', 'customer', '{}');
        insertUser.run('user_seller', 'Cartify Merchant', 'seller@cartify.com', '/assets/profile_pic2.jpg', 'seller', '{}');
        insertUser.run('user_admin', 'Cartify Admin', 'admin@cartify.com', '/assets/profile_pic3.jpg', 'admin', '{}');

        // Seed Default Stores
        const insertStore = db.prepare(`
            INSERT OR REPLACE INTO stores (id, userId, name, description, username, address, status, isActive, logo, email, contact)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insertStore.run(
            'store_1',
            'user_seller',
            'Happy Shop',
            'At Happy Shop, we believe shopping should be simple, smart, and satisfying. Premium lifestyle and electronics.',
            'happyshop',
            '3rd Floor, Happy Shop, New Building, 123 Street, NY, US',
            'approved',
            1,
            '/assets/happy_store.webp',
            'happyshop@example.com',
            '+1 123 456 7890'
        );
        insertStore.run(
            'store_2',
            'user_pending',
            'Urban Beats Audio',
            'High fidelity audio gear, premium studio monitors, and acoustic lifestyle equipment.',
            'urbanbeats',
            '456 Music Ave, Austin, TX',
            'pending',
            0,
            '/assets/gs_logo.jpg',
            'contact@urbanbeats.io',
            '+1 555 888 2211'
        );

        // Seed Default Coupons
        const insertCoupon = db.prepare(`
            INSERT OR REPLACE INTO coupons (code, description, discount, forNewUser, forMember, isPublic, expiresAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        insertCoupon.run('CARTIFY10', 'Flat 10% off for all orders', 10, 0, 0, 1, '2028-12-31T23:59:59Z');
        insertCoupon.run('GOCART10', 'Flat 10% off for all orders', 10, 0, 0, 1, '2028-12-31T23:59:59Z');
        insertCoupon.run('WELCOME20', 'Special 20% discount for first time buyers', 20, 1, 0, 1, '2028-12-31T23:59:59Z');
        insertCoupon.run('VIP30', 'Exclusive 30% discount for Plus Members', 30, 0, 1, 0, '2028-12-31T23:59:59Z');

        // Seed Default Address
        const insertAddress = db.prepare(`
            INSERT OR REPLACE INTO addresses (id, userId, name, email, street, city, state, zip, country, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insertAddress.run(
            'addr_1',
            'user_customer',
            'Alex Johnson',
            'customer@gocart.com',
            '742 Evergreen Terrace',
            'Springfield',
            'Oregon',
            '97477',
            'United States',
            '+1 555 0199'
        );

        // Seed Default Products
        const insertProduct = db.prepare(`
            INSERT OR REPLACE INTO products (id, name, description, mrp, price, images, category, inStock, storeId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const initialProducts = [
            { id: "prod_1", name: "Modern table lamp", desc: "Modern table lamp with a sleek minimalist aesthetic. Built with high-grade aluminum and warm ambient LEDs.", mrp: 40, price: 29, cat: "Decoration", images: ["/assets/product_img1.png", "/assets/product_img2.png"] },
            { id: "prod_2", name: "Smart speaker gray", desc: "360-degree room-filling acoustic sound with integrated voice assistant and ultra-low latency streaming.", mrp: 50, price: 34, cat: "Speakers", images: ["/assets/product_img2.png"] },
            { id: "prod_3", name: "Smart watch white", desc: "Next-gen fitness tracker with continuous heart rate, sleep metrics, AMOLED display, and 7-day battery.", mrp: 60, price: 45, cat: "Watch", images: ["/assets/product_img3.png"] },
            { id: "prod_4", name: "Wireless headphones", desc: "Active Noise Cancelling over-ear wireless headphones with custom 40mm drivers and 40h battery.", mrp: 80, price: 59, cat: "Headphones", images: ["/assets/product_img4.png"] },
            { id: "prod_5", name: "Wireless Earbuds Pro", desc: "True wireless earbuds with spatial audio, sweat resistance, and compact magnetic charging case.", mrp: 49, price: 35, cat: "Earbuds", images: ["/assets/product_img5.png"] },
            { id: "prod_6", name: "Precision Gaming Mouse", desc: "Ultra-lightweight ergonomic mouse with 26,000 DPI optical sensor and PTFE glide feet.", mrp: 35, price: 25, cat: "Mouse", images: ["/assets/product_img6.png"] },
            { id: "prod_7", name: "Minimalist Desk Clock", desc: "Silent sweep wood finish clock for modern workspaces and bedside tables.", mrp: 28, price: 19, cat: "Decoration", images: ["/assets/product_img7.png"] },
            { id: "prod_8", name: "Studio Monitor Speakers", desc: "Pair of bi-amped studio reference monitors for music production and audiophile listening.", mrp: 120, price: 89, cat: "Speakers", images: ["/assets/product_img8.png"] },
            { id: "prod_9", name: "Chrono Sport Watch", desc: "Rugged stainless steel waterproof chronograph with sapphire crystal glass.", mrp: 95, price: 69, cat: "Watch", images: ["/assets/product_img9.png"] },
            { id: "prod_10", name: "Hi-Res Studio Headphones", desc: "Open-back headphones with planar magnetic drivers delivering breathtaking soundstage clarity.", mrp: 150, price: 110, cat: "Headphones", images: ["/assets/product_img10.png"] },
            { id: "prod_11", name: "Sport Bluetooth Earbuds", desc: "Secure-fit ear hooks, waterproof IPX7 rating, and rich punchy bass for intense workouts.", mrp: 45, price: 32, cat: "Earbuds", images: ["/assets/product_img11.png"] },
            { id: "prod_12", name: "Ergonomic Vertical Mouse", desc: "Scientifically tested 57-degree vertical grip to reduce muscle strain and forearm fatigue.", mrp: 40, price: 28, cat: "Mouse", images: ["/assets/product_img12.png"] },
        ];

        for (const p of initialProducts) {
            insertProduct.run(p.id, p.name, p.desc, p.mrp, p.price, JSON.stringify(p.images), p.cat, 1, 'store_1');
        }

        // Seed Default Ratings
        const insertRating = db.prepare(`
            INSERT OR REPLACE INTO ratings (id, rating, review, userId, productId, orderId)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertRating.run('rat_1', 5, "Remarkable build quality and great performance. Definitely exceeded my expectations!", 'user_customer', 'prod_1', 'ord_demo_1');
        insertRating.run('rat_2', 4.5, "Very sleek design, sets up in minutes. Highly recommended for everyday use.", 'user_customer', 'prod_2', 'ord_demo_1');
        insertRating.run('rat_3', 5, "Crisp audio and super comfortable even during long sessions.", 'user_customer', 'prod_4', 'ord_demo_1');

        // Seed Sample Orders
        const insertOrder = db.prepare(`
            INSERT OR REPLACE INTO orders (id, total, status, userId, storeId, addressId, isPaid, paymentMethod, isCouponUsed, coupon, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertOrderItem = db.prepare(`
            INSERT OR REPLACE INTO order_items (orderId, productId, quantity, price)
            VALUES (?, ?, ?, ?)
        `);

        insertOrder.run('ord_101', 93.0, 'DELIVERED', 'user_customer', 'store_1', 'addr_1', 1, 'STRIPE', 0, '{}', '2026-10-15 10:30:00');
        insertOrderItem.run('ord_101', 'prod_1', 1, 29.0);
        insertOrderItem.run('ord_101', 'prod_2', 1, 34.0);
        insertOrderItem.run('ord_101', 'prod_6', 1, 25.0);

        insertOrder.run('ord_102', 104.0, 'SHIPPED', 'user_customer', 'store_1', 'addr_1', 1, 'STRIPE', 1, '{"code":"GOCART10","discount":10}', '2026-11-02 14:15:00');
        insertOrderItem.run('ord_102', 'prod_4', 1, 59.0);
        insertOrderItem.run('ord_102', 'prod_3', 1, 45.0);

        insertOrder.run('ord_103', 29.0, 'PROCESSING', 'user_customer', 'store_1', 'addr_1', 0, 'COD', 0, '{}', '2026-11-10 09:00:00');
        insertOrderItem.run('ord_103', 'prod_1', 1, 29.0);
    }
}

export const db = dbInstance;

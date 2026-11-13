<div align="center">
  <h1>Cartify - Full-Stack Multi-Vendor E-Commerce Platform</h1>
  <p>
    An open-source multi-vendor e-commerce platform built with Next.js 15, React 19, Tailwind CSS 4, Redux Toolkit, and zero-config SQLite.
  </p>
</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [🧭 Navigation & Routes](#-navigation--routes)
- [🏷️ Demo Coupons](#-demo-coupons)
- [🔌 API Endpoints](#-api-endpoints)

---

## ✨ Features

- **Multi-Vendor Architecture:**
  - Vendor registration and onboarding (`/create-store`).
  - Dedicated Seller Dashboard (`/store`) with metrics, revenue, and customer review feed.
  - Product Catalog Manager with stock toggling and instant product publishing (`/store/add-product`).
  - Store Order Fulfillment manager with status updates (`ORDER_PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`).
- **Customer Storefront:**
  - Modern responsive UI with live category filter pills and debounced search.
  - Interactive product details with image galleries, discount calculator, and customer reviews.
  - Full Redux shopping cart with item counters, dynamic pricing, and address selector.
  - Live Coupon System with instant code verification and discount application.
  - Order tracking and review modal for delivered products.
  - Interactive multi-tier pricing page (`/pricing`).
- **Admin Control Panel (`/admin`):**
  - Platform-wide dashboard with total products, revenue, orders, and store counts.
  - Interactive Orders/Day area chart powered by Recharts.
  - Store Application Approval queue (`/admin/approve`) to approve or reject vendor onboarding.
  - Live Stores management (`/admin/stores`) to toggle active status.
  - Coupon management (`/admin/coupons`) to create and delete platform discount codes.
- **Zero-Config Database:**
  - Built-in SQLite database powered by Node's native `DatabaseSync` (`data/gocart.db`).
  - Automatically provisions tables and seeds initial products, stores, coupons, demo addresses, and orders.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4
- **State Management:** Redux Toolkit
- **Icons & Visuals:** Lucide React, Recharts
- **Database:** SQLite (`node:sqlite` in `lib/db.js`)
- **Notifications:** React Hot Toast

---

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```
   *(If on Windows with PowerShell script restrictions, use `npm.cmd install` or run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)*

2. **Start the development server:**
   ```bash
   npm run dev
   # or
   npm.cmd run dev
   ```

3. **Open in browser:**
   Open [http://localhost:3000](http://localhost:3000)

---

## 🧭 Navigation & Routes

| Section | Route | Description |
|---|---|---|
| **Storefront** | `/` | Homepage with hero, latest arrivals, bestsellers, and newsletter |
| **Catalog** | `/shop` | Full product catalog with live search & category filters |
| **Store Profile** | `/shop/happyshop` | Public storefront for a specific vendor |
| **Cart & Checkout** | `/cart` | Shopping cart, address selection, coupons, and order placement |
| **My Orders** | `/orders` | Customer order history with item breakdown and review modal |
| **Pricing** | `/pricing` | Shopper Free, GoCart Plus, and Seller Pro tiers |
| **Seller Onboarding** | `/create-store` | Submit store application for admin verification |
| **Seller Dashboard** | `/store` | Vendor analytics, total revenue, and review feed |
| **Seller Products** | `/store/manage-product` | View all store products & toggle stock availability |
| **Add Product** | `/store/add-product` | Create and publish new products with images |
| **Seller Orders** | `/store/orders` | Manage incoming orders and update delivery statuses |
| **Admin Dashboard** | `/admin` | Platform overview, revenue analytics, and orders chart |
| **Store Approvals** | `/admin/approve` | Review and approve/reject pending vendor applications |
| **Store Directory** | `/admin/stores` | Toggle stores active/inactive |
| **Coupon Manager** | `/admin/coupons` | Create and delete promotional coupon codes |

---

## 🏷️ Demo Coupons

You can use these codes during checkout on the `/cart` page:
- `CARTIFY10` - 10% off entire order
- `WELCOME20` - 20% off for new shoppers
- `VIP30` - 30% off for Plus members

---

## 🔌 API Endpoints

- `GET /api/products` - List products (supports `?search=`, `?category=`, `?storeId=`, `?username=`)
- `POST /api/products` - Create a new product
- `PATCH /api/products/:id` - Update product details or stock
- `DELETE /api/products/:id` - Remove a product
- `GET /api/stores` - List stores (`?status=pending` or `?username=`)
- `POST /api/stores` - Submit new store application
- `PATCH /api/stores/:id` - Update store status or active state
- `GET /api/orders` - List orders (`?userId=` or `?storeId=`)
- `POST /api/orders` - Place order from cart
- `PATCH /api/orders/:id` - Update order fulfillment status
- `GET /api/coupons` - List all coupons
- `POST /api/coupons` - Create new coupon
- `DELETE /api/coupons` - Delete coupon
- `POST /api/coupons/validate` - Validate coupon code & return discount
- `GET /api/addresses` - List addresses for user
- `POST /api/addresses` - Save new shipping address
- `POST /api/ratings` - Submit product review and rating
- `GET /api/admin/dashboard` - Platform aggregate analytics
- `GET /api/store/dashboard` - Vendor aggregate analytics

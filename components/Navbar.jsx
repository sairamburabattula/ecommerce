'use client'
import { Search, ShoppingCart, User, Store, Shield, Package, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {

    const router = useRouter();

    const [search, setSearch] = useState('')
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        if (search.trim()) {
            router.push(`/shop?search=${encodeURIComponent(search.trim())}`)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="relative bg-white sticky top-0 z-40 shadow-xs">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative flex items-center group">
                        <Image
                            src="/logo.png"
                            alt="Cartify"
                            width={150}
                            height={45}
                            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-102"
                            priority
                        />
                        <span className="absolute text-[10px] font-bold -top-1 -right-8 px-2 py-0.2 rounded-full flex items-center text-white bg-green-600 shadow-xs">
                            plus
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-7 text-slate-600 font-medium text-sm">
                        <Link href="/" className="hover:text-green-600 transition">Home</Link>
                        <Link href="/shop" className="hover:text-green-600 transition">Shop</Link>
                        <Link href="/pricing" className="hover:text-green-600 transition">Pricing</Link>
                        <Link href="/orders" className="hover:text-green-600 transition">Orders</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-64 text-sm gap-2 bg-slate-100 px-4 py-2.5 rounded-full">
                            <Search size={18} className="text-slate-500" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-500 text-xs sm:text-sm" type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-1.5 text-slate-700 hover:text-green-600 transition">
                            <ShoppingCart size={19} />
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 text-[10px] font-bold text-white bg-green-600 size-4 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Account & Panels Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setUserMenuOpen(prev => !prev)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 transition text-white rounded-full text-xs font-medium cursor-pointer"
                            >
                                <User size={15} />
                                <span>Account</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-xs font-semibold text-slate-800">Demo User</p>
                                        <p className="text-[11px] text-slate-500 truncate">customer@gocart.com</p>
                                    </div>

                                    <div className="py-1 text-xs">
                                        <Link
                                            href="/orders"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-green-600 transition"
                                        >
                                            <Package size={15} className="text-slate-400" />
                                            <span>My Orders</span>
                                        </Link>
                                        <Link
                                            href="/create-store"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-green-600 transition"
                                        >
                                            <Store size={15} className="text-slate-400" />
                                            <span>Open a Store</span>
                                        </Link>
                                        <Link
                                            href="/store"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-green-600 transition"
                                        >
                                            <Store size={15} className="text-green-600" />
                                            <span className="font-medium text-green-700">Seller Dashboard</span>
                                        </Link>
                                        <Link
                                            href="/admin"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 hover:text-indigo-600 transition"
                                        >
                                            <Shield size={15} className="text-indigo-600" />
                                            <span className="font-medium text-indigo-700">Admin Panel</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Mobile Menu */}
                    <div className="sm:hidden flex items-center gap-3">
                        <Link href="/cart" className="relative p-2 text-slate-700">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 text-[10px] font-bold text-white bg-green-600 size-4 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <Link href="/store" className="px-3 py-1.5 bg-green-600 text-xs text-white rounded-full">
                            Seller
                        </Link>
                        <Link href="/admin" className="px-3 py-1.5 bg-slate-800 text-xs text-white rounded-full">
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
            <hr className="border-gray-200" />
        </nav>
    )
}

export default Navbar

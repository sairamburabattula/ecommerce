'use client'
import Link from "next/link"
import Image from "next/image"

const StoreNavbar = () => {


    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative flex items-center group">
                <Image
                    src="/logo.png"
                    alt="Cartify"
                    width={140}
                    height={40}
                    className="h-8 w-auto object-contain"
                    priority
                />
                <span className="absolute text-[10px] font-bold -top-1 -right-11 px-2 py-0.5 rounded-full flex items-center text-white bg-green-600 shadow-xs">
                    Store
                </span>
            </Link>
            <div className="flex items-center gap-4">
                <Link href="/" className="text-xs font-medium bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full text-slate-700 transition">
                    View Storefront
                </Link>
                <p className="text-sm text-slate-600 font-medium">Hi, Seller</p>
            </div>
        </div>
    )
}

export default StoreNavbar
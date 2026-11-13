'use client'
import { Suspense } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

const CATEGORIES = ["All", "Headphones", "Speakers", "Watch", "Earbuds", "Mouse", "Decoration"]

function ShopContent() {

    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const category = searchParams.get('category') || 'All'
    const router = useRouter()

    const products = useSelector(state => state.product.list)

    let filteredProducts = products;
    if (search) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.description?.toLowerCase().includes(search.toLowerCase())
        );
    }
    if (category && category.toLowerCase() !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
            product.category?.toLowerCase() === category.toLowerCase()
        );
    }

    const handleCategoryClick = (cat) => {
        if (cat === 'All') {
            router.push(search ? `/shop?search=${search}` : '/shop')
        } else {
            router.push(`/shop?category=${cat}${search ? `&search=${search}` : ''}`)
        }
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
                    <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 flex items-center gap-2 cursor-pointer">
                        {(search || (category && category !== 'All')) && <MoveLeftIcon size={20} />}
                        {category !== 'All' ? category : 'All'} <span className="text-slate-700 font-medium">Products</span>
                        <span className="text-xs text-slate-400 font-normal">({filteredProducts.length})</span>
                    </h1>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                                    category.toLowerCase() === cat.toLowerCase()
                                        ? 'bg-green-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <p className="text-xl font-medium">No products found</p>
                        <p className="text-xs mt-1">Try adjusting your search terms or category filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
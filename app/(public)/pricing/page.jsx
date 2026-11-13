
'use client'
import { Check, Sparkles, Store, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
    const plans = [
        {
            name: "Shopper Free",
            badge: "Customer",
            price: "$0",
            period: "forever",
            description: "Everything you need to discover and purchase verified products across top vendor stores.",
            icon: ShoppingBag,
            features: [
                "Full access to all multi-vendor storefronts",
                "Real-time order tracking & status updates",
                "Customer product ratings & honest reviews",
                "Standard COD & secure card checkout",
                "Community support"
            ],
            cta: "Start Shopping",
            href: "/shop",
            popular: false
        },
        {
            name: "Cartify Plus",
            badge: "Most Popular",
            price: "$9.99",
            period: "per month",
            description: "Unlock exclusive seller discounts, early access to flash deals, and zero delivery charges.",
            icon: Sparkles,
            features: [
                "Free priority shipping on all orders",
                "Exclusive 15-30% member coupons",
                "Early access to flash sales & launches",
                "Dedicated 24/7 premium concierge",
                "30-day no-questions return guarantee"
            ],
            cta: "Join Plus",
            href: "/cart",
            popular: true
        },
        {
            name: "Seller Pro",
            badge: "Vendors",
            price: "$29.00",
            period: "per month",
            description: "Launch and scale your branded storefront with advanced inventory & revenue analytics.",
            icon: Store,
            features: [
                "Custom branded store URL (cartify.com/shop/yourstore)",
                "Unlimited product listings & catalog management",
                "Advanced sales analytics & order graphs",
                "Automated coupon campaign creator",
                "Zero platform listing fees for first 90 days"
            ],
            cta: "Open Your Store",
            href: "/create-store",
            popular: false
        }
    ]

    return (
        <div className='mx-auto max-w-6xl my-20 px-6'>
            <div className='text-center max-w-2xl mx-auto mb-16'>
                <h1 className='text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight'>
                    Transparent Pricing for <span className='text-green-600'>Every Need</span>
                </h1>
                <p className='text-slate-500 mt-4 text-sm sm:text-base'>
                    Whether you are an everyday buyer looking for the best deals, or an ambitious merchant ready to launch a global storefront.
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {plans.map((plan, idx) => (
                    <div
                        key={idx}
                        className={`relative rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${plan.popular
                                ? 'bg-slate-900 text-white shadow-xl scale-102 ring-2 ring-green-500'
                                : 'bg-white border border-slate-200 text-slate-700 hover:shadow-md'
                            }`}
                    >
                        {plan.popular && (
                            <span className='absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider'>
                                {plan.badge}
                            </span>
                        )}

                        <div>
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className={`text-xl font-semibold ${plan.popular ? 'text-white' : 'text-slate-800'}`}>
                                    {plan.name}
                                </h3>
                                <plan.icon className={plan.popular ? 'text-green-400' : 'text-slate-400'} size={24} />
                            </div>

                            <p className={`text-xs min-h-[36px] ${plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>
                                {plan.description}
                            </p>

                            <div className='my-6 flex items-baseline gap-1'>
                                <span className={`text-4xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                                    {plan.price}
                                </span>
                                <span className={`text-xs ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                                    /{plan.period}
                                </span>
                            </div>

                            <ul className='space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm'>
                                {plan.features.map((feature, i) => (
                                    <li key={i} className='flex items-start gap-2.5'>
                                        <Check className={`size-4 shrink-0 mt-0.5 ${plan.popular ? 'text-green-400' : 'text-green-600'}`} />
                                        <span className={plan.popular ? 'text-slate-200' : 'text-slate-600'}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link
                            href={plan.href}
                            className={`mt-8 block text-center py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${plan.popular
                                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-md active:scale-98'
                                    : 'bg-slate-800 hover:bg-slate-900 text-white active:scale-98'
                                }`}
                        >
                            {plan.cta}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

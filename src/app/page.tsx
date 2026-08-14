import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StoreShell from '@/components/layout/StoreShell';
import ProductCard from '@/components/products/ProductCard';
import { getCategories, getProducts } from '@/lib/data/products';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowRight,
  Sparkles,
  Flame,
  ShieldCheck,
  Truck,
  Award,
  CreditCard,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const revalidate = 60; // ISR cache for 1 minute

export default async function HomePage() {
  const categories = await getCategories();
  const { products } = await getProducts({ limit: 8, sortBy: 'newest' });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  const featuredProducts = products.slice(0, 4);
  const bestSellers = products.slice(0, 8);

  return (
    <StoreShell categories={categories} userEmail={user?.email} isAdmin={isAdmin}>
      {/* 1. Hero Showcase Section */}
      <section className="bg-slate-950 text-white relative overflow-hidden py-10 sm:py-16 lg:py-20 border-b border-slate-800">
        {/* Background subtle light effects */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premier Ghanaian Physical Goods Store</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Authentic Quality Goods, <br className="hidden sm:inline" />
                <span className="text-amber-400">Delivered Across Ghana.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover tailored Kente print shirts, full-grain handcrafted leather bags, wireless audio gadgets, and 100% pure organic skincare.
              </p>

              {/* CTAs */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm hover:bg-amber-400 shadow-md transition-all touch-target"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products?sort=newest"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm hover:bg-slate-800 transition-colors touch-target"
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Flash Deals</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-3 text-left">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">16 Regions Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">MoMo & Card Escrow</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-medium">100% Genuine</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Showcase Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    Featured Arrival
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">GHS in Stock</span>
                </div>

                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-800 mb-4">
                  <Image
                    src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"
                    alt="Authentic Kente Print Shirt"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Authentic Kente Shirt</h3>
                    <p className="text-xs text-slate-400">Tailored 100% Ghana Cotton</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">From</span>
                    <span className="text-lg font-black text-amber-400">GH₵ 180.00</span>
                  </div>
                </div>

                <Link
                  href="/products/authentic-kente-print-button-shirt"
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  View Details & Sizes <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Strip (Wolmart demo 28 style) */}
      <section className="py-10 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                Shop by Department
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Carefully categorized physical goods crafted for durability and style.
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group bg-slate-50 hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-400/60 rounded-2xl p-4 transition-all duration-300 flex flex-col items-center text-center shadow-2xs hover:shadow-xs"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-slate-900 group-hover:text-amber-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                  {category.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {category.description || 'Explore products'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Flash Deals & New Arrivals Grid */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  Hot Deals & Bestsellers
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Limited stock items with fast regional shipping available today.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Special Promo: Use WELCOME10 for 10% Off</span>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm"
            >
              <span>Browse Full Product Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Trust & Security Banner */}
      <section className="py-12 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Ghanaian Seller & Physical Inventory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Direct Single-Vendor Reliability, No Third-Party Middlemen.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every item is stored, inspected, and shipped directly from our Accra warehouse. If an item doesn&apos;t match your expectations, easily request a return right from your account.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/products"
                  className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors"
                >
                  Shop Now
                </Link>
                <Link
                  href="/account"
                  className="px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-700 transition-colors"
                >
                  Track an Existing Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}

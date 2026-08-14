import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StoreShell from '@/components/layout/StoreShell';
import ProductCard from '@/components/products/ProductCard';
import { getCategories, getProducts } from '@/lib/data/products';
import { createClient } from '@/lib/supabase/server';
import {
  ArrowRight,
  Flame,
  Truck,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const categories = await getCategories();
  const { products } = await getProducts({ limit: 12, sortBy: 'newest' });

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

  const flashDeals = products.slice(0, 4);
  const bestSellers = products.slice(0, 8);

  return (
    <StoreShell categories={categories} userEmail={user?.email} isAdmin={isAdmin}>
      {/* 1. Hero Grid: Main Slider + 2 Side Promo Banners (Wolmart Demo 28 exact layout) */}
      <section className="pt-4 pb-6 bg-[#f7f7f7]">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Hero Banner (8 Cols) */}
            <div className="lg:col-span-8 bg-[#0f222b] text-white rounded-md overflow-hidden relative p-8 sm:p-12 flex flex-col justify-between min-h-[380px] shadow-xs">
              <div className="max-w-md space-y-3 z-10">
                <span className="inline-block bg-[#ff9933] text-black font-extrabold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded">
                  NEW SEASON ARRIVAL
                </span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                  Authentic Ghanaian <br />
                  <span className="text-[#1e5cea] text-white">Quality Products.</span>
                </h1>
                <p className="text-[13px] text-[#b0bec5] leading-relaxed">
                  Handcrafted Kente apparel, full-grain leather bags, wireless tech, and pure organic Northern shea butter.
                </p>
                <div className="pt-2">
                  <span className="text-xs text-[#90a4ae] block">Starting at only</span>
                  <span className="text-2xl font-extrabold text-[#ff9933]">GH₵ 65.00</span>
                </div>
              </div>

              <div className="pt-4 z-10">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[#1e5cea] hover:bg-[#1545b5] text-white font-bold text-[13px] px-6 py-3 rounded transition-colors uppercase tracking-wider shadow-sm"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Decorative background visual */}
              <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 lg:opacity-40 pointer-events-none">
                <Image
                  src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"
                  alt="Featured Arrival"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>

            {/* 2 Staggered Side Promo Banners (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Promo Banner 1: Fashion */}
              <div className="flex-1 bg-[#1a202c] text-white rounded-md p-6 relative overflow-hidden flex flex-col justify-between shadow-xs">
                <div className="z-10 space-y-1">
                  <span className="text-[11px] font-bold text-[#ff9933] uppercase">SPECIAL OFFER</span>
                  <h3 className="text-lg font-bold text-white">Genuine Leather Bags</h3>
                  <p className="text-xs text-[#a0aec0]">Save 15% this week</p>
                </div>
                <div className="z-10 pt-3">
                  <Link
                    href="/products?category=fashion-apparel"
                    className="text-xs font-bold text-[#1e5cea] hover:text-white transition-colors flex items-center gap-1 uppercase"
                  >
                    <span>Shop Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Promo Banner 2: Electronics */}
              <div className="flex-1 bg-[#242b35] text-white rounded-md p-6 relative overflow-hidden flex flex-col justify-between shadow-xs">
                <div className="z-10 space-y-1">
                  <span className="text-[11px] font-bold text-[#00d084] uppercase">BEST VALUE</span>
                  <h3 className="text-lg font-bold text-white">True Wireless Earbuds</h3>
                  <p className="text-xs text-[#a0aec0]">Fast Courier Dispatch</p>
                </div>
                <div className="z-10 pt-3">
                  <Link
                    href="/products?category=electronics-gadgets"
                    className="text-xs font-bold text-[#ff9933] hover:text-white transition-colors flex items-center gap-1 uppercase"
                  >
                    <span>Discover More</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Benefits & Value Props Bar (Wolmart 4-column horizontal feature strip) */}
      <section className="py-4 bg-white border-y border-[#e1e1e1]">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5 py-2">
              <div className="w-12 h-12 rounded-full bg-[#f4f7fe] flex items-center justify-center text-[#1e5cea] shrink-0 border border-[#e3ebfc]">
                <Truck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-[#222529]">Ghana-Wide Delivery</h4>
                <p className="text-[12px] text-[#666]">Doorstep delivery in all 16 regions</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 py-2">
              <div className="w-12 h-12 rounded-full bg-[#f0fbf7] flex items-center justify-center text-[#00d084] shrink-0 border border-[#d3f4e8]">
                <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-[#222529]">100% Genuine Quality</h4>
                <p className="text-[12px] text-[#666]">Inspected single-vendor inventory</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 py-2">
              <div className="w-12 h-12 rounded-full bg-[#fef8f0] flex items-center justify-center text-[#ff9933] shrink-0 border border-[#fbe9d2]">
                <CreditCard className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-[#222529]">Paystack Secure Escrow</h4>
                <p className="text-[12px] text-[#666]">Pay with MTN MoMo, Telecel & Cards</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 py-2">
              <div className="w-12 h-12 rounded-full bg-[#fbf0f0] flex items-center justify-center text-[#e53935] shrink-0 border border-[#f6d7d7]">
                <RotateCcw className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-bold text-[14px] text-[#222529]">7-Day Easy Returns</h4>
                <p className="text-[12px] text-[#666]">Hassle-free return request flow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Circular Category Icons Strip (Wolmart Demo 28 exact match) */}
      <section className="py-8 bg-white border-b border-[#e1e1e1]">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-bold text-[#222529] tracking-tight">
              Explore Popular Departments
            </h2>
            <Link
              href="/products"
              className="text-[13px] font-bold text-[#1e5cea] hover:text-[#1545b5] flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="group flex flex-col items-center text-center p-4 rounded-md border border-[#e1e1e1] hover:border-[#1e5cea] bg-[#fafafa] hover:bg-white transition-all shadow-2xs"
              >
                <div className="w-16 h-16 rounded-full bg-white border border-[#e1e1e1] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-[#1e5cea]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-[14px] text-[#222529] group-hover:text-[#1e5cea] transition-colors">
                  {c.name}
                </h3>
                <span className="text-[11px] text-[#888] mt-0.5">Explore Catalog →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Deals of The Day with Countdown Timer (Wolmart Style) */}
      <section className="py-8 bg-[#f7f7f7]">
        <div className="container-custom">
          {/* Section Header with Countdown Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-[#e1e1e1]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[#e53935] font-black text-xl tracking-tight">
                <Flame className="w-5 h-5 fill-[#e53935]" />
                <span>Deals of The Day</span>
              </div>

              {/* Countdown Boxes */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#222]">
                <Clock className="w-3.5 h-3.5 text-[#666] ml-2" />
                <span className="bg-[#222529] text-white px-2 py-0.5 rounded font-mono">02d</span>
                <span>:</span>
                <span className="bg-[#222529] text-white px-2 py-0.5 rounded font-mono">14h</span>
                <span>:</span>
                <span className="bg-[#222529] text-white px-2 py-0.5 rounded font-mono">35m</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[#666]">Special Promo:</span>
              <span className="bg-[#ff9933]/15 text-[#b35900] border border-[#ff9933]/30 px-2.5 py-0.5 rounded text-[11px] font-bold">
                Code: WELCOME10
              </span>
            </div>
          </div>

          {/* 4-Col Deals Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {flashDeals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Catalog Goods */}
      <section className="py-8 bg-white border-t border-[#e1e1e1]">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#e1e1e1]">
            <h2 className="text-[18px] font-bold text-[#222529] tracking-tight">
              Trending Products & Bestsellers
            </h2>
            <Link
              href="/products"
              className="text-[13px] font-bold text-[#1e5cea] hover:text-[#1545b5] flex items-center gap-1"
            >
              <span>View All ({bestSellers.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </StoreShell>
  );
}

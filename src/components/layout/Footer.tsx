import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, RotateCcw, Headphones, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-auto pb-16 md:pb-0">
      {/* 4 Value Pillars */}
      <div className="border-b border-slate-800/80 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Ghana-Wide Delivery</h4>
                <p className="text-xs text-slate-400 mt-0.5">Reliable dispatch across all 16 regions with GPS tracking.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">100% Genuine Quality</h4>
                <p className="text-xs text-slate-400 mt-0.5">Handpicked, inspected physical goods directly from local makers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Secure Paystack Checkout</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pay in GHS via MTN MoMo, Telecel Cash, AT Money, or Card.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/20">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Hassle-Free Returns</h4>
                <p className="text-xs text-slate-400 mt-0.5">Straightforward return request flow right from your order history.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700">
                <span className="font-black text-amber-400 text-lg">B</span>
                <span className="font-black text-white text-lg">A</span>
              </div>
              <span className="font-extrabold text-white text-xl tracking-tight">
                BuyAll <span className="text-amber-500">Ghana</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your premier single-vendor Ghanaian online store. Discover tailored clothing, crafted accessories, electronics, and natural skincare products in Ghana with fast doorstep delivery.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                MTN MoMo
              </div>
              <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                Telecel Cash
              </div>
              <div className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                Visa / MC
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Shop Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/products?category=fashion-apparel" className="hover:text-amber-400 transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link href="/products?category=electronics-gadgets" className="hover:text-amber-400 transition-colors">
                  Electronics & Gadgets
                </Link>
              </li>
              <li>
                <Link href="/products?category=beauty-personal-care" className="hover:text-amber-400 transition-colors">
                  Beauty & Skincare
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-living" className="hover:text-amber-400 transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors">
                  All Catalog Goods
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Customer Service</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/account" className="hover:text-amber-400 transition-colors">
                  My Profile & Order History
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-amber-400 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-amber-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-amber-400 transition-colors">
                  Track Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Contact Support</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>Accra Metropolitan, Greater Accra, Ghana</p>
              <p className="text-amber-400 font-medium">orders@buyallghana.com</p>
              <p className="font-semibold text-slate-300">+233 (0) 50 000 0000</p>
              <p className="text-[11px] text-slate-500 pt-1">Mon - Sat: 8:00 AM – 6:00 PM GMT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} BuyAll Ghana. All rights reserved. Powered by Paystack.</p>
      </div>
    </footer>
  );
}

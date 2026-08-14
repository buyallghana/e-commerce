'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatGHS } from '@/lib/utils';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  PhoneCall,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { Category } from '@/types/database';

export default function Header({
  categories = [],
  userEmail,
  isAdmin = false,
  onOpenMobileMenu,
}: {
  categories?: Category[];
  userEmail?: string | null;
  isAdmin?: boolean;
  onOpenMobileMenu?: () => void;
}) {
  const router = useRouter();
  const { cartCount, cartSubtotal, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <header className="bg-white border-b border-[#e1e1e1] sticky top-0 z-40 shadow-xs">
      <div className="container-custom">
        <div className="flex items-center justify-between h-[76px] gap-4 lg:gap-8">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded text-[#333] hover:text-[#1e5cea] hover:bg-[#f5f5f5] mobile-touch flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Wolmart-Style Clean Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col">
              <div className="flex items-center tracking-tighter font-black text-2xl text-[#222529]">
                BUYALL<span className="text-[#1e5cea]">GH</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#888] -mt-1">
                ONLINE STORE
              </span>
            </div>
          </Link>

          {/* Wolmart Unified Search Box (Desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-2xl items-center border-2 border-[#1e5cea] rounded-full overflow-hidden bg-white"
          >
            {/* Category Select Dropdown */}
            <div className="relative bg-[#f8f9fa] border-r border-[#e1e1e1] flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-[13px] font-medium text-[#444] py-2.5 pl-4 pr-7 focus:outline-hidden cursor-pointer appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#888] absolute right-2 pointer-events-none" />
            </div>

            {/* Query Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in 1,000+ quality physical products..."
              className="flex-1 bg-transparent px-4 py-2.5 text-[13px] text-[#222] placeholder:text-[#999] focus:outline-hidden"
            />

            {/* Search Submit Button */}
            <button
              type="submit"
              className="bg-[#1e5cea] hover:bg-[#1545b5] text-white px-6 py-3 transition-colors flex items-center justify-center shrink-0"
              aria-label="Search"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Action Links Cluster */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            {/* Customer Support Call (Wolmart Style) */}
            <div className="hidden xl:flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border border-[#e1e1e1] flex items-center justify-center text-[#1e5cea]">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] text-[#888] font-medium leading-none">CALL US NOW</span>
                <span className="text-[13px] font-bold text-[#222529] mt-0.5">+233 (0) 50 000 0000</span>
              </div>
            </div>

            {/* Mobile Search Button */}
            <Link
              href="/products"
              className="lg:hidden p-2 text-[#333] hover:text-[#1e5cea] mobile-touch flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="hidden sm:flex flex-col items-center justify-center text-[#333] hover:text-[#1e5cea] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-6 h-6 stroke-[1.8]" />
              <span className="text-[11px] font-medium mt-0.5 hidden md:block">Wishlist</span>
            </Link>

            {/* Account / User Menu */}
            <div className="relative">
              {userEmail ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded text-[#222] hover:text-[#1e5cea] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1e5cea] text-white font-bold text-xs flex items-center justify-center">
                      {userEmail[0].toUpperCase()}
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-[11px] text-[#888] font-medium leading-none">ACCOUNT</span>
                      <span className="text-[12px] font-bold text-[#222] truncate max-w-[90px]">
                        {userEmail.split('@')[0]}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888] hidden md:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      onClick={() => setIsUserMenuOpen(false)}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-xl border border-[#e1e1e1] py-1.5 z-50 text-[13px]"
                    >
                      <div className="px-4 py-2 border-b border-[#f1f1f1]">
                        <p className="text-[11px] text-[#999]">Signed in as</p>
                        <p className="font-bold text-[#222] truncate">{userEmail}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-[#1e5cea] font-bold hover:bg-[#f0f4fe]"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-[#444] hover:bg-[#f9f9f9] font-medium"
                      >
                        My Profile & Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 text-[#444] hover:bg-[#f9f9f9] font-medium"
                      >
                        My Wishlist
                      </Link>
                      <form action="/actions/auth" method="POST">
                        <button
                          formAction={async () => {
                            const { signOutAction } = await import('@/app/actions/auth');
                            await signOutAction();
                          }}
                          type="submit"
                          className="w-full text-left px-4 py-2 text-[#e53935] hover:bg-[#fff0f0] font-semibold border-t border-[#f1f1f1] mt-1"
                        >
                          Sign Out
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-[#333] hover:text-[#1e5cea] transition-colors"
                >
                  <User className="w-6 h-6 stroke-[1.8]" />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[11px] text-[#888] font-medium leading-none">SIGN IN</span>
                    <span className="text-[12px] font-bold text-[#222] mt-0.5">My Account</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Cart Button with Count Badge & Subtotal (Wolmart exact match) */}
            <button
              onClick={openCart}
              className="flex items-center gap-2.5 p-1 text-[#222] hover:text-[#1e5cea] transition-colors mobile-touch"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#f4f4f4] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#222529]" />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1e5cea] text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] text-[#888] font-medium leading-none">CART</span>
                <span className="text-[13px] font-bold text-[#222529] mt-0.5">
                  {formatGHS(cartSubtotal)}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

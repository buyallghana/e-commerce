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
  Sparkles,
  ChevronDown,
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 sm:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 touch-target flex items-center justify-center"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-md border border-slate-800">
              <span className="font-black text-amber-400 text-xl tracking-tighter">B</span>
              <span className="font-black text-white text-xl tracking-tighter">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-950 text-lg sm:text-xl tracking-tight leading-none">
                BuyAll <span className="text-amber-600">Ghana</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                Online Store
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar (Wolmart inspired high-converting bar) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl items-center rounded-xl border-2 border-slate-900 overflow-hidden bg-slate-50 shadow-xs focus-within:ring-2 focus-within:ring-amber-500/20"
          >
            {/* Category Select Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 py-3 pl-3 pr-8 border-r border-slate-200 focus:outline-hidden cursor-pointer shrink-0"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Query Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search genuine physical goods, shirts, electronics, beauty..."
              className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-slate-950 text-amber-400 px-5 py-3 hover:bg-slate-800 font-semibold transition-colors flex items-center justify-center shrink-0"
              aria-label="Search products"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Trigger Link */}
            <Link
              href="/products"
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg touch-target flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="hidden sm:flex p-2.5 text-slate-700 hover:text-amber-600 hover:bg-slate-50 rounded-xl transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* User Account / Sign In */}
            <div className="relative">
              {userEmail ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                      {userEmail[0].toUpperCase()}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-medium text-slate-500">Account</span>
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                        {userEmail.split('@')[0]}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      onClick={() => setIsUserMenuOpen(false)}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 text-sm"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="font-semibold text-slate-900 truncate">{userEmail}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-amber-600 font-semibold hover:bg-amber-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        My Profile & Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
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
                          className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium border-t border-slate-100 mt-1"
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
                  className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl text-slate-800 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors"
                >
                  <User className="w-5 h-5 text-slate-700" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition-all shadow-xs touch-target"
              aria-label="Open cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[10px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-extrabold">
                {formatGHS(cartSubtotal)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

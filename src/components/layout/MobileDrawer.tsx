'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/types/database';
import { X, LayoutGrid, Heart, ShoppingBag, User, ShieldCheck, ChevronRight } from 'lucide-react';

export default function MobileDrawer({
  isOpen,
  onClose,
  categories = [],
  userEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories?: Category[];
  userEmail?: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-12">
        <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">
                BA
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                BuyAll <span className="text-amber-400">Ghana</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status */}
          <div className="p-4 bg-amber-50/70 border-b border-amber-100/60 flex items-center justify-between">
            {userEmail ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {userEmail[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium">Signed in</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{userEmail}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-medium text-slate-600">Welcome to BuyAll Ghana</span>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="text-xs font-bold text-amber-700 bg-amber-200/60 px-2.5 py-1 rounded-md"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Departments
              </p>
              <div className="space-y-1">
                <Link
                  href="/products"
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg text-slate-800 font-semibold text-sm hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutGrid className="w-4 h-4 text-amber-600" />
                    All Products
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Account & Shortcuts
              </p>
              <div className="space-y-1">
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  Wishlist
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  Cart
                </Link>
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-slate-700 font-medium text-sm hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-700" />
                  My Orders & Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Nationwide Ghana delivery with Paystack escrow protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

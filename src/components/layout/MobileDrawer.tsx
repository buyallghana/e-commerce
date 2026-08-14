'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/types/database';
import { X, ChevronRight, Heart, ShoppingBag, User, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-2xs transition-opacity"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pr-12">
        <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#222529] text-white flex items-center justify-between">
            <div className="font-black text-lg tracking-tight">
              BUYALL<span className="text-[#1e5cea]">GH</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#aaa] hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Sign In Strip */}
          <div className="p-3 bg-[#f5f5f5] border-b border-[#e1e1e1] flex items-center justify-between text-[12px]">
            {userEmail ? (
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-full bg-[#1e5cea] text-white font-bold flex items-center justify-center text-[10px]">
                  {userEmail[0].toUpperCase()}
                </div>
                <span className="font-bold text-[#222] truncate">{userEmail}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-[#666]">Welcome Visitor</span>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="font-bold text-[#1e5cea] hover:underline"
                >
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <p className="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-2">
                Departments
              </p>
              <div className="divide-y divide-[#f5f5f5] text-[13px]">
                <Link
                  href="/products"
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 font-bold text-[#1e5cea]"
                >
                  <span>All Catalog Goods</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between py-2.5 font-medium text-[#333] hover:text-[#1e5cea]"
                  >
                    <span>{c.name}</span>
                    <ChevronRight className="w-4 h-4 text-[#bbb]" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-2">
                Customer Links
              </p>
              <div className="space-y-1 text-[13px]">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center gap-2.5 py-2 text-[#444] hover:text-[#1e5cea]"
                >
                  <User className="w-4 h-4 text-[#666]" />
                  <span>My Profile & Orders</span>
                </Link>
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center gap-2.5 py-2 text-[#444] hover:text-[#1e5cea]"
                >
                  <Heart className="w-4 h-4 text-[#e53935]" />
                  <span>Saved Wishlist</span>
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center gap-2.5 py-2 text-[#444] hover:text-[#1e5cea]"
                >
                  <ShoppingBag className="w-4 h-4 text-[#1e5cea]" />
                  <span>Shopping Cart</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 border-t border-[#e1e1e1] bg-[#f9f9f9] text-[11px] text-[#666] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00d084] shrink-0" />
            <span>Fast Ghana delivery & Paystack escrow</span>
          </div>
        </div>
      </div>
    </div>
  );
}

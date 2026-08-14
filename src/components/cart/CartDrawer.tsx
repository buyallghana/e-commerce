'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatGHS } from '@/lib/utils';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { cart, cartCount, cartSubtotal, isCartOpen, closeCart, updateQuantity, removeItem } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-slate-900 text-lg">Your Cart</h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Your cart is empty</h3>
                <p className="text-sm text-slate-500 max-w-xs mb-6">
                  Browse our catalog of quality goods and add your favorite items to cart.
                </p>
                <button
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors"
                >
                  <Link href="/products">Start Shopping</Link>
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const product = item.variant?.product;
                const variant = item.variant;
                const price =
                  variant?.price_override !== null && variant?.price_override !== undefined
                    ? Number(variant.price_override)
                    : Number(product?.base_price || 0);
                const image = variant?.image_url || product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';

                return (
                  <div key={item.id} className="py-4 flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                      <Image
                        src={image}
                        alt={product?.title || 'Product'}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${product?.slug}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-slate-900 hover:text-amber-600 transition-colors line-clamp-1"
                        >
                          {product?.title}
                        </Link>
                        {variant?.title && variant.title !== 'Standard' && (
                          <p className="text-xs text-slate-500 mt-0.5">{variant.title}</p>
                        )}
                        <p className="text-sm font-bold text-slate-900 mt-1">{formatGHS(price)}</p>
                      </div>

                      {/* Stepper & Delete */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 text-base">{formatGHS(cartSubtotal)}</span>
                </div>
                <p className="text-xs text-slate-500">Shipping calculated at checkout by delivery region.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full text-center py-2.5 px-4 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 shadow-sm transition-colors"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

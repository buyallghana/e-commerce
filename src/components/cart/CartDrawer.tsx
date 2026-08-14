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
        className="absolute inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#e1e1e1] flex items-center justify-between bg-[#f8f9fa]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1e5cea]" />
              <h2 className="font-bold text-[#222] text-[15px]">Shopping Cart</h2>
              <span className="bg-[#1e5cea] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1 text-[#888] hover:text-[#222] rounded transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#f1f1f1]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-14 h-14 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-3 text-[#999]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-[#222] text-[15px] mb-1">Your cart is empty</h3>
                <p className="text-[12px] text-[#777] max-w-xs mb-5">
                  Browse our catalog and add items to your cart.
                </p>
                <button
                  onClick={closeCart}
                  className="px-5 py-2 rounded bg-[#1e5cea] text-white font-bold text-[12px] hover:bg-[#1545b5] transition-colors"
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
                const image =
                  variant?.image_url ||
                  product?.images?.[0] ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';

                return (
                  <div key={item.id} className="py-3.5 flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="relative w-18 h-18 rounded bg-[#f9f9f9] overflow-hidden shrink-0 border border-[#e1e1e1]">
                      <Image
                        src={image}
                        alt={product?.title || 'Product'}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${product?.slug}`}
                          onClick={closeCart}
                          className="text-[13px] font-semibold text-[#222] hover:text-[#1e5cea] transition-colors line-clamp-1"
                        >
                          {product?.title}
                        </Link>
                        {variant?.title && variant.title !== 'Standard' && (
                          <p className="text-[11px] text-[#888] mt-0.5">{variant.title}</p>
                        )}
                        <p className="text-[13px] font-bold text-[#1e5cea] mt-1">{formatGHS(price)}</p>
                      </div>

                      {/* Stepper & Delete */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#ddd] rounded bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-[#f5f5f5] text-[#555]"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-[12px] font-bold text-[#222]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-[#f5f5f5] text-[#555]"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-[#999] hover:text-[#e53935] transition-colors"
                          aria-label="Remove"
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

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-[#e1e1e1] bg-[#fdfdfd] space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="font-semibold text-[#555]">Subtotal:</span>
                <span className="font-bold text-[#222529] text-[16px]">{formatGHS(cartSubtotal)}</span>
              </div>
              <p className="text-[11px] text-[#888]">Shipping & discounts calculated at checkout.</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full text-center py-2.5 px-3 rounded border border-[#222] bg-white text-[#222] font-bold text-[12px] uppercase hover:bg-[#f5f5f5] transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded bg-[#1e5cea] text-white font-bold text-[12px] uppercase hover:bg-[#1545b5] transition-colors shadow-2xs"
                >
                  Checkout <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

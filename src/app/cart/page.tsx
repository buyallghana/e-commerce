'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StoreShell from '@/components/layout/StoreShell';
import { useCart } from '@/context/CartContext';
import { formatGHS } from '@/lib/utils';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, ChevronRight } from 'lucide-react';

export default function CartPage() {
  const { cart, cartCount, cartSubtotal, updateQuantity, removeItem } = useCart();

  return (
    <StoreShell>
      {/* Breadcrumbs */}
      <div className="bg-[#f5f5f5] border-b border-[#e1e1e1] py-2.5">
        <div className="container-custom flex items-center gap-2 text-[12px] text-[#666]">
          <Link href="/" className="hover:text-[#1e5cea]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
          <span className="font-bold text-[#222]">Shopping Cart</span>
        </div>
      </div>

      <div className="container-custom py-8">
        <h1 className="text-[22px] font-bold text-[#222529] mb-6">Shopping Cart ({cartCount} items)</h1>

        {cart.length === 0 ? (
          <div className="bg-white border border-[#e1e1e1] rounded-md p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto text-[#999]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-[18px] font-bold text-[#222]">Your Cart is Currently Empty</h2>
            <p className="text-[13px] text-[#666] max-w-sm mx-auto">
              Before you proceed to checkout you must add some products to your shopping cart.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#1e5cea] hover:bg-[#1545b5] text-white font-bold text-[13px] px-6 py-3 rounded uppercase tracking-wider transition-colors"
            >
              Return to Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Cols: Items Table */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-[#e1e1e1] rounded-md overflow-hidden shadow-2xs">
                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-12 gap-4 p-3.5 bg-[#f8f9fa] border-b border-[#e1e1e1] text-[12px] font-bold text-[#444] uppercase">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-[#f1f1f1]">
                  {cart.map((item) => {
                    const product = item.variant?.product;
                    const variant = item.variant;
                    const price =
                      variant?.price_override !== null && variant?.price_override !== undefined
                        ? Number(variant.price_override)
                        : Number(product?.base_price || 0);
                    const itemTotal = price * item.quantity;
                    const image =
                      variant?.image_url ||
                      product?.images?.[0] ||
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';

                    return (
                      <div key={item.id} className="p-4 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-6 flex items-center gap-3.5 w-full">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#999] hover:text-[#e53935] p-1 transition-colors"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="relative w-16 h-16 rounded bg-[#f9f9f9] overflow-hidden shrink-0 border border-[#e1e1e1]">
                            <Image src={image} alt={product?.title || ''} fill className="object-cover" sizes="64px" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${product?.slug}`}
                              className="text-[13px] font-bold text-[#222] hover:text-[#1e5cea] transition-colors line-clamp-1"
                            >
                              {product?.title}
                            </Link>
                            {variant?.title && variant.title !== 'Standard' && (
                              <span className="text-[11px] text-[#888] block">{variant.title}</span>
                            )}
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="col-span-2 text-center text-[13px] font-semibold text-[#555]">
                          {formatGHS(price)}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="col-span-2 flex justify-center">
                          <div className="flex items-center border border-[#ddd] rounded bg-white overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-[#f5f5f5] text-[#555]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-[12px] font-bold text-[#222]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-[#f5f5f5] text-[#555]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-2 text-right text-[14px] font-bold text-[#1e5cea]">
                          {formatGHS(itemTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Order Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-[#e1e1e1] rounded-md p-5 shadow-2xs space-y-4">
                <h3 className="font-bold text-[15px] text-[#222] uppercase tracking-wider pb-3 border-b border-[#f1f1f1]">
                  Cart Totals
                </h3>

                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between text-[#555]">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-[#222]">{formatGHS(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#555]">
                    <span>Shipping Estimate:</span>
                    <span className="text-[#888]">Calculated at checkout</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f1f1f1] flex justify-between items-baseline">
                  <span className="font-bold text-[15px] text-[#222]">Total (GHS):</span>
                  <span className="font-black text-[22px] text-[#1e5cea]">{formatGHS(cartSubtotal)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-4 rounded bg-[#1e5cea] hover:bg-[#1545b5] text-white font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#777] pt-2">
                  <ShieldCheck className="w-4 h-4 text-[#00d084]" />
                  <span>Secure Paystack Checkout (MoMo & Cards)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreShell>
  );
}

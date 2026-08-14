'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';
import { formatGHS } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { toggleWishlistAction } from '@/app/actions/cart';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, isLoading } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const defaultVariant = product.variants?.[0];
  const price = Number(defaultVariant?.price_override ?? product.base_price);
  const originalPrice = Math.round(price * 1.2); // Original price markup display for deal effect
  const image =
    product.images?.[0] ||
    defaultVariant?.image_url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.is_variant_product && product.variants && product.variants.length > 1) {
      window.location.href = `/products/${product.slug}`;
      return;
    }

    if (defaultVariant) {
      setIsAdding(true);
      const res = await addToCart(defaultVariant.id, 1);
      setIsAdding(false);
      if (res.success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggleWishlistAction(product.id);
    if (res.isWishlisted !== undefined) {
      setIsWishlisted(res.isWishlisted);
    }
  };

  return (
    <div className="group bg-white rounded-md border border-[#e1e1e1] hover:border-[#1e5cea] transition-all duration-200 flex flex-col overflow-hidden relative product-card-hover">
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {isOutOfStock ? (
          <span className="bg-[#222529] text-white text-[10px] font-bold px-2 py-0.5 rounded">
            SOLD OUT
          </span>
        ) : isLowStock ? (
          <span className="bg-[#e53935] text-white text-[10px] font-bold px-2 py-0.5 rounded">
            ONLY {totalStock} LEFT
          </span>
        ) : (
          <span className="bg-[#1e5cea] text-white text-[10px] font-bold px-2 py-0.5 rounded">
            SAVE 15%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 border border-[#e1e1e1] text-[#666] hover:text-[#e53935] hover:border-[#e53935] flex items-center justify-center transition-colors shadow-2xs"
        aria-label="Wishlist"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? 'fill-[#e53935] text-[#e53935]' : ''
          }`}
        />
      </button>

      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square bg-[#f9f9f9] overflow-hidden block border-b border-[#f1f1f1]"
      >
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
      </Link>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Category */}
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-[11px] font-semibold uppercase tracking-wider text-[#999] hover:text-[#1e5cea] transition-colors block mb-1"
            >
              {product.category.name}
            </Link>
          )}

          {/* Product Title */}
          <Link
            href={`/products/${product.slug}`}
            className="font-semibold text-[13px] sm:text-[14px] text-[#333] hover:text-[#1e5cea] transition-colors line-clamp-2 leading-snug"
          >
            {product.title}
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex text-[#ff9933]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#ff9933] text-[#ff9933]" />
              ))}
            </div>
            <span className="text-[11px] text-[#999] font-medium">(5.0)</span>
          </div>
        </div>

        {/* Price & Add to Cart Row */}
        <div className="pt-2 border-t border-[#f1f1f1] flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] sm:text-[16px] font-bold text-[#1e5cea]">
                {formatGHS(price)}
              </span>
              <span className="text-[11px] text-[#999] line-through font-normal">
                {formatGHS(originalPrice)}
              </span>
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding || isLoading}
            className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              isOutOfStock
                ? 'bg-[#eee] text-[#999] cursor-not-allowed'
                : justAdded
                ? 'bg-[#00d084] text-white'
                : 'bg-[#222529] hover:bg-[#1e5cea] text-white'
            }`}
            aria-label="Add to cart"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{product.is_variant_product ? 'Select' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

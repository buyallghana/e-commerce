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
  const price = defaultVariant?.price_override ?? product.base_price;
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
      // Direct user to product page to select size/color variant
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
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs flex items-center justify-center transition-colors"
        aria-label="Save to Wishlist"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
          }`}
        />
      </button>

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {isOutOfStock ? (
          <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            Only {totalStock} Left
          </span>
        ) : product.is_variant_product ? (
          <span className="bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
            Multiple Options
          </span>
        ) : null}
      </div>

      {/* Image Link */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square bg-slate-100 overflow-hidden block"
      >
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
      </Link>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category */}
          {product.category && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <Link
            href={`/products/${product.slug}`}
            className="font-bold text-sm text-slate-900 hover:text-amber-600 transition-colors line-clamp-2 leading-snug"
          >
            {product.title}
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              (5.0)
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Price</span>
            <span className="text-base font-extrabold text-slate-950">
              {formatGHS(Number(price))}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding || isLoading}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs touch-target ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-amber-600 text-white hover:text-slate-950'
            }`}
            aria-label={product.is_variant_product ? 'Select options' : 'Add to cart'}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{product.is_variant_product ? 'Options' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

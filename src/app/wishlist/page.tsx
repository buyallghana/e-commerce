'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StoreShell from '@/components/layout/StoreShell';
import { getWishlist, toggleWishlistAction } from '@/app/actions/cart';
import { useCart } from '@/context/CartContext';
import { formatGHS } from '@/lib/utils';
import { Product } from '@/types/database';
import { Heart, ShoppingBag, Trash2, ChevronRight } from 'lucide-react';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadWishlist() {
      try {
        const items = await getWishlist();
        setWishlistProducts(items);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
    await toggleWishlistAction(productId);
  };

  const handleMoveToCart = async (product: Product) => {
    const variant = product.variants?.[0];
    if (variant) {
      await addToCart(variant.id, 1);
    }
  };

  return (
    <StoreShell>
      {/* Breadcrumbs */}
      <div className="bg-[#f5f5f5] border-b border-[#e1e1e1] py-2.5">
        <div className="container-custom flex items-center gap-2 text-[12px] text-[#666]">
          <Link href="/" className="hover:text-[#1e5cea]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
          <span className="font-bold text-[#222]">My Wishlist</span>
        </div>
      </div>

      <div className="container-custom py-8">
        <h1 className="text-[22px] font-bold text-[#222529] mb-6">
          My Saved Wishlist ({wishlistProducts.length})
        </h1>

        {loading ? (
          <div className="text-center py-12 text-[#666] text-[13px]">Loading saved items...</div>
        ) : wishlistProducts.length === 0 ? (
          <div className="bg-white border border-[#e1e1e1] rounded-md p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto text-[#999]">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-[18px] font-bold text-[#222]">Your Wishlist is Empty</h2>
            <p className="text-[13px] text-[#666] max-w-sm mx-auto">
              Explore products in our catalog and click the heart icon to save your favorites here.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#1e5cea] text-white font-bold text-[13px] px-6 py-2.5 rounded uppercase tracking-wider hover:bg-[#1545b5]"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#e1e1e1] rounded-md overflow-hidden shadow-2xs">
            <div className="divide-y divide-[#f1f1f1]">
              {wishlistProducts.map((p) => {
                const price = Number(p.variants?.[0]?.price_override ?? p.base_price);
                const image = p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';

                return (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-16 h-16 rounded bg-[#f9f9f9] overflow-hidden shrink-0 border border-[#e1e1e1]">
                        <Image src={image} alt={p.title} fill className="object-cover" sizes="64px" />
                      </div>
                      <div>
                        <Link href={`/products/${p.slug}`} className="font-bold text-[14px] text-[#222] hover:text-[#1e5cea]">
                          {p.title}
                        </Link>
                        <p className="font-bold text-[14px] text-[#1e5cea] mt-0.5">{formatGHS(price)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleMoveToCart(p)}
                        className="px-4 py-2 bg-[#1e5cea] hover:bg-[#1545b5] text-white font-bold text-[12px] rounded flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="p-2 text-[#999] hover:text-[#e53935] border border-[#e1e1e1] rounded"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StoreShell>
  );
}

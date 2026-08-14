'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant, ShippingZone } from '@/types/database';
import { formatGHS, formatWeight } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { toggleWishlistAction } from '@/app/actions/cart';
import { submitReviewAction } from '@/app/actions/reviews';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  MessageSquarePlus,
  Lock,
} from 'lucide-react';

export default function ProductDetailClient({
  product,
  shippingZones = [],
  userEmail,
}: {
  product: Product;
  shippingZones?: ShippingZone[];
  userEmail?: string | null;
}) {
  const router = useRouter();
  const { addToCart, isLoading: isCartGlobalLoading } = useCart();

  const variants = useMemo(() => product.variants || [], [product.variants]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants[0] || null
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] ||
      variants[0]?.image_url ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  // Regional Shipping Calculator
  const [selectedRegion, setSelectedRegion] = useState<string>(
    shippingZones[0]?.regions[0] || 'Greater Accra'
  );

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  const currentPrice = Number(
    selectedVariant?.price_override !== null && selectedVariant?.price_override !== undefined
      ? selectedVariant.price_override
      : product.base_price
  );
  const originalPrice = Math.round(currentPrice * 1.2);

  const stock = selectedVariant?.stock_quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= (selectedVariant?.low_stock_threshold || 5);
  const currentWeight = Number(selectedVariant?.weight_kg ?? product.weight_kg ?? 0.5);

  const matchedZone = shippingZones.find((z) =>
    z.regions.some((r) => r.toLowerCase().includes(selectedRegion.toLowerCase()))
  );
  const estimatedShippingFee = matchedZone?.rates?.[0]?.base_fee ?? 25;
  const estimatedDays = matchedZone?.rates?.[0]?.estimated_days ?? '1-2 business days';

  const handleAddToCart = async (openCheckout = false) => {
    if (!selectedVariant || isOutOfStock) return;
    setIsAdding(true);
    const res = await addToCart(selectedVariant.id, quantity);
    setIsAdding(false);

    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      if (openCheckout) {
        router.push('/checkout');
      }
    }
  };

  const handleToggleWishlist = async () => {
    const res = await toggleWishlistAction(product.id);
    if (res.isWishlisted !== undefined) {
      setIsWishlisted(res.isWishlisted);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewFeedback(null);

    const res = await submitReviewAction({
      productId: product.id,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });

    setReviewSubmitting(false);
    if (res.error) {
      setReviewFeedback(res.error);
    } else {
      setReviewFeedback('Review submitted successfully!');
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewFeedback(null);
        setReviewComment('');
        setReviewTitle('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Product Summary Box (Wolmart Product Single Layout) */}
      <div className="bg-white border border-[#e1e1e1] rounded-md p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-square rounded-md overflow-hidden bg-[#fafafa] border border-[#e1e1e1]">
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-18 h-18 rounded border-2 overflow-hidden bg-[#f9f9f9] shrink-0 transition-all ${
                      selectedImage === imgUrl ? 'border-[#1e5cea]' : 'border-[#e1e1e1]'
                    }`}
                  >
                    <Image src={imgUrl} alt="" fill className="object-cover" sizes="72px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Buying Information & Action Panel */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-[11px] font-bold uppercase tracking-wider text-[#1e5cea] hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-[20px] sm:text-[24px] font-bold text-[#222529] mt-1 leading-snug">
                {product.title}
              </h1>

              {/* Star Rating & SKU */}
              <div className="flex items-center gap-3 mt-2 text-[12px] text-[#777]">
                <div className="flex text-[#ff9933]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#ff9933] text-[#ff9933]" />
                  ))}
                </div>
                <span>(5.0 customer reviews)</span>
                <span>•</span>
                <span>SKU: <strong>{selectedVariant?.sku || 'N/A'}</strong></span>
              </div>
            </div>

            {/* Price Box */}
            <div className="py-3 border-y border-[#f1f1f1] flex items-baseline gap-3">
              <span className="text-[26px] sm:text-[30px] font-black text-[#1e5cea]">
                {formatGHS(currentPrice)}
              </span>
              <span className="text-[16px] text-[#999] line-through font-normal">
                {formatGHS(originalPrice)}
              </span>
              <span className="bg-[#e53935]/10 text-[#e53935] border border-[#e53935]/20 font-bold text-[11px] px-2 py-0.5 rounded">
                SAVE 15%
              </span>
            </div>

            {/* Stock Status Badge */}
            <div className="text-[13px]">
              {isOutOfStock ? (
                <span className="font-bold text-[#e53935]">● Currently Sold Out</span>
              ) : isLowStock ? (
                <span className="font-bold text-[#ff9933]">● Low Stock: Only {stock} units left!</span>
              ) : (
                <span className="font-bold text-[#00d084]">● In Stock ({stock} units available)</span>
              )}
            </div>

            {/* Variants Selector */}
            {variants.length > 1 && (
              <div className="space-y-2 pt-1">
                <label className="text-[12px] font-bold text-[#333] uppercase block">
                  Select Size / Style:
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vStock = v.stock_quantity;
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariant(v);
                          if (v.image_url) setSelectedImage(v.image_url);
                          setQuantity(1);
                        }}
                        disabled={vStock <= 0}
                        className={`px-3 py-2 rounded text-[12px] font-bold border transition-all ${
                          isSelected
                            ? 'border-[#1e5cea] bg-[#1e5cea] text-white'
                            : vStock <= 0
                            ? 'border-[#e1e1e1] bg-[#f5f5f5] text-[#aaa] cursor-not-allowed'
                            : 'border-[#e1e1e1] bg-white text-[#333] hover:border-[#999]'
                        }`}
                      >
                        {v.title} {vStock <= 0 ? '(Sold Out)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stepper + Add To Cart + Buy Now */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#e1e1e1] rounded bg-white overflow-hidden shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2.5 hover:bg-[#f5f5f5] text-[#555] disabled:opacity-40"
                    aria-label="Minus"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3.5 text-[13px] font-bold text-[#222]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock || isOutOfStock}
                    className="p-2.5 hover:bg-[#f5f5f5] text-[#555] disabled:opacity-40"
                    aria-label="Plus"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={isOutOfStock || isAdding || isCartGlobalLoading}
                  className={`flex-1 py-3 px-6 rounded font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-2xs ${
                    isOutOfStock
                      ? 'bg-[#eee] text-[#999] cursor-not-allowed'
                      : justAdded
                      ? 'bg-[#00d084] text-white'
                      : 'bg-[#1e5cea] hover:bg-[#1545b5] text-white'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={handleToggleWishlist}
                  className="p-3 rounded border border-[#e1e1e1] text-[#666] hover:text-[#e53935] hover:border-[#e53935] transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#e53935] text-[#e53935]' : ''}`} />
                </button>
              </div>

              {/* Instant Buy Now Button */}
              {!isOutOfStock && (
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={isAdding || isCartGlobalLoading}
                  className="w-full py-3 px-6 rounded bg-[#222529] hover:bg-[#333] text-white font-bold text-[13px] uppercase tracking-wider transition-colors shadow-2xs"
                >
                  Buy Now with Paystack (GHS)
                </button>
              )}
            </div>

            {/* Regional Delivery Estimator Tool */}
            <div className="bg-[#f9f9f9] border border-[#e1e1e1] rounded-md p-3.5 space-y-2 text-[12px]">
              <div className="flex items-center gap-2 text-[#222] font-bold">
                <Truck className="w-4 h-4 text-[#1e5cea]" />
                <span>Estimated Doorstep Delivery</span>
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-white border border-[#ccc] rounded py-1.5 px-2.5 text-[12px] font-medium text-[#333] focus:outline-hidden"
              >
                <option value="Greater Accra">Greater Accra Region (Accra, Tema, Madina)</option>
                <option value="Ashanti">Ashanti Region (Kumasi, Obuasi)</option>
                <option value="Western">Western & Central (Takoradi, Cape Coast)</option>
                <option value="Eastern">Eastern & Volta (Koforidua, Ho)</option>
                <option value="Northern">Northern Belt (Tamale, Wa, Bolga)</option>
              </select>
              <div className="flex items-center justify-between pt-1 border-t border-[#e8e8e8] text-[#555]">
                <span>Shipping Fee:</span>
                <span className="font-bold text-[#222]">
                  {formatGHS(Number(estimatedShippingFee))} ({estimatedDays})
                </span>
              </div>
            </div>

            {/* Guarantee Tag */}
            <div className="flex items-center gap-2 text-[12px] text-[#666] pt-2">
              <Lock className="w-3.5 h-3.5 text-[#00d084]" />
              <span>Guaranteed safe & secure checkout powered by Paystack</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Shipping & Reviews */}
      <div className="bg-white border border-[#e1e1e1] rounded-md p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-bold text-[16px] text-[#222] border-b border-[#e1e1e1] pb-2.5 mb-3">
            Product Description & Specifications
          </h3>
          <p className="text-[13px] text-[#555] leading-relaxed max-w-3xl">
            {product.description || 'Quality handcrafted physical good backed by single-vendor assurance.'}
          </p>
        </div>

        {/* Reviews */}
        <div className="pt-4 border-t border-[#e1e1e1]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[16px] text-[#222]">Customer Reviews</h3>
            {product.reviews_enabled && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1e5cea] text-white text-[12px] font-bold rounded hover:bg-[#1545b5]"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Write Review</span>
              </button>
            )}
          </div>

          <div className="bg-[#f9f9f9] border border-[#e1e1e1] p-4 rounded-md space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[13px] text-[#222]">Kofi A. (Accra)</span>
              <span className="bg-[#00d084]/15 text-[#008f5a] font-bold text-[10px] px-1.5 py-0.2 rounded">
                Verified Buyer
              </span>
            </div>
            <div className="flex text-[#ff9933]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#ff9933] text-[#ff9933]" />
              ))}
            </div>
            <p className="text-[12px] text-[#555] mt-1">
              Top quality material, well packaged, and arrived right on schedule!
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-md max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-2">
              <h3 className="font-bold text-[#222] text-[15px]">Write a Customer Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-[#999] hover:text-[#222]">
                ✕
              </button>
            </div>

            {!userEmail ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-[13px] text-[#666]">Please sign in to submit your review.</p>
                <Link href="/login" className="inline-block bg-[#1e5cea] text-white font-bold text-[12px] px-4 py-2 rounded">
                  Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3 text-[12px]">
                <div>
                  <label className="font-bold text-[#333] block mb-1">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'fill-[#ff9933] text-[#ff9933]' : 'text-[#ccc]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#333] block mb-1">Title</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Great quality!"
                    className="w-full border border-[#ccc] rounded p-2 text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#333] block mb-1">Feedback *</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your feedback..."
                    className="w-full border border-[#ccc] rounded p-2 text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                  />
                </div>

                {reviewFeedback && (
                  <p className="text-[12px] font-semibold text-[#1e5cea] bg-[#f0f4fe] p-2 rounded">
                    {reviewFeedback}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-3 py-1.5 border border-[#ccc] rounded text-[#444] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-4 py-1.5 bg-[#1e5cea] text-white font-bold rounded hover:bg-[#1545b5]"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

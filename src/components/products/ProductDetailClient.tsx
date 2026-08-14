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
  AlertTriangle,
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

  // Shipping Estimator State
  const [selectedRegion, setSelectedRegion] = useState<string>(
    shippingZones[0]?.regions[0] || 'Greater Accra'
  );

  // Review Form Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  // Price & Stock calculations
  const currentPrice =
    selectedVariant?.price_override !== null && selectedVariant?.price_override !== undefined
      ? Number(selectedVariant.price_override)
      : Number(product.base_price);

  const stock = selectedVariant?.stock_quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= (selectedVariant?.low_stock_threshold || 5);
  const currentWeight = Number(selectedVariant?.weight_kg ?? product.weight_kg ?? 0.5);

  // Estimated shipping fee for selected region
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
    <div className="space-y-12">
      {/* Top Product Hero: Gallery + Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square sm:aspect-4/3 rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xs">
            <Image
              src={selectedImage}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {isOutOfStock ? (
                <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-md">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="bg-amber-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Only {stock} Left in Stock
                </span>
              ) : (
                <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  In Stock ({stock} available)
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleToggleWishlist}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/95 text-slate-700 hover:text-rose-600 shadow-md flex items-center justify-center transition-colors"
              aria-label="Save to wishlist"
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white border-2 shrink-0 transition-all ${
                    selectedImage === imgUrl ? 'border-amber-500 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <Image src={imgUrl} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Buying Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-xs font-extrabold uppercase tracking-wider text-amber-700 hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
              {product.title}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-bold text-slate-900 ml-1">5.0</span>
              </div>
              <span>•</span>
              <span>SKU: {selectedVariant?.sku || 'N/A'}</span>
              <span>•</span>
              <span>Weight: {formatWeight(currentWeight)}</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Price in GHS</span>
              <span className="text-3xl font-black text-amber-400">{formatGHS(currentPrice)}</span>
            </div>
            <div className="text-right">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-md">
                Verified In-Stock
              </span>
            </div>
          </div>

          {/* Variant Selector (if product has multiple variants) */}
          {variants.length > 1 && (
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                Select Option / Variant:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const vStock = v.stock_quantity;
                  const vPrice = v.price_override ? Number(v.price_override) : product.base_price;

                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        if (v.image_url) setSelectedImage(v.image_url);
                        setQuantity(1);
                      }}
                      disabled={vStock <= 0}
                      className={`p-3 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                          : vStock <= 0
                          ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        {v.title}
                      </span>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="font-extrabold text-slate-700">{formatGHS(vPrice)}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            vStock <= 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          {vStock <= 0 ? 'Sold out' : `${vStock} left`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white overflow-hidden shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-3 hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-extrabold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock || isOutOfStock}
                  className="p-3 hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(false)}
                disabled={isOutOfStock || isAdding || isCartGlobalLoading}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all touch-target ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 hover:bg-slate-800 text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Buy Now Button */}
            {!isOutOfStock && (
              <button
                onClick={() => handleAddToCart(true)}
                disabled={isAdding || isCartGlobalLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all shadow-md touch-target flex items-center justify-center gap-2"
              >
                <span>Buy Now with Paystack</span>
              </button>
            )}
          </div>

          {/* Regional Shipping Calculator Preview */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Regional Delivery Estimate (Ghana)</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden"
              >
                <option value="Greater Accra">Greater Accra Region (Accra, Tema, Madina)</option>
                <option value="Ashanti">Ashanti Region (Kumasi, Obuasi)</option>
                <option value="Western">Western & Central (Takoradi, Cape Coast)</option>
                <option value="Eastern">Eastern & Volta (Koforidua, Ho)</option>
                <option value="Northern">Northern Belt (Tamale, Wa, Bolga)</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
              <span>Estimated Delivery Fee:</span>
              <span className="font-extrabold text-slate-900">
                {formatGHS(Number(estimatedShippingFee))} ({estimatedDays})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description & Guarantee Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-950 mb-3">Product Description & Specs</h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {product.description ||
              'Handcrafted with meticulous attention to detail. Built to provide supreme satisfaction and long-lasting durability.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Genuine Guarantee</h4>
              <p className="text-[11px] text-slate-500">Inspected directly at our Accra fulfillment center.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Nationwide Dispatch</h4>
              <p className="text-[11px] text-slate-500">Direct courier tracking to your doorstep or digital address.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">7-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-500">Hassle-free return request from your customer order history.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">Customer Reviews & Ratings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified feedback from customers across Ghana.
            </p>
          </div>

          {product.reviews_enabled ? (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-400" />
              <span>Write a Review</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              Reviews currently closed for this item
            </span>
          )}
        </div>

        {/* Sample Verified Reviews List */}
        <div className="divide-y divide-slate-100">
          <div className="py-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Kofi A. (Accra)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Verified Buyer
                </span>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-800">Excellent quality and swift delivery!</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Arrived within 24 hours in East Legon. The material is genuine and sizing is accurate.
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal Form */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Write a Customer Review</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {!userEmail ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-slate-600">Please sign in to post your review.</p>
                <Link
                  href="/login"
                  className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Review Headline</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Great quality and fast shipping"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Feedback *</label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about the fit, material quality, packaging..."
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                {reviewFeedback && (
                  <p className="text-xs font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-lg">
                    {reviewFeedback}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
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

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StoreShell from '@/components/layout/StoreShell';
import { useCart } from '@/context/CartContext';
import { createCheckoutOrderAction, checkCouponAction } from '@/app/actions/checkout';
import { formatGHS } from '@/lib/utils';
import { MapPin, ShieldCheck, ArrowRight, ChevronRight } from 'lucide-react';

const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Oti',
  'Savannah',
  'North East',
  'Western North',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, cartSubtotal } = useCart();

  // Address State
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [region, setRegion] = useState('Greater Accra');
  const [city, setCity] = useState('Accra');
  const [addressLine, setAddressLine] = useState('');
  const [gpsAddress, setGpsAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<string | null>(null);

  // Submitting
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shippingFee = region === 'Greater Accra' ? 25 : region === 'Ashanti' ? 35 : 45;
  const grandTotal = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponStatus(null);
    if (!couponCode.trim()) return;

    const res = await checkCouponAction(couponCode.trim(), cartSubtotal);

    if (res.valid && res.discountAmount) {
      setDiscountAmount(res.discountAmount);
      setCouponStatus(`Coupon applied! Saved ${formatGHS(res.discountAmount)}`);
    } else {
      setDiscountAmount(0);
      setCouponStatus(res.message || 'Invalid or expired coupon');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const res = await createCheckoutOrderAction({
      shippingAddress: {
        recipient_name: recipientName,
        phone_number: phoneNumber,
        region,
        city,
        address_line_1: addressLine,
        gps_address: gpsAddress || undefined,
        delivery_notes: deliveryNotes || undefined,
      },
      couponCode: couponCode.trim() || undefined,
    });

    setIsProcessing(false);

    if (res.unauthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    if (res.authorizationUrl) {
      window.location.href = res.authorizationUrl;
    }
  };

  if (cart.length === 0) {
    return (
      <StoreShell>
        <div className="container-custom py-12 text-center space-y-4">
          <h2 className="text-[20px] font-bold text-[#222]">Your Cart is Empty</h2>
          <p className="text-[13px] text-[#666]">Add some physical goods to your cart before proceeding to checkout.</p>
          <Link href="/products" className="inline-block bg-[#1e5cea] text-white font-bold text-[12px] px-6 py-2.5 rounded uppercase">
            Browse Catalog
          </Link>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      {/* Breadcrumbs */}
      <div className="bg-[#f5f5f5] border-b border-[#e1e1e1] py-2.5">
        <div className="container-custom flex items-center gap-2 text-[12px] text-[#666]">
          <Link href="/" className="hover:text-[#1e5cea]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
          <Link href="/cart" className="hover:text-[#1e5cea]">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
          <span className="font-bold text-[#222]">Checkout</span>
        </div>
      </div>

      <div className="container-custom py-8">
        <h1 className="text-[22px] font-bold text-[#222529] mb-6">Checkout & Payment</h1>

        {errorMessage && (
          <div className="p-3.5 bg-[#fff0f0] border border-[#f5c6cb] text-[#e53935] text-[13px] font-bold rounded mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Cols: Delivery Address Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#e1e1e1] rounded-md p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-[15px] text-[#222] uppercase tracking-wider pb-2.5 border-b border-[#f1f1f1] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1e5cea]" />
                <span>1. Delivery Details (Ghana)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div>
                  <label className="block font-bold text-[#333] mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Kwame Mensah"
                    className="w-full border border-[#ccc] rounded p-2.5 text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#333] mb-1">Phone Number (Courier) *</label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full border border-[#ccc] rounded p-2.5 text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#333] mb-1">Delivery Region *</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full border border-[#ccc] rounded p-2.5 text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                  >
                    {GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r} Region
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#333] mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Accra, Kumasi, Tema"
                    className="w-full border border-[#ccc] rounded p-2.5 text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#333] mb-1">Street Address / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="House No., Street Name, Near Landmark"
                    className="w-full border border-[#ccc] rounded p-2.5 text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#333] mb-1">GhanaPost GPS Address (Optional)</label>
                  <input
                    type="text"
                    value={gpsAddress}
                    onChange={(e) => setGpsAddress(e.target.value)}
                    placeholder="e.g. GA-183-9022"
                    className="w-full border border-[#ccc] rounded p-2.5 text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#333] mb-1">Courier Delivery Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Call when outside the gate"
                    className="w-full border border-[#ccc] rounded p-2.5 text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Order Summary & Paystack Action */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#e1e1e1] rounded-md p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-[15px] text-[#222] uppercase tracking-wider pb-2.5 border-b border-[#f1f1f1]">
                2. Order Summary
              </h3>

              {/* Coupon Code Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. WELCOME10)"
                    className="flex-1 border border-[#ccc] rounded px-3 py-2 text-[12px] text-[#222] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-[#222529] hover:bg-[#333] text-white px-4 py-2 rounded text-[12px] font-bold uppercase"
                  >
                    Apply
                  </button>
                </div>
                {couponStatus && (
                  <p className="text-[11px] font-semibold text-[#1e5cea]">{couponStatus}</p>
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="pt-2 border-t border-[#f1f1f1] space-y-2 text-[13px] text-[#555]">
                <div className="flex justify-between">
                  <span>Cart Items Subtotal ({cartCount}):</span>
                  <span className="font-bold text-[#222]">{formatGHS(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Regional Shipping ({region}):</span>
                  <span className="font-bold text-[#222]">{formatGHS(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#00d084] font-bold">
                    <span>Discount:</span>
                    <span>-{formatGHS(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-[#f1f1f1] flex justify-between items-baseline">
                <span className="font-bold text-[15px] text-[#222]">Total Due (GHS):</span>
                <span className="font-black text-[22px] text-[#1e5cea]">{formatGHS(grandTotal)}</span>
              </div>

              {/* Paystack CTA Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded bg-[#1e5cea] hover:bg-[#1545b5] text-white font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-2xs mt-2"
              >
                <span>{isProcessing ? 'Processing Paystack...' : 'Pay with Paystack'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-[#f1f1f1] space-y-1 text-center text-[11px] text-[#777]">
                <div className="flex items-center justify-center gap-1 text-[#00d084] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Encrypted & Verified via Paystack</span>
                </div>
                <p>Accepting MTN MoMo, Telecel Cash, AT Money, Visa & Mastercard</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </StoreShell>
  );
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateShippingFee, getActiveShippingZones } from '@/lib/data/shipping';
import { validateAndApplyCoupon, calculateAutomaticDiscounts } from '@/lib/data/discounts';
import { initializePaystackTransaction } from '@/lib/paystack';
import { generateOrderNumber } from '@/lib/utils';
import { CartItem } from '@/types/database';

export async function initiateCheckoutAction({
  addressId,
  couponCode,
  customerNotes,
}: {
  addressId: string;
  couponCode?: string;
  customerNotes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to complete checkout.' };
  }

  // 1. Fetch user's cart
  const { data: cartData, error: cartError } = await supabase
    .from('cart_items')
    .select(`
      *,
      variant:product_variants (
        *,
        product:products (*)
      )
    `)
    .eq('customer_id', user.id);

  if (cartError || !cartData || cartData.length === 0) {
    return { error: 'Your cart is empty.' };
  }

  const cartItems = cartData as unknown as CartItem[];

  // 2. Re-fetch current database variant stock & price (Server-side validation)
  const variantIds = cartItems.map((ci) => ci.variant_id);
  const { data: currentVariants, error: varError } = await supabase
    .from('product_variants')
    .select('*, product:products(*)')
    .in('id', variantIds);

  if (varError || !currentVariants) {
    return { error: 'Failed to verify current product prices and availability.' };
  }

  const variantMap = new Map(currentVariants.map((v) => [v.id, v]));

  // Verify stock & compute verified subtotal and weight
  let subtotal = 0;
  let totalWeightKg = 0;
  const orderItemsData = [];

  for (const item of cartItems) {
    const freshVariant = variantMap.get(item.variant_id);
    if (!freshVariant || !freshVariant.is_active) {
      return { error: `Product variant "${item.variant?.title}" is no longer available.` };
    }

    if (freshVariant.stock_quantity < item.quantity) {
      return {
        error: `Insufficient stock for "${freshVariant.title}". Available: ${freshVariant.stock_quantity}, in cart: ${item.quantity}.`,
      };
    }

    const unitPrice =
      freshVariant.price_override !== null && freshVariant.price_override !== undefined
        ? Number(freshVariant.price_override)
        : Number(freshVariant.product.base_price);

    const itemWeight = Number(freshVariant.weight_kg ?? freshVariant.product.weight_kg ?? 0.5);
    const lineTotal = unitPrice * item.quantity;

    subtotal += lineTotal;
    totalWeightKg += itemWeight * item.quantity;

    orderItemsData.push({
      product_id: freshVariant.product_id,
      variant_id: freshVariant.id,
      sku: freshVariant.sku,
      title: `${freshVariant.product.title} (${freshVariant.title})`,
      attributes: freshVariant.attributes || {},
      unit_price: unitPrice,
      quantity: item.quantity,
      total_price: lineTotal,
      weight_kg: itemWeight * item.quantity,
    });
  }

  // 3. Fetch and verify shipping address
  const { data: address, error: addrError } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single();

  if (addrError || !address) {
    return { error: 'Please select a valid delivery address.' };
  }

  // 4. Resolve shipping zone & rate
  const zones = await getActiveShippingZones();
  const matchedZone = zones.find((z) =>
    z.regions.some((r) =>
      r.toLowerCase().includes(address.region.toLowerCase()) ||
      address.region.toLowerCase().includes(r.toLowerCase())
    )
  ) || zones[0];

  const shippingCalc = matchedZone
    ? await calculateShippingFee({
        zoneId: matchedZone.id,
        totalWeightKg,
      })
    : null;

  const shippingCost = shippingCalc ? shippingCalc.shippingFee : 25;

  // 5. Calculate discounts
  let discountTotal = 0;
  let appliedCouponId: string | null = null;

  // Automatic discounts
  const autoDiscount = await calculateAutomaticDiscounts(cartItems, subtotal);
  discountTotal += autoDiscount.discountTotal;

  // Coupon code
  if (couponCode && couponCode.trim()) {
    const couponResult = await validateAndApplyCoupon({
      code: couponCode,
      subtotal: subtotal - discountTotal,
      customerId: user.id,
    });

    if (!couponResult.valid) {
      return { error: couponResult.message || 'Invalid coupon code.' };
    }

    discountTotal += couponResult.discountAmount;
    appliedCouponId = couponResult.coupon?.id || null;
  }

  const grandTotal = Math.max(0, subtotal - discountTotal + shippingCost);
  const orderNumber = generateOrderNumber();
  const paystackRef = `bag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // 6. Create Order in Database
  const { data: order, error: orderInsertError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_id: user.id,
      status: 'pending',
      payment_status: 'pending',
      paystack_reference: paystackRef,
      currency: 'GHS',
      subtotal,
      shipping_cost: shippingCost,
      discount_total: discountTotal,
      grand_total: grandTotal,
      shipping_address: {
        recipient_name: address.recipient_name,
        phone_number: address.phone_number,
        street_address: address.street_address,
        city: address.city,
        region: address.region,
        digital_address: address.digital_address || undefined,
      },
      shipping_zone_id: matchedZone?.id || null,
      total_weight_kg: totalWeightKg,
      coupon_id: appliedCouponId,
      customer_notes: customerNotes || null,
    })
    .select()
    .single();

  if (orderInsertError || !order) {
    console.error('Order creation error:', orderInsertError);
    return { error: 'Failed to create order. Please try again.' };
  }

  // 7. Insert Order Items
  const itemsWithOrderId = orderItemsData.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId);

  if (itemsError) {
    console.error('Order items error:', itemsError);
    return { error: 'Failed to save order line items.' };
  }

  // 8. Initialize Paystack Transaction
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/orders/${order.id}/verify?reference=${paystackRef}`;

  try {
    const paystackRes = await initializePaystackTransaction({
      email: user.email!,
      amount: grandTotal,
      reference: paystackRef,
      callbackUrl,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        customer_id: user.id,
      },
    });

    // Save access code
    await supabase
      .from('orders')
      .update({ paystack_access_code: paystackRes.data.access_code })
      .eq('id', order.id);

    return {
      success: true,
      orderId: order.id,
      orderNumber,
      authorizationUrl: paystackRes.data.authorization_url,
      reference: paystackRef,
    };
  } catch (err: unknown) {
    console.error('Paystack initialization error:', err);
    return {
      error:
        err instanceof Error
          ? err.message
          : 'Unable to connect to Paystack payment gateway. Please verify your connection or keys.',
    };
  }
}

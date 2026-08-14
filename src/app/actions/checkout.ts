'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateShippingFee, getActiveShippingZones } from '@/lib/data/shipping';
import { validateAndApplyCoupon, calculateAutomaticDiscounts } from '@/lib/data/discounts';
import { initializePaystackTransaction } from '@/lib/paystack';
import { generateOrderNumber } from '@/lib/utils';
import { CartItem } from '@/types/database';

export async function createCheckoutOrderAction({
  addressId,
  shippingAddress,
  couponCode,
  customerNotes,
}: {
  addressId?: string;
  shippingAddress?: {
    recipient_name: string;
    phone_number: string;
    region: string;
    city: string;
    address_line_1: string;
    gps_address?: string;
    delivery_notes?: string;
  };
  couponCode?: string;
  customerNotes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to complete checkout.', unauthenticated: true };
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

  // 2. Re-fetch current database variant stock & price
  const variantIds = cartItems.map((ci) => ci.variant_id);
  const { data: currentVariants, error: varError } = await supabase
    .from('product_variants')
    .select('*, product:products(*)')
    .in('id', variantIds);

  if (varError || !currentVariants) {
    return { error: 'Failed to verify product availability.' };
  }

  const variantMap = new Map(currentVariants.map((v) => [v.id, v]));

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
        error: `Insufficient stock for "${freshVariant.title}". Available: ${freshVariant.stock_quantity}.`,
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

  // 3. Resolve shipping address
  let finalRecipientName = '';
  let finalPhoneNumber = '';
  let finalStreetAddress = '';
  let finalCity = '';
  let finalRegion = '';
  let finalDigitalAddress: string | undefined = undefined;

  if (shippingAddress) {
    finalRecipientName = shippingAddress.recipient_name;
    finalPhoneNumber = shippingAddress.phone_number;
    finalStreetAddress = shippingAddress.address_line_1;
    finalCity = shippingAddress.city;
    finalRegion = shippingAddress.region;
    finalDigitalAddress = shippingAddress.gps_address;
  } else if (addressId) {
    const { data: address } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', user.id)
      .single();

    if (!address) {
      return { error: 'Please provide a valid delivery address.' };
    }
    finalRecipientName = address.recipient_name;
    finalPhoneNumber = address.phone_number;
    finalStreetAddress = address.street_address;
    finalCity = address.city;
    finalRegion = address.region;
    finalDigitalAddress = address.digital_address || undefined;
  } else {
    return { error: 'Delivery address required.' };
  }

  // 4. Resolve shipping zone & rate
  const zones = await getActiveShippingZones();
  const matchedZone = zones.find((z) =>
    z.regions.some((r) =>
      r.toLowerCase().includes(finalRegion.toLowerCase()) ||
      finalRegion.toLowerCase().includes(r.toLowerCase())
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

  const autoDiscount = await calculateAutomaticDiscounts(cartItems, subtotal);
  discountTotal += autoDiscount.discountTotal;

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

  // 6. Create Order
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
        recipient_name: finalRecipientName,
        phone_number: finalPhoneNumber,
        street_address: finalStreetAddress,
        city: finalCity,
        region: finalRegion,
        digital_address: finalDigitalAddress,
      },
      shipping_zone_id: matchedZone?.id || null,
      total_weight_kg: totalWeightKg,
      coupon_id: appliedCouponId,
      customer_notes: customerNotes || shippingAddress?.delivery_notes || null,
    })
    .select()
    .single();

  if (orderInsertError || !order) {
    console.error('Order creation error:', orderInsertError);
    return { error: 'Failed to create order. Please try again.' };
  }

  // 7. Insert Line Items
  const itemsWithOrderId = orderItemsData.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  await supabase.from('order_items').insert(itemsWithOrderId);

  // 8. Paystack Initialize
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://e-commerce-five-lemon-60.vercel.app';
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
          : 'Unable to connect to Paystack payment gateway. Please check Paystack keys.',
    };
  }
}

export const initiateCheckoutAction = createCheckoutOrderAction;

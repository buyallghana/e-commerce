import { createClient } from '@/lib/supabase/server';
import { Coupon, CartItem } from '@/types/database';

export async function validateAndApplyCoupon({
  code,
  subtotal,
  customerId,
}: {
  code: string;
  subtotal: number;
  customerId: string;
}): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message?: string;
}> {
  const supabase = await createClient();
  const cleanCode = code.trim().toUpperCase();

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    return { valid: false, discountAmount: 0, message: 'Invalid or inactive coupon code.' };
  }

  // Check start and expiry dates
  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, discountAmount: 0, message: 'This coupon is not active yet.' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, discountAmount: 0, message: 'This coupon has expired.' };
  }

  // Check minimum order amount
  if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount)) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order amount of GHS ${coupon.min_order_amount} required for this coupon.`,
    };
  }

  // Check total usage limits
  if (coupon.max_uses_total && coupon.times_used >= coupon.max_uses_total) {
    return { valid: false, discountAmount: 0, message: 'This coupon has reached its maximum usage limit.' };
  }

  // Check per-user usage limits
  if (coupon.max_uses_per_user && customerId) {
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('coupon_id', coupon.id)
      .neq('status', 'cancelled');

    if ((count || 0) >= coupon.max_uses_per_user) {
      return {
        valid: false,
        discountAmount: 0,
        message: `You have already used this coupon the maximum allowed times (${coupon.max_uses_per_user}).`,
      };
    }
  }

  // Compute discount amount
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (subtotal * Number(coupon.discount_value)) / 100;
    if (coupon.max_discount_amount && discount > Number(coupon.max_discount_amount)) {
      discount = Number(coupon.max_discount_amount);
    }
  } else if (coupon.discount_type === 'fixed') {
    discount = Math.min(Number(coupon.discount_value), subtotal);
  }

  return {
    valid: true,
    coupon: coupon as Coupon,
    discountAmount: Math.round(discount * 100) / 100,
    message: 'Coupon applied successfully.',
  };
}

export async function calculateAutomaticDiscounts(
  cartItems: CartItem[],
  subtotal: number
): Promise<{ discountTotal: number; appliedRules: string[] }> {
  const supabase = await createClient();
  const { data: rules } = await supabase
    .from('automatic_discounts')
    .select('*')
    .eq('is_active', true);

  if (!rules || rules.length === 0) {
    return { discountTotal: 0, appliedRules: [] };
  }

  let totalDiscount = 0;
  const applied: string[] = [];
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  for (const rule of rules) {
    if (rule.rule_type === 'bulk_qty') {
      const minQty = (rule.rule_config as { min_items?: number })?.min_items || 5;
      if (totalItemCount >= minQty) {
        let disc = 0;
        if (rule.discount_type === 'percentage') {
          disc = (subtotal * Number(rule.discount_value)) / 100;
        } else {
          disc = Number(rule.discount_value);
        }
        totalDiscount += disc;
        applied.push(rule.name);
      }
    } else if (rule.rule_type === 'min_cart_total') {
      const minVal = (rule.rule_config as { min_total?: number })?.min_total || 500;
      if (subtotal >= minVal) {
        let disc = 0;
        if (rule.discount_type === 'percentage') {
          disc = (subtotal * Number(rule.discount_value)) / 100;
        } else {
          disc = Number(rule.discount_value);
        }
        totalDiscount += disc;
        applied.push(rule.name);
      }
    }
  }

  return {
    discountTotal: Math.min(totalDiscount, subtotal),
    appliedRules: applied,
  };
}

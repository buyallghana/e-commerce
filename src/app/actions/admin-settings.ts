'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DiscountType, RuleType } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function adminCreateCouponAction({
  code,
  discountType,
  discountValue,
  minOrderAmount,
  maxDiscountAmount,
  maxUsesTotal,
  expiresAt,
}: {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUsesTotal?: number;
  expiresAt?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return { error: 'Admin privileges required' };

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.from('coupons').insert({
    code: code.trim().toUpperCase(),
    discount_type: discountType,
    discount_value: discountValue,
    min_order_amount: minOrderAmount || 0,
    max_discount_amount: maxDiscountAmount || null,
    max_uses_total: maxUsesTotal || null,
    expires_at: expiresAt || null,
    is_active: true,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function adminToggleCouponAction(couponId: string, isActive: boolean) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('coupons')
    .update({ is_active: isActive })
    .eq('id', couponId);

  if (error) return { error: error.message };
  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function adminCreateAutomaticDiscountAction({
  name,
  ruleType,
  ruleConfig,
  discountType,
  discountValue,
  expiresAt,
}: {
  name: string;
  ruleType: RuleType;
  ruleConfig: Record<string, unknown>;
  discountType: DiscountType;
  discountValue: number;
  expiresAt?: string;
}) {
  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.from('automatic_discounts').insert({
    name,
    rule_type: ruleType,
    rule_config: ruleConfig,
    discount_type: discountType,
    discount_value: discountValue,
    expires_at: expiresAt || null,
    is_active: true,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function adminCreateShippingZoneAction({
  name,
  regions,
}: {
  name: string;
  regions: string[];
}) {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('shipping_zones')
    .insert({ name, regions, is_active: true })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/admin/shipping');
  return { success: true, zoneId: data.id };
}

export async function adminAddShippingRateAction({
  zoneId,
  minWeightKg,
  maxWeightKg,
  baseFee,
  perKgExtraFee,
  estimatedDays,
}: {
  zoneId: string;
  minWeightKg: number;
  maxWeightKg: number;
  baseFee: number;
  perKgExtraFee: number;
  estimatedDays: string;
}) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from('shipping_rates').insert({
    zone_id: zoneId,
    min_weight_kg: minWeightKg,
    max_weight_kg: maxWeightKg,
    base_fee: baseFee,
    per_kg_extra_fee: perKgExtraFee,
    estimated_days: estimatedDays,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/shipping');
  return { success: true };
}

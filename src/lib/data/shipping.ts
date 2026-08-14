import { createClient } from '@/lib/supabase/server';
import { ShippingZone, ShippingRate } from '@/types/database';

export async function getActiveShippingZones(): Promise<ShippingZone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shipping_zones')
    .select(`
      *,
      rates:shipping_rates(*)
    `)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching shipping zones:', error);
    return [];
  }

  return (data as ShippingZone[]) || [];
}

export async function calculateShippingFee({
  zoneId,
  totalWeightKg,
}: {
  zoneId: string;
  totalWeightKg: number;
}): Promise<{
  shippingFee: number;
  estimatedDays: string;
  zoneName: string;
} | null> {
  const supabase = await createClient();

  const { data: zone, error: zoneError } = await supabase
    .from('shipping_zones')
    .select(`
      *,
      rates:shipping_rates(*)
    `)
    .eq('id', zoneId)
    .eq('is_active', true)
    .single();

  if (zoneError || !zone) {
    return null;
  }

  const rates = (zone.rates as ShippingRate[]) || [];
  if (rates.length === 0) {
    return {
      shippingFee: 0,
      estimatedDays: 'Standard Delivery',
      zoneName: zone.name,
    };
  }

  // Find matching rate tier or use base rate
  const weight = Math.max(0.1, totalWeightKg);
  const matchingRate =
    rates.find((r) => weight >= r.min_weight_kg && weight <= r.max_weight_kg) ||
    rates[0];

  let fee = Number(matchingRate.base_fee);
  if (weight > matchingRate.max_weight_kg && matchingRate.per_kg_extra_fee > 0) {
    const extraKg = Math.ceil(weight - matchingRate.max_weight_kg);
    fee += extraKg * Number(matchingRate.per_kg_extra_fee);
  }

  return {
    shippingFee: fee,
    estimatedDays: matchingRate.estimated_days || '1-3 business days',
    zoneName: zone.name,
  };
}

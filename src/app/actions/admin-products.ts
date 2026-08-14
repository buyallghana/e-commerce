'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function adminCreateProductAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return { error: 'Admin privileges required' };

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const description = (formData.get('description') as string) || '';
  const categoryId = (formData.get('categoryId') as string) || null;
  const basePrice = parseFloat(formData.get('basePrice') as string) || 0;
  const weightKg = parseFloat(formData.get('weightKg') as string) || 0.5;
  const isVariantProduct = formData.get('isVariantProduct') === 'true';
  const reviewsEnabled = formData.get('reviewsEnabled') !== 'false';
  const initialStock = parseInt(formData.get('initialStock') as string, 10) || 0;
  const sku = (formData.get('sku') as string) || `SKU-${Date.now()}`;
  const images = ((formData.get('images') as string) || '').split(',').map((s) => s.trim()).filter(Boolean);

  const adminSupabase = createAdminClient();

  // 1. Insert Product
  const { data: product, error: prodError } = await adminSupabase
    .from('products')
    .insert({
      title,
      slug,
      description,
      category_id: categoryId,
      base_price: basePrice,
      weight_kg: weightKg,
      is_variant_product: isVariantProduct,
      reviews_enabled: reviewsEnabled,
      images,
    })
    .select()
    .single();

  if (prodError || !product) {
    return { error: prodError?.message || 'Failed to create product' };
  }

  // 2. If simple product, create default variant
  if (!isVariantProduct) {
    const { data: variant, error: varError } = await adminSupabase
      .from('product_variants')
      .insert({
        product_id: product.id,
        sku,
        title: 'Standard',
        stock_quantity: initialStock,
        low_stock_threshold: 5,
        weight_kg: weightKg,
      })
      .select()
      .single();

    if (!varError && variant && initialStock > 0) {
      await adminSupabase.from('inventory_logs').insert({
        variant_id: variant.id,
        change_amount: initialStock,
        previous_stock: 0,
        new_stock: initialStock,
        reason: 'initial_stock',
        created_by: user.id,
      });
    }
  }

  revalidatePath('/admin/products');
  revalidatePath('/products');
  return { success: true, productId: product.id };
}

export async function adminUpdateStockAction({
  variantId,
  newStock,
  reason = 'manual_adjustment',
}: {
  variantId: string;
  newStock: number;
  reason?: string;
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

  const { data: currentVariant, error: fetchErr } = await adminSupabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single();

  if (fetchErr || !currentVariant) {
    return { error: 'Variant not found' };
  }

  const prevStock = currentVariant.stock_quantity;
  const change = newStock - prevStock;

  const { error: updateErr } = await adminSupabase
    .from('product_variants')
    .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
    .eq('id', variantId);

  if (updateErr) return { error: updateErr.message };

  await adminSupabase.from('inventory_logs').insert({
    variant_id: variantId,
    change_amount: change,
    previous_stock: prevStock,
    new_stock: newStock,
    reason,
    created_by: user.id,
  });

  revalidatePath('/admin/inventory');
  return { success: true };
}

export async function adminToggleProductReviewsAction(productId: string, enabled: boolean) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('products')
    .update({ reviews_enabled: enabled })
    .eq('id', productId);

  if (error) return { error: error.message };
  revalidatePath('/admin/products');
  return { success: true };
}

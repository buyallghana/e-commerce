'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CartItem, Product } from '@/types/database';

export async function getCart(): Promise<CartItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      variant:product_variants (
        *,
        product:products (*)
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cart:', error);
    return [];
  }

  return (data as unknown as CartItem[]) || [];
}

export async function addToCartAction(variantId: string, quantity: number = 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Please log in to add items to your cart.', unauthenticated: true };
  }

  const { data: variant, error: varError } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single();

  if (varError || !variant) {
    return { error: 'Product variant not found.' };
  }

  if (variant.stock_quantity < quantity) {
    return { error: `Only ${variant.stock_quantity} available in stock.` };
  }

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('customer_id', user.id)
    .eq('variant_id', variantId)
    .single();

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > variant.stock_quantity) {
      return { error: `Cannot add more. You have ${existing.quantity} in cart, stock limit is ${variant.stock_quantity}.` };
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('cart_items').insert({
      customer_id: user.id,
      variant_id: variantId,
      quantity,
    });

    if (error) return { error: error.message };
  }

  revalidatePath('/cart');
  revalidatePath('/checkout');
  return { success: true };
}

export async function updateCartItemQuantityAction(cartItemId: string, quantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  if (quantity <= 0) {
    return removeCartItemAction(cartItemId);
  }

  const { data: cartItem } = await supabase
    .from('cart_items')
    .select('variant:product_variants(stock_quantity)')
    .eq('id', cartItemId)
    .eq('customer_id', user.id)
    .single();

  const stock = (cartItem?.variant as unknown as { stock_quantity: number })?.stock_quantity ?? 0;
  if (quantity > stock) {
    return { error: `Cannot exceed available stock of ${stock}.` };
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', cartItemId)
    .eq('customer_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/cart');
  revalidatePath('/checkout');
  return { success: true };
}

export async function removeCartItemAction(cartItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('customer_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/cart');
  revalidatePath('/checkout');
  return { success: true };
}

export async function toggleWishlistAction(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Please log in to save items to your wishlist.', unauthenticated: true };

  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('customer_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id);
    revalidatePath('/wishlist');
    return { isWishlisted: false };
  } else {
    await supabase.from('wishlists').insert({
      customer_id: user.id,
      product_id: productId,
    });
    revalidatePath('/wishlist');
    return { isWishlisted: true };
  }
}

export async function getWishlist(): Promise<Product[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      product:products (
        *,
        category:categories (*),
        variants:product_variants (*)
      )
    `)
    .eq('customer_id', user.id);

  if (error || !data) return [];

  return data
    .map((item) => item.product as unknown as Product)
    .filter(Boolean);
}

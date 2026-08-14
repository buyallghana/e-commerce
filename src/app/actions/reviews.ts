'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function submitReviewAction({
  productId,
  rating,
  title,
  comment,
}: {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'You must be logged in to write a review.', unauthenticated: true };

  if (rating < 1 || rating > 5) {
    return { error: 'Rating must be between 1 and 5 stars.' };
  }

  if (!comment || comment.trim().length < 5) {
    return { error: 'Review comment must be at least 5 characters.' };
  }

  // Check if reviews are enabled for this product
  const { data: product } = await supabase
    .from('products')
    .select('reviews_enabled')
    .eq('id', productId)
    .single();

  if (!product?.reviews_enabled) {
    return { error: 'Customer reviews are currently disabled for this product.' };
  }

  // Check if user has purchased this product
  const { data: orderItem } = await supabase
    .from('order_items')
    .select('order_id, orders:orders(customer_id, status)')
    .eq('product_id', productId)
    .limit(1);

  const matchedOrderId = (orderItem as unknown as { order_id?: string })?.order_id || null;

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    customer_id: user.id,
    order_id: matchedOrderId,
    rating,
    title: title || null,
    comment,
    is_approved: true, // auto-approved unless moderated
  });

  if (error) return { error: error.message };

  revalidatePath(`/products/${productId}`);
  return { success: 'Thank you! Your review has been submitted.' };
}

export async function adminModerateReviewAction(reviewId: string, isApproved: boolean) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('reviews')
    .update({ is_approved: isApproved })
    .eq('id', reviewId);

  if (error) return { error: error.message };

  revalidatePath('/admin/reviews');
  return { success: true };
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createInAppNotification, sendEmailNotification } from '@/lib/notifications';
import { generateReturnNumber, formatGHS } from '@/lib/utils';
import { Return, ReturnStatus } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function getCustomerReturns(): Promise<Return[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('returns')
    .select(`
      *,
      order:orders(*),
      items:return_items(*)
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching returns:', error);
    return [];
  }

  return (data as Return[]) || [];
}

export async function requestReturnAction({
  orderId,
  reason,
  items,
}: {
  orderId: string;
  reason: string;
  items: Array<{ orderItemId: string; quantity: number; condition?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required' };

  // Check order ownership
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .eq('customer_id', user.id)
    .single();

  if (orderErr || !order) {
    return { error: 'Order not found.' };
  }

  if (order.status === 'cancelled' || order.status === 'pending') {
    return { error: 'Returns can only be requested for confirmed or delivered orders.' };
  }

  const returnNumber = generateReturnNumber();

  // Create return record
  const { data: returnRecord, error: returnError } = await supabase
    .from('returns')
    .insert({
      return_number: returnNumber,
      order_id: orderId,
      customer_id: user.id,
      reason,
      status: 'requested',
      refund_amount: 0,
    })
    .select()
    .single();

  if (returnError || !returnRecord) {
    return { error: returnError?.message || 'Failed to submit return request.' };
  }

  // Insert return items
  const returnItemsData = items.map((item) => ({
    return_id: returnRecord.id,
    order_item_id: item.orderItemId,
    quantity_returned: item.quantity,
    condition: item.condition || 'Unopened / Original Packaging',
  }));

  await supabase.from('return_items').insert(returnItemsData);

  // In-app notification
  await createInAppNotification({
    userId: user.id,
    title: 'Return Request Submitted',
    message: `Return #${returnNumber} for order #${order.order_number} has been submitted for review.`,
    type: 'return',
    linkUrl: `/account/returns/${returnRecord.id}`,
  });

  revalidatePath('/account/returns');
  revalidatePath(`/orders/${orderId}`);
  return { success: true, returnNumber, returnId: returnRecord.id };
}

export async function adminReviewReturnAction({
  returnId,
  status,
  refundAmount,
  adminResponse,
  restockItems = false,
}: {
  returnId: string;
  status: ReturnStatus;
  refundAmount?: number;
  adminResponse?: string;
  restockItems?: boolean;
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

  const { data: returnRec, error: fetchErr } = await adminSupabase
    .from('returns')
    .select(`
      *,
      order:orders(*),
      customer:profiles(*),
      items:return_items(*, order_item:order_items(*))
    `)
    .eq('id', returnId)
    .single();

  if (fetchErr || !returnRec) {
    return { error: 'Return record not found.' };
  }

  // Restock if requested
  if (restockItems && status === 'approved') {
    for (const item of returnRec.items || []) {
      const variantId = item.order_item?.variant_id;
      const qty = item.quantity_returned;

      if (variantId && qty > 0) {
        const { data: v } = await adminSupabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variantId)
          .single();

        if (v) {
          await adminSupabase
            .from('product_variants')
            .update({ stock_quantity: v.stock_quantity + qty })
            .eq('id', variantId);

          await adminSupabase.from('inventory_logs').insert({
            variant_id: variantId,
            change_amount: qty,
            previous_stock: v.stock_quantity,
            new_stock: v.stock_quantity + qty,
            reason: 'return_restocked',
            reference_id: returnId,
            created_by: user.id,
          });
        }
      }
    }
  }

  const { error: updateErr } = await adminSupabase
    .from('returns')
    .update({
      status,
      refund_amount: refundAmount || returnRec.refund_amount,
      admin_response: adminResponse || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', returnId);

  if (updateErr) return { error: updateErr.message };

  // Notify customer
  await createInAppNotification({
    userId: returnRec.customer_id,
    title: `Return Request ${status.toUpperCase()}`,
    message: `Your return request #${returnRec.return_number} has been ${status}.${
      refundAmount ? ` Refund amount: ${formatGHS(refundAmount)}.` : ''
    }`,
    type: 'return',
    linkUrl: `/account/returns/${returnId}`,
  });

  if (returnRec.customer?.email) {
    await sendEmailNotification({
      to: returnRec.customer.email,
      subject: `Return Update — #${returnRec.return_number} is ${status}`,
      html: `
        <p>Your return request <strong>#${returnRec.return_number}</strong> has been updated to <strong>${status}</strong>.</p>
        ${refundAmount ? `<p><strong>Refund Amount:</strong> ${formatGHS(refundAmount)}</p>` : ''}
        ${adminResponse ? `<p><strong>Admin Note:</strong> ${adminResponse}</p>` : ''}
      `,
    });
  }

  revalidatePath('/admin/returns');
  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath(`/account/returns/${returnId}`);
  return { success: true };
}

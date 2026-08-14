'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { createInAppNotification, sendEmailNotification } from '@/lib/notifications';
import { Order, OrderStatus, PaymentStatus } from '@/types/database';
import { formatGHS } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function getCustomerOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }

  return (data as Order[]) || [];
}

export async function getOrderDetails(orderId: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      timeline:order_timeline(*)
    `)
    .eq('id', orderId)
    .single();

  if (error || !data) return null;

  return data as Order;
}

export async function verifyOrderPayment(orderId: string, reference: string) {
  const adminSupabase = createAdminClient();

  const { data: order, error } = await adminSupabase
    .from('orders')
    .select('*, customer:profiles(*)')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { error: 'Order not found' };
  }

  if (order.status === 'paid' || order.payment_status === 'successful') {
    return { success: true, order };
  }

  try {
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status && verification.data.status === 'success') {
      // Decrement stock
      await adminSupabase.rpc('decrement_stock_atomic', {
        p_order_id: order.id,
      });

      // Mark order paid
      await adminSupabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'successful',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // Clear customer cart
      await adminSupabase
        .from('cart_items')
        .delete()
        .eq('customer_id', order.customer_id);

      // Timeline & Notification
      await adminSupabase.from('order_timeline').insert({
        order_id: order.id,
        status: 'paid',
        note: `Payment of ${formatGHS(order.grand_total)} verified.`,
      });

      await createInAppNotification({
        userId: order.customer_id,
        title: 'Payment Successful',
        message: `Order #${order.order_number} has been verified and is being processed.`,
        type: 'order',
        linkUrl: `/orders/${order.id}`,
      });

      revalidatePath(`/orders/${order.id}`);
      return { success: true };
    }

    return { error: 'Payment verification failed or pending on Paystack.' };
  } catch (err: unknown) {
    console.error('Verify error:', err);
    return { error: err instanceof Error ? err.message : 'Verification failed' };
  }
}

export async function adminUpdateOrderStatusAction({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: OrderStatus;
  note?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Admin access required' };

  const adminSupabase = createAdminClient();

  // If cancelling a paid order, restock items
  if (status === 'cancelled') {
    const { data: order } = await adminSupabase
      .from('orders')
      .select('payment_status, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (order && order.payment_status === 'successful') {
      // Restock each variant
      for (const item of order.items || []) {
        const { data: v } = await adminSupabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', item.variant_id)
          .single();

        if (v) {
          await adminSupabase
            .from('product_variants')
            .update({ stock_quantity: v.stock_quantity + item.quantity })
            .eq('id', item.variant_id);

          await adminSupabase.from('inventory_logs').insert({
            variant_id: item.variant_id,
            change_amount: item.quantity,
            previous_stock: v.stock_quantity,
            new_stock: v.stock_quantity + item.quantity,
            reason: 'order_cancelled',
            reference_id: orderId,
            created_by: user.id,
          });
        }
      }
    }
  }

  const { data: updatedOrder, error } = await adminSupabase
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, customer:profiles(*)')
    .single();

  if (error) return { error: error.message };

  // Insert timeline
  await adminSupabase.from('order_timeline').insert({
    order_id: orderId,
    status,
    note: note || `Order status updated to ${status}`,
    created_by: user.id,
  });

  // Notify customer
  if (updatedOrder) {
    const statusMessages: Record<string, string> = {
      processing: `Your order #${updatedOrder.order_number} is currently being packaged.`,
      shipped: `Great news! Your order #${updatedOrder.order_number} is out for delivery.`,
      delivered: `Your order #${updatedOrder.order_number} has been delivered. Thank you for shopping with us!`,
      cancelled: `Your order #${updatedOrder.order_number} was cancelled.`,
    };

    if (statusMessages[status]) {
      await createInAppNotification({
        userId: updatedOrder.customer_id,
        title: `Order Status: ${status.toUpperCase()}`,
        message: statusMessages[status],
        type: 'shipping',
        linkUrl: `/orders/${orderId}`,
      });

      if (updatedOrder.customer?.email) {
        await sendEmailNotification({
          to: updatedOrder.customer.email,
          subject: `Order Update — #${updatedOrder.order_number} is ${status}`,
          html: `<p>${statusMessages[status]}</p><p>${note ? `Note: ${note}` : ''}</p>`,
        });
      }
    }
  }

  revalidatePath(`/admin/orders`);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackWebhookSignature } from '@/lib/paystack';
import { createAdminClient } from '@/lib/supabase/admin';
import { createInAppNotification, sendEmailNotification } from '@/lib/notifications';
import { formatGHS } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-paystack-signature');
  const rawBody = await request.text();

  // 1. Verify Webhook Signature
  const isValid = verifyPaystackWebhookSignature(rawBody, signature);
  if (!isValid && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { event, data } = payload;

  if (event === 'charge.success') {
    const reference = data.reference;
    const supabase = createAdminClient();

    // 2. Fetch order by paystack reference
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, customer:profiles(*), items:order_items(*)')
      .eq('paystack_reference', reference)
      .single();

    if (orderError || !order) {
      console.error(`Order with reference ${reference} not found.`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotency check: if already processed as paid
    if (order.status === 'paid' || order.payment_status === 'successful') {
      return NextResponse.json({ received: true, already_processed: true });
    }

    try {
      // 3. Atomically decrement stock
      const { error: rpcError } = await supabase.rpc('decrement_stock_atomic', {
        p_order_id: order.id,
      });

      if (rpcError) {
        console.error('Stock decrement error:', rpcError);
        // Log incident but don't drop payment notification
      }

      // 4. Update order to paid
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'successful',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // 5. Update coupon usage count if applied
      if (order.coupon_id) {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('times_used')
          .eq('id', order.coupon_id)
          .single();

        if (coupon) {
          await supabase
            .from('coupons')
            .update({ times_used: (coupon.times_used || 0) + 1 })
            .eq('id', order.coupon_id);
        }
      }

      // 6. Record order timeline
      await supabase.from('order_timeline').insert({
        order_id: order.id,
        status: 'paid',
        note: `Payment of ${formatGHS(order.grand_total)} confirmed via Paystack (Ref: ${reference})`,
      });

      // 7. Clear user cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', order.customer_id);

      // 8. In-App Notification
      await createInAppNotification({
        userId: order.customer_id,
        title: 'Order Confirmed!',
        message: `Your payment for order #${order.order_number} (${formatGHS(order.grand_total)}) has been confirmed. We are preparing your shipment.`,
        type: 'order',
        linkUrl: `/orders/${order.id}`,
      });

      // 9. Transactional Email
      if (order.customer?.email) {
        await sendEmailNotification({
          to: order.customer.email,
          subject: `Order Confirmation — #${order.order_number}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
              <h2 style="color: #0f172a;">Thank you for your order!</h2>
              <p>Your payment for order <strong>#${order.order_number}</strong> has been received and verified.</p>
              <div style="background-color: #f5f5f4; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Total Paid:</strong> ${formatGHS(order.grand_total)}</p>
                <p style="margin: 0 0 8px 0;"><strong>Delivery To:</strong> ${order.shipping_address.recipient_name}, ${order.shipping_address.street_address}, ${order.shipping_address.city}, ${order.shipping_address.region}</p>
                <p style="margin: 0;"><strong>Estimated Delivery:</strong> 1-3 business days</p>
              </div>
              <p>We'll notify you as soon as your package ships with courier tracking details.</p>
            </div>
          `,
        });
      }
    } catch (processErr) {
      console.error('Error processing successful charge:', processErr);
      return NextResponse.json({ error: 'Processing error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

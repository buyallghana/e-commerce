import React from 'react';
import { getAdminOrders, adminUpdateOrderStatusAction } from '@/app/actions/orders';
import { formatGHS } from '@/lib/utils';
import { Package, Truck, Check } from 'lucide-react';

interface AdminOrdersProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersProps) {
  const resolved = await searchParams;
  const statusFilter = resolved.status;
  const orders = await getAdminOrders(statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#222]">Customer Orders Management</h1>
          <p className="text-[12px] text-[#666]">Track deliveries, update status, and manage restocks</p>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white border border-[#e1e1e1] rounded-md overflow-hidden shadow-2xs">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-[#888] text-[13px]">
            <Package className="w-8 h-8 mx-auto mb-2 text-[#ccc]" />
            <p>No orders found matching the filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f1f1]">
            {orders.map((order) => (
              <div key={order.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-[14px] text-[#222]">
                      Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[12px] text-[#888] ml-2">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[12px] text-[#555] block sm:inline sm:ml-3">
                      Customer: <strong>{order.customer_profile?.full_name || 'Customer'}</strong> ({order.customer_profile?.email})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase ${
                        order.status === 'delivered'
                          ? 'bg-[#00d084]/15 text-[#008f5a]'
                          : order.status === 'shipped'
                          ? 'bg-[#1e5cea]/15 text-[#1e5cea]'
                          : order.status === 'cancelled'
                          ? 'bg-[#e53935]/15 text-[#e53935]'
                          : 'bg-[#ff9933]/15 text-[#b35900]'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-black text-[16px] text-[#1e5cea]">
                      {formatGHS(Number(order.grand_total))}
                    </span>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-[#f9f9f9] p-3 rounded text-[12px] text-[#555] flex flex-wrap justify-between gap-2">
                  <div>
                    <span>Recipient: </span>
                    <strong className="text-[#222]">
                      {order.shipping_address?.recipient_name} ({order.shipping_address?.phone_number})
                    </strong>
                    <span className="block text-[#666]">
                      {order.shipping_address?.street_address}, {order.shipping_address?.city}, {order.shipping_address?.region}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {order.status === 'paid' && (
                      <form action={async () => {
                        'use server';
                        await adminUpdateOrderStatusAction(order.id, 'processing');
                      }}>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-[#ff9933] text-white text-[11px] font-bold rounded"
                        >
                          Process Order
                        </button>
                      </form>
                    )}

                    {order.status === 'processing' && (
                      <form action={async () => {
                        'use server';
                        await adminUpdateOrderStatusAction(order.id, 'shipped');
                      }}>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-[#1e5cea] text-white text-[11px] font-bold rounded flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch / Ship</span>
                        </button>
                      </form>
                    )}

                    {order.status === 'shipped' && (
                      <form action={async () => {
                        'use server';
                        await adminUpdateOrderStatusAction(order.id, 'delivered');
                      }}>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-[#00d084] text-white text-[11px] font-bold rounded flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Delivered</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

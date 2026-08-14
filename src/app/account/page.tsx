import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import StoreShell from '@/components/layout/StoreShell';
import { createClient } from '@/lib/supabase/server';
import { getCustomerOrders } from '@/app/actions/orders';
import { getCategories } from '@/lib/data/products';
import { formatGHS } from '@/lib/utils';
import { Package, ChevronRight } from 'lucide-react';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/account');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const orders = await getCustomerOrders();
  const categories = await getCategories();
  const isAdmin = profile?.role === 'admin';

  return (
    <StoreShell categories={categories} userEmail={user.email} isAdmin={isAdmin}>
      {/* Breadcrumbs */}
      <div className="bg-[#f5f5f5] border-b border-[#e1e1e1] py-2.5">
        <div className="container-custom flex items-center gap-2 text-[12px] text-[#666]">
          <Link href="/" className="hover:text-[#1e5cea]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
          <span className="font-bold text-[#222]">My Account</span>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 4 Cols: Profile Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#e1e1e1] rounded-md p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1e5cea] text-white font-black text-lg flex items-center justify-center">
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[16px] text-[#222] truncate">
                    {profile?.full_name || 'Customer'}
                  </h3>
                  <p className="text-[12px] text-[#777] truncate">{user.email}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f1f1f1] space-y-2 text-[13px] text-[#555]">
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-bold text-[#222]">{profile?.phone_number || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Status:</span>
                  <span className="font-bold text-[#00d084]">Active Customer</span>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <Link
                    href="/admin"
                    className="block text-center py-2 bg-[#1e5cea] text-white font-bold text-[12px] rounded uppercase"
                  >
                    Open Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right 8 Cols: Orders History */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#e1e1e1] rounded-md p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f1f1] mb-4">
                <h2 className="font-bold text-[16px] text-[#222]">Order History ({orders.length})</h2>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 text-[#777] text-[13px]">
                  <Package className="w-10 h-10 text-[#bbb] mx-auto mb-2" />
                  <p>You have not placed any orders yet.</p>
                  <Link
                    href="/products"
                    className="inline-block mt-3 bg-[#1e5cea] text-white text-[12px] font-bold px-4 py-2 rounded"
                  >
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#f1f1f1]">
                  {orders.map((o) => (
                    <div key={o.id} className="py-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-[14px] text-[#222]">
                            Order #{o.order_number || o.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[12px] text-[#888] ml-2">
                            {new Date(o.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                              o.status === 'delivered'
                                ? 'bg-[#00d084]/15 text-[#008f5a]'
                                : o.status === 'shipped'
                                ? 'bg-[#1e5cea]/15 text-[#1e5cea]'
                                : 'bg-[#ff9933]/15 text-[#b35900]'
                            }`}
                          >
                            {o.status}
                          </span>
                          <span className="font-black text-[15px] text-[#222]">
                            {formatGHS(Number(o.grand_total))}
                          </span>
                        </div>
                      </div>

                      <div className="text-[12px] text-[#666]">
                        <span>Delivery Address: </span>
                        <strong>
                          {o.shipping_address?.street_address || o.shipping_address?.city},{' '}
                          {o.shipping_address?.region}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}

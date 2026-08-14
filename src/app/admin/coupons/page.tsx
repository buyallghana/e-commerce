import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Tag, Plus, Check, X } from 'lucide-react';
import { formatGHS } from '@/lib/utils';

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#222]">Coupons & Promotions</h1>
          <p className="text-[12px] text-[#666]">Manage discount vouchers and welcome codes</p>
        </div>
      </div>

      <div className="bg-white border border-[#e1e1e1] rounded-md overflow-hidden shadow-2xs">
        <div className="divide-y divide-[#f1f1f1]">
          {coupons?.map((c) => (
            <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[15px] bg-[#f0f4fe] text-[#1e5cea] px-2.5 py-1 rounded border border-[#d2e0fc]">
                    {c.code}
                  </span>
                  <span className="text-[12px] font-bold text-[#00d084]">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `${formatGHS(Number(c.discount_value))} OFF`}
                  </span>
                </div>
                <p className="text-[12px] text-[#777] mt-1">
                  Min spend: {formatGHS(Number(c.min_order_amount || 0))} | Total used: {c.times_used} times
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    c.is_active ? 'bg-[#00d084]/15 text-[#008f5a]' : 'bg-[#999]/15 text-[#666]'
                  }`}
                >
                  {c.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

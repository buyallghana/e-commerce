import React from 'react';
import { getAdminDashboardMetrics } from '@/lib/data/analytics';
import { formatGHS } from '@/lib/utils';
import { DollarSign, ShoppingCart, TrendingUp, Clock } from 'lucide-react';

export default async function AdminOverviewPage() {
  const analytics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#222]">Store Performance Overview</h1>
          <p className="text-[12px] text-[#666]">Real-time revenue, orders and inventory statistics</p>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e1e1e1] rounded-md p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[12px] font-bold uppercase">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-[#1e5cea]" />
          </div>
          <p className="text-[22px] font-black text-[#222]">
            {formatGHS(analytics.totalRevenueGHS)}
          </p>
          <span className="text-[11px] text-[#00d084] font-semibold">Paystack Verified</span>
        </div>

        <div className="bg-white border border-[#e1e1e1] rounded-md p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[12px] font-bold uppercase">Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-[#00d084]" />
          </div>
          <p className="text-[22px] font-black text-[#222]">{analytics.totalOrdersCount}</p>
          <span className="text-[11px] text-[#666]">All customer transactions</span>
        </div>

        <div className="bg-white border border-[#e1e1e1] rounded-md p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[12px] font-bold uppercase">Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-[#ff9933]" />
          </div>
          <p className="text-[22px] font-black text-[#222]">
            {formatGHS(analytics.averageOrderValueGHS)}
          </p>
          <span className="text-[11px] text-[#666]">Per completed order</span>
        </div>

        <div className="bg-white border border-[#e1e1e1] rounded-md p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[12px] font-bold uppercase">Pending Dispatch</span>
            <Clock className="w-4 h-4 text-[#e53935]" />
          </div>
          <p className="text-[22px] font-black text-[#222]">{analytics.pendingOrdersCount}</p>
          <span className="text-[11px] text-[#e53935] font-semibold">Requires processing</span>
        </div>
      </div>

      {/* Top Selling Products Table */}
      <div className="bg-white border border-[#e1e1e1] rounded-md p-5 shadow-2xs">
        <h3 className="font-bold text-[15px] text-[#222] mb-3 pb-2 border-b border-[#f1f1f1]">
          Top Selling SKUs
        </h3>

        {analytics.topProducts.length === 0 ? (
          <div className="text-center py-6 text-[13px] text-[#888]">
            No sales recorded yet. Live orders will populate this table automatically.
          </div>
        ) : (
          <div className="divide-y divide-[#f1f1f1] text-[13px]">
            {analytics.topProducts.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#222]">{item.title}</span>
                  <span className="text-[11px] text-[#888] ml-2">SKU: {item.sku}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#1e5cea]">{item.totalQuantity} units sold</span>
                  <span className="text-[11px] text-[#666] block">{formatGHS(item.totalRevenue)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

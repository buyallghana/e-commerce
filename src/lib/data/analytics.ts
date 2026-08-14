import { createAdminClient } from '@/lib/supabase/admin';

export interface DashboardMetrics {
  totalRevenueGHS: number;
  totalOrdersCount: number;
  paidOrdersCount: number;
  averageOrderValueGHS: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  pendingReturnsCount: number;
  topProducts: Array<{
    title: string;
    sku: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    order_number: string;
    customer_email: string;
    grand_total: number;
    status: string;
    created_at: string;
  }>;
}

export async function getAdminDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createAdminClient();

  // 1. Fetch Orders Summary
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, grand_total, status, payment_status, created_at, customer:profiles(email)')
    .order('created_at', { ascending: false });

  const allOrders = orders || [];
  const paidOrders = allOrders.filter(
    (o) => o.payment_status === 'successful' || o.status === 'paid' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered'
  );

  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
  const aov = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const pendingCount = allOrders.filter((o) => o.status === 'pending' || o.status === 'paid').length;

  // 2. Low Stock Count
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, stock_quantity, low_stock_threshold')
    .eq('is_active', true);

  const lowStockCount = (variants || []).filter(
    (v) => v.stock_quantity <= (v.low_stock_threshold || 5)
  ).length;

  // 3. Pending Returns Count
  const { count: pendingReturns } = await supabase
    .from('returns')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'requested');

  // 4. Top Selling Items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('title, sku, quantity, total_price');

  const productAggMap = new Map<string, { title: string; sku: string; totalQuantity: number; totalRevenue: number }>();

  for (const item of orderItems || []) {
    const existing = productAggMap.get(item.sku) || {
      title: item.title,
      sku: item.sku,
      totalQuantity: 0,
      totalRevenue: 0,
    };
    existing.totalQuantity += item.quantity;
    existing.totalRevenue += Number(item.total_price);
    productAggMap.set(item.sku, existing);
  }

  const topProducts = Array.from(productAggMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  const recentOrders = allOrders.slice(0, 8).map((o) => ({
    id: o.id,
    order_number: o.order_number,
    customer_email: (o.customer as unknown as { email: string })?.email || 'N/A',
    grand_total: Number(o.grand_total),
    status: o.status,
    created_at: o.created_at,
  }));

  return {
    totalRevenueGHS: Math.round(totalRevenue * 100) / 100,
    totalOrdersCount: allOrders.length,
    paidOrdersCount: paidOrders.length,
    averageOrderValueGHS: Math.round(aov * 100) / 100,
    pendingOrdersCount: pendingCount,
    lowStockCount,
    pendingReturnsCount: pendingReturns || 0,
    topProducts,
    recentOrders,
  };
}

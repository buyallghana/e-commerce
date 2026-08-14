import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  Tag,
  Star,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: Package },
    { label: 'Products & SKUs', href: '/admin/products', icon: Boxes },
    { label: 'Shipping Zones', href: '/admin/shipping', icon: Truck },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#222]">
      {/* Top Admin Header */}
      <header className="bg-[#222529] text-white border-b border-[#333] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-black text-xl tracking-tight text-white flex items-center gap-1">
              BUYALL<span className="text-[#1e5cea]">GH</span>
            </Link>
            <span className="bg-[#1e5cea] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-[12px]">
            <Link href="/" className="text-[#aaa] hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
            <span className="text-[#666]">|</span>
            <span className="font-bold text-[#00d084]">{user.email}</span>
          </div>
        </div>
      </header>

      {/* Admin Body */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <div className="bg-white border border-[#e1e1e1] rounded-md p-3 shadow-2xs space-y-1 text-[13px]">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded font-semibold text-[#444] hover:bg-[#f0f4fe] hover:text-[#1e5cea] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#666]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Main Admin Screen Content */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}

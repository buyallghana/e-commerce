'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';

export default function MobileBottomNav({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Shop',
      href: '/products',
      icon: LayoutGrid,
      isActive: pathname === '/products',
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      isActive: pathname === '/wishlist',
    },
    {
      label: 'Cart',
      onClick: openCart,
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
      isActive: pathname === '/cart',
    },
    {
      label: userEmail ? 'Account' : 'Sign In',
      href: userEmail ? '/account' : '/login',
      icon: User,
      isActive: pathname.startsWith('/account') || pathname === '/login',
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e1e1e1] shadow-lg px-1 py-1">
      <div className="grid grid-cols-5 items-center justify-items-center">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const content = (
            <div className="flex flex-col items-center justify-center py-1 px-1 relative">
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    item.isActive ? 'text-[#1e5cea] stroke-[2.5]' : 'text-[#666]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#1e5cea] text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold tracking-tight mt-0.5 ${
                  item.isActive ? 'text-[#1e5cea]' : 'text-[#666]'
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className="w-full flex items-center justify-center mobile-touch"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href || '#'}
              className="w-full flex items-center justify-center mobile-touch"
              aria-label={item.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

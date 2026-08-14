'use client';

import React, { useState } from 'react';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import CategoryNav from './CategoryNav';
import MobileBottomNav from './MobileBottomNav';
import MobileDrawer from './MobileDrawer';
import CartDrawer from '../cart/CartDrawer';
import Footer from './Footer';
import { Category } from '@/types/database';

export default function StoreShell({
  children,
  categories = [],
  userEmail,
  isAdmin = false,
}: {
  children: React.ReactNode;
  categories?: Category[];
  userEmail?: string | null;
  isAdmin?: boolean;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header
        categories={categories}
        userEmail={userEmail}
        isAdmin={isAdmin}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Categories Desktop Bar */}
      <CategoryNav categories={categories} />

      {/* Main Page Body */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
        userEmail={userEmail}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Mobile Sticky Bottom Nav (Wolmart Style) */}
      <MobileBottomNav userEmail={userEmail} />
    </div>
  );
}

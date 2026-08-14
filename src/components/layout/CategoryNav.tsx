import React from 'react';
import Link from 'next/link';
import { Category } from '@/types/database';
import { Menu, ChevronDown, Flame, Tag } from 'lucide-react';

export default function CategoryNav({ categories = [] }: { categories?: Category[] }) {
  return (
    <nav className="bg-white border-b border-[#e1e1e1] hidden lg:block">
      <div className="container-custom flex items-center justify-between">
        {/* Left: Browse Categories Button */}
        <div className="flex items-center">
          <div className="relative group">
            <Link
              href="/products"
              className="flex items-center justify-between gap-3 bg-[#1e5cea] hover:bg-[#1545b5] text-white px-5 py-3.5 w-[240px] font-bold text-[13px] uppercase tracking-wider transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Menu className="w-4 h-4 stroke-[2.5]" />
                Browse Categories
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>

            {/* Dropdown Menu on hover */}
            <div className="absolute top-full left-0 w-[240px] bg-white border border-[#e1e1e1] shadow-lg py-2 z-50 hidden group-hover:block divide-y divide-[#f5f5f5]">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  className="block px-4 py-2.5 text-[13px] font-medium text-[#333] hover:text-[#1e5cea] hover:bg-[#f9f9f9] transition-colors"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/products"
                className="block px-4 py-2.5 text-[13px] font-bold text-[#1e5cea] hover:bg-[#f9f9f9] transition-colors"
              >
                All Departments →
              </Link>
            </div>
          </div>

          {/* Center Links */}
          <div className="flex items-center space-x-1 pl-4">
            <Link
              href="/"
              className="px-3.5 py-3.5 text-[13px] font-bold text-[#222529] hover:text-[#1e5cea] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="px-3.5 py-3.5 text-[13px] font-bold text-[#222529] hover:text-[#1e5cea] transition-colors"
            >
              Shop / Catalog
            </Link>
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="px-3 py-3.5 text-[13px] font-semibold text-[#555] hover:text-[#1e5cea] transition-colors"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/products?sort=newest"
              className="px-3.5 py-3.5 text-[13px] font-bold text-[#e53935] hover:text-[#c62828] flex items-center gap-1 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 fill-[#e53935]" />
              <span>Deals</span>
            </Link>
          </div>
        </div>

        {/* Right Coupon Callout */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#666] font-medium">
          <Tag className="w-3.5 h-3.5 text-[#ff9933]" />
          <span>Use coupon <strong className="text-[#1e5cea] font-bold">WELCOME10</strong> for 10% discount</span>
        </div>
      </div>
    </nav>
  );
}

import React from 'react';
import Link from 'next/link';
import { Category } from '@/types/database';
import { LayoutGrid, Flame, Tag, Sparkles } from 'lucide-react';

export default function CategoryNav({ categories = [] }: { categories?: Category[] }) {
  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* All Departments Button */}
        <div className="flex items-center gap-1">
          <Link
            href="/products"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-3 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All Categories</span>
          </Link>

          {/* Categories List */}
          <div className="flex items-center space-x-1 pl-3">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="px-3.5 py-3 text-xs font-semibold text-slate-200 hover:text-amber-400 hover:bg-slate-800/60 rounded-md transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Highlight Deals & Promos */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <Link
            href="/products?sort=newest"
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Arrivals</span>
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Flash Deals</span>
          </Link>
          <div className="flex items-center gap-1 text-slate-400 font-normal">
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>Use code <strong className="text-amber-400 font-bold">WELCOME10</strong> for 10% off</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

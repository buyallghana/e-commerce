import React from 'react';
import Link from 'next/link';
import StoreShell from '@/components/layout/StoreShell';
import ProductCard from '@/components/products/ProductCard';
import { getCategories, getProducts } from '@/lib/data/products';
import { createClient } from '@/lib/supabase/server';
import { LayoutGrid, Filter, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'title';
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category;
  const query = resolvedParams.q;
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;
  const sortBy = resolvedParams.sort || 'newest';
  const currentPage = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;

  const categories = await getCategories();
  const { products, total, totalPages } = await getProducts({
    categorySlug,
    query,
    minPrice,
    maxPrice,
    sortBy,
    page: currentPage,
    limit: 12,
  });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <StoreShell categories={categories} userEmail={user?.email} isAdmin={isAdmin}>
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/products" className="hover:text-slate-900 transition-colors">
              Catalog
            </Link>
            {activeCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-900 font-bold">{activeCategory.name}</span>
              </>
            )}
            {query && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-900 font-bold">&quot;{query}&quot;</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {activeCategory ? activeCategory.name : query ? `Search: "${query}"` : 'All Products'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {products.length} of {total} genuine goods
              </p>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Sort By:</span>
              <div className="flex items-center gap-1">
                {[
                  { label: 'Newest', value: 'newest' },
                  { label: 'Price: Low to High', value: 'price_asc' },
                  { label: 'Price: High to Low', value: 'price_desc' },
                ].map((s) => {
                  const newParams = new URLSearchParams();
                  if (categorySlug) newParams.set('category', categorySlug);
                  if (query) newParams.set('q', query);
                  if (minPrice) newParams.set('minPrice', minPrice.toString());
                  if (maxPrice) newParams.set('maxPrice', maxPrice.toString());
                  newParams.set('sort', s.value);

                  const isSelected = sortBy === s.value;
                  return (
                    <Link
                      key={s.value}
                      href={`/products?${newParams.toString()}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {s.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar & Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block space-y-6">
            {/* Category Filter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <h3 className="font-extrabold text-sm text-slate-950 mb-3 uppercase tracking-wider text-[11px] text-slate-400">
                Departments
              </h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    href="/products"
                    className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${
                      !categorySlug
                        ? 'bg-amber-50 text-amber-900 border border-amber-200/60'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    All Departments
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/products?category=${c.slug}`}
                      className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${
                        categorySlug === c.slug
                          ? 'bg-amber-50 text-amber-900 border border-amber-200/60'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <h3 className="font-extrabold text-sm text-slate-950 mb-3 uppercase tracking-wider text-[11px] text-slate-400">
                Price Filter (GHS)
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Under GH₵ 100', min: undefined, max: 100 },
                  { label: 'GH₵ 100 – GH₵ 300', min: 100, max: 300 },
                  { label: 'GH₵ 300 & Above', min: 300, max: undefined },
                ].map((tier, idx) => {
                  const p = new URLSearchParams();
                  if (categorySlug) p.set('category', categorySlug);
                  if (query) p.set('q', query);
                  if (tier.min !== undefined) p.set('minPrice', tier.min.toString());
                  if (tier.max !== undefined) p.set('maxPrice', tier.max.toString());

                  const isMatch = minPrice === tier.min && maxPrice === tier.max;
                  return (
                    <Link
                      key={idx}
                      href={`/products?${p.toString()}`}
                      className={`block px-3 py-2 rounded-lg font-semibold transition-colors ${
                        isMatch
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tier.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Free Delivery Notice Box */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-900">
              <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider mb-1">
                🇬🇭 Ghana-Wide Delivery
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculated automatically at checkout by destination region and total parcel weight.
              </p>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Filters Pill Row */}
            {(categorySlug || query || minPrice || maxPrice) && (
              <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 font-bold">Active filters:</span>
                {categorySlug && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold">
                    Category: {activeCategory?.name || categorySlug}
                  </span>
                )}
                {query && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold">
                    Query: &quot;{query}&quot;
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold">
                    Price: GHS {minPrice || 0} - {maxPrice || 'Any'}
                  </span>
                )}
                <Link
                  href="/products"
                  className="text-xs font-bold text-rose-600 hover:underline ml-auto"
                >
                  Clear All
                </Link>
              </div>
            )}

            {/* Product Cards */}
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <LayoutGrid className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms or clearing your price filters.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-950 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                >
                  Reset Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 border-t border-slate-200/80 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  Page <strong className="text-slate-900">{currentPage}</strong> of{' '}
                  <strong className="text-slate-900">{totalPages}</strong>
                </p>

                <div className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/products?page=${currentPage - 1}${
                        categorySlug ? `&category=${categorySlug}` : ''
                      }${query ? `&q=${query}` : ''}&sort=${sortBy}`}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </Link>
                  )}

                  {currentPage < totalPages && (
                    <Link
                      href={`/products?page=${currentPage + 1}${
                        categorySlug ? `&category=${categorySlug}` : ''
                      }${query ? `&q=${query}` : ''}&sort=${sortBy}`}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreShell>
  );
}

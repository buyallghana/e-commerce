import React from 'react';
import Link from 'next/link';
import StoreShell from '@/components/layout/StoreShell';
import ProductCard from '@/components/products/ProductCard';
import { getCategories, getProducts } from '@/lib/data/products';
import { createClient } from '@/lib/supabase/server';
import { ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';

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
      {/* Breadcrumb Strip */}
      <div className="bg-[#f5f5f5] border-b border-[#e1e1e1] py-2.5">
        <div className="container-custom flex items-center gap-2 text-[12px] text-[#666]">
          <Link href="/" className="hover:text-[#1e5cea]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
          <Link href="/products" className="hover:text-[#1e5cea]">Shop</Link>
          {activeCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
              <span className="font-bold text-[#222]">{activeCategory.name}</span>
            </>
          )}
          {query && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
              <span className="font-bold text-[#222]">Search: &quot;{query}&quot;</span>
            </>
          )}
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar (Wolmart Shop Sidebar Style) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Category Filter Box */}
            <div className="bg-white border border-[#e1e1e1] rounded-md p-4 shadow-2xs">
              <h3 className="font-bold text-[14px] text-[#222] uppercase tracking-wider pb-2.5 border-b border-[#f1f1f1] mb-3">
                All Departments
              </h3>
              <ul className="space-y-1.5 text-[13px]">
                <li>
                  <Link
                    href="/products"
                    className={`block py-1.5 px-2 rounded font-semibold transition-colors ${
                      !categorySlug
                        ? 'bg-[#1e5cea] text-white'
                        : 'text-[#555] hover:text-[#1e5cea] hover:bg-[#f9f9f9]'
                    }`}
                  >
                    All Products ({total})
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/products?category=${c.slug}`}
                      className={`block py-1.5 px-2 rounded font-semibold transition-colors ${
                        categorySlug === c.slug
                          ? 'bg-[#1e5cea] text-white'
                          : 'text-[#555] hover:text-[#1e5cea] hover:bg-[#f9f9f9]'
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter Box */}
            <div className="bg-white border border-[#e1e1e1] rounded-md p-4 shadow-2xs">
              <h3 className="font-bold text-[14px] text-[#222] uppercase tracking-wider pb-2.5 border-b border-[#f1f1f1] mb-3">
                Price Range (GHS)
              </h3>
              <div className="space-y-1.5 text-[13px]">
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
                      className={`block py-1.5 px-2 rounded font-semibold transition-colors ${
                        isMatch
                          ? 'bg-[#1e5cea] text-white'
                          : 'text-[#555] hover:text-[#1e5cea] hover:bg-[#f9f9f9]'
                      }`}
                    >
                      {tier.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Delivery Note Box */}
            <div className="bg-[#f0f4fe] border border-[#d2e0fc] rounded-md p-4 text-[12px] text-[#222]">
              <h4 className="font-bold text-[#1e5cea] uppercase mb-1">🇬🇭 Fast Dispatch</h4>
              <p className="text-[#555] leading-relaxed">
                Orders shipped within 24-48 hours with door-to-door delivery across Ghana.
              </p>
            </div>
          </aside>

          {/* Main Catalog View (9 Cols) */}
          <div className="lg:col-span-9 space-y-4">
            {/* Top Toolbar Bar */}
            <div className="bg-white border border-[#e1e1e1] rounded-md p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <span className="text-[13px] text-[#666]">
                Showing <strong className="text-[#222]">{products.length}</strong> of{' '}
                <strong className="text-[#222]">{total}</strong> products
              </span>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-[#666] font-medium">Sort by:</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'Newest', value: 'newest' },
                    { label: 'Price: Low to High', value: 'price_asc' },
                    { label: 'Price: High to Low', value: 'price_desc' },
                  ].map((s) => {
                    const p = new URLSearchParams();
                    if (categorySlug) p.set('category', categorySlug);
                    if (query) p.set('q', query);
                    if (minPrice) p.set('minPrice', minPrice.toString());
                    if (maxPrice) p.set('maxPrice', maxPrice.toString());
                    p.set('sort', s.value);

                    const isSelected = sortBy === s.value;
                    return (
                      <Link
                        key={s.value}
                        href={`/products?${p.toString()}`}
                        className={`px-2.5 py-1 rounded text-[12px] font-semibold transition-colors ${
                          isSelected
                            ? 'bg-[#1e5cea] text-white'
                            : 'bg-[#f4f4f4] text-[#444] hover:bg-[#e9e9e9]'
                        }`}
                      >
                        {s.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Active Filters Tag Bar */}
            {(categorySlug || query || minPrice || maxPrice) && (
              <div className="flex flex-wrap items-center gap-2 bg-white border border-[#e1e1e1] p-2.5 rounded-md text-[12px]">
                <span className="font-bold text-[#888]">Active:</span>
                {categorySlug && (
                  <span className="bg-[#f0f4fe] text-[#1e5cea] font-bold px-2 py-0.5 rounded border border-[#d2e0fc]">
                    Category: {activeCategory?.name || categorySlug}
                  </span>
                )}
                {query && (
                  <span className="bg-[#f0f4fe] text-[#1e5cea] font-bold px-2 py-0.5 rounded border border-[#d2e0fc]">
                    Query: &quot;{query}&quot;
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="bg-[#f0f4fe] text-[#1e5cea] font-bold px-2 py-0.5 rounded border border-[#d2e0fc]">
                    Price: GH₵ {minPrice || 0} - {maxPrice || 'Any'}
                  </span>
                )}
                <Link href="/products" className="text-[#e53935] font-bold hover:underline ml-auto">
                  Reset All Filters
                </Link>
              </div>
            )}

            {/* Product Cards Grid */}
            {products.length === 0 ? (
              <div className="bg-white border border-[#e1e1e1] rounded-md p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#f4f4f4] flex items-center justify-center mx-auto text-[#999]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-[16px] text-[#222]">No matching products found</h3>
                <p className="text-[13px] text-[#666] max-w-sm mx-auto">
                  Try clearing your filters or searching for another keyword.
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-[#1e5cea] text-white px-5 py-2 rounded text-[13px] font-bold"
                >
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white border border-[#e1e1e1] rounded-md p-3.5 flex items-center justify-between mt-6">
                <span className="text-[12px] text-[#666]">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <Link
                      href={`/products?page=${currentPage - 1}${
                        categorySlug ? `&category=${categorySlug}` : ''
                      }${query ? `&q=${query}` : ''}&sort=${sortBy}`}
                      className="px-3 py-1.5 rounded border border-[#ddd] bg-white text-[12px] font-bold text-[#444] hover:bg-[#f5f5f5]"
                    >
                      <ChevronLeft className="w-4 h-4 inline mr-1" />
                      Prev
                    </Link>
                  )}

                  {currentPage < totalPages && (
                    <Link
                      href={`/products?page=${currentPage + 1}${
                        categorySlug ? `&category=${categorySlug}` : ''
                      }${query ? `&q=${query}` : ''}&sort=${sortBy}`}
                      className="px-3 py-1.5 rounded bg-[#1e5cea] text-white text-[12px] font-bold hover:bg-[#1545b5]"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 inline ml-1" />
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

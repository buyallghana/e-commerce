import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import StoreShell from '@/components/layout/StoreShell';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { getProductBySlug, getCategories } from '@/lib/data/products';
import { getActiveShippingZones } from '@/lib/data/shipping';
import { createClient } from '@/lib/supabase/server';
import { formatGHS } from '@/lib/utils';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | BuyAll Ghana' };
  }

  const priceFormatted = formatGHS(Number(product.base_price));
  return {
    title: `${product.title} (${priceFormatted})`,
    description: product.description || `Buy ${product.title} in Ghana with fast nationwide delivery. Secure checkout via Paystack.`,
    openGraph: {
      title: `${product.title} — BuyAll Ghana`,
      description: product.description || 'Quality Ghanaian physical goods delivered to your doorstep.',
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categories = await getCategories();
  const shippingZones = await getActiveShippingZones();

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

  return (
    <StoreShell categories={categories} userEmail={user?.email} isAdmin={isAdmin}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductDetailClient
          product={product}
          shippingZones={shippingZones}
          userEmail={user?.email}
        />
      </div>
    </StoreShell>
  );
}

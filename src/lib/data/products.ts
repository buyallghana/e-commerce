import { createClient } from '@/lib/supabase/server';
import { Product, Category } from '@/types/database';

export interface ProductFilterOptions {
  categorySlug?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'title';
  page?: number;
  limit?: number;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data as Category[]) || [];
}

export async function getProducts(options: ProductFilterOptions = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const supabase = await createClient();
  const {
    categorySlug,
    query,
    minPrice,
    maxPrice,
    sortBy = 'newest',
    page = 1,
    limit = 12,
  } = options;

  let queryBuilder = supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      variants:product_variants(*)
    `,
      { count: 'exact' }
    )
    .eq('is_active', true);

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (cat) {
      queryBuilder = queryBuilder.eq('category_id', cat.id);
    }
  }

  if (query) {
    queryBuilder = queryBuilder.ilike('title', `%${query}%`);
  }

  if (minPrice !== undefined) {
    queryBuilder = queryBuilder.gte('base_price', minPrice);
  }

  if (maxPrice !== undefined) {
    queryBuilder = queryBuilder.lte('base_price', maxPrice);
  }

  switch (sortBy) {
    case 'price_asc':
      queryBuilder = queryBuilder.order('base_price', { ascending: true });
      break;
    case 'price_desc':
      queryBuilder = queryBuilder.order('base_price', { ascending: false });
      break;
    case 'title':
      queryBuilder = queryBuilder.order('title', { ascending: true });
      break;
    case 'newest':
    default:
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      break;
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  queryBuilder = queryBuilder.range(from, to);

  const { data, count, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0, page, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products: (data as Product[]) || [],
    total,
    page,
    totalPages,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      category:categories(*),
      variants:product_variants(*)
    `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Product;
}

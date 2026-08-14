export type UserRole = 'customer' | 'admin';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'completed';
export type DiscountType = 'percentage' | 'fixed';
export type RuleType = 'bulk_qty' | 'category_sale' | 'min_cart_total';
export type NotificationType = 'order' | 'shipping' | 'return' | 'stock' | 'system';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  region: string;
  digital_address: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  weight_kg: number;
  is_variant_product: boolean;
  reviews_enabled: boolean;
  is_active: boolean;
  images: string[];
  attributes_schema?: Array<{ name: string; options: string[] }>;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode: string | null;
  title: string;
  attributes: Record<string, string>;
  price_override: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  weight_kg: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface InventoryLog {
  id: string;
  variant_id: string;
  change_amount: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  reference_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  is_active: boolean;
  created_at: string;
  rates?: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  zone_id: string;
  min_weight_kg: number;
  max_weight_kg: number;
  base_fee: number;
  per_kg_extra_fee: number;
  estimated_days: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  max_uses_total: number | null;
  max_uses_per_user: number;
  times_used: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AutomaticDiscount {
  id: string;
  name: string;
  rule_type: RuleType;
  rule_config: Record<string, unknown>;
  discount_type: DiscountType;
  discount_value: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  paystack_reference: string | null;
  paystack_access_code: string | null;
  currency: string;
  subtotal: number;
  shipping_cost: number;
  discount_total: number;
  grand_total: number;
  shipping_address: {
    recipient_name: string;
    phone_number: string;
    street_address: string;
    city: string;
    region: string;
    digital_address?: string;
  };
  shipping_zone_id: string | null;
  total_weight_kg: number;
  coupon_id: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  sku: string;
  title: string;
  attributes: Record<string, string>;
  unit_price: number;
  quantity: number;
  total_price: number;
  weight_kg: number;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Return {
  id: string;
  return_number: string;
  order_id: string;
  customer_id: string;
  reason: string;
  status: ReturnStatus;
  refund_amount: number;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  items?: ReturnItem[];
  order?: Order;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  order_item_id: string;
  quantity_returned: number;
  condition: string | null;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string;
  is_approved: boolean;
  created_at: string;
  customer?: Profile;
}

export interface CartItem {
  id: string;
  customer_id: string;
  variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  variant?: ProductVariant & { product: Product };
}

export interface Wishlist {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link_url: string | null;
  created_at: string;
}

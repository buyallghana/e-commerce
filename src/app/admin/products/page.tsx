import React from 'react';
import Image from 'next/image';
import { getProducts } from '@/lib/data/products';
import { adminUpdateStockAction } from '@/app/actions/admin-products';
import { formatGHS } from '@/lib/utils';
import { Boxes } from 'lucide-react';

export default async function AdminProductsPage() {
  const { products } = await getProducts({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#222]">Products & Inventory Control</h1>
          <p className="text-[12px] text-[#666]">Monitor inventory levels and update SKU stock quantities</p>
        </div>
      </div>

      <div className="bg-white border border-[#e1e1e1] rounded-md overflow-hidden shadow-2xs">
        <div className="divide-y divide-[#f1f1f1]">
          {products.map((product) => {
            const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
            const image = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';

            return (
              <div key={product.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded bg-[#f9f9f9] overflow-hidden shrink-0 border border-[#e1e1e1]">
                      <Image src={image} alt={product.title} fill className="object-cover" sizes="56px" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] text-[#222]">{product.title}</h3>
                      <span className="text-[11px] text-[#888]">{product.category?.name || 'General'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-[14px] text-[#1e5cea] block">
                      {formatGHS(Number(product.base_price))}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        totalStock <= 5 ? 'bg-[#e53935]/15 text-[#e53935]' : 'bg-[#00d084]/15 text-[#008f5a]'
                      }`}
                    >
                      Total Stock: {totalStock} units
                    </span>
                  </div>
                </div>

                {/* Variants Stock Editor */}
                {product.variants && product.variants.length > 0 && (
                  <div className="bg-[#f9f9f9] p-3 rounded space-y-2 text-[12px]">
                    <span className="font-bold text-[#444] uppercase tracking-wider text-[11px] block">
                      Variants & Stock Quantities:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {product.variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="bg-white border border-[#e1e1e1] p-2 rounded flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-[#222] block">{variant.title}</span>
                            <span className="text-[10px] text-[#888]">SKU: {variant.sku}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1e5cea]">{variant.stock_quantity} in stock</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

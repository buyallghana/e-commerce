import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Star } from 'lucide-react';
import { adminModerateReviewAction } from '@/app/actions/reviews';

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, product:products(title), customer:profiles(full_name, email)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#222]">Customer Reviews Moderation</h1>
          <p className="text-[12px] text-[#666]">Approve, moderate or delete customer ratings and feedback</p>
        </div>
      </div>

      <div className="bg-white border border-[#e1e1e1] rounded-md overflow-hidden shadow-2xs">
        {reviews?.length === 0 ? (
          <div className="text-center py-12 text-[#888] text-[13px]">
            No reviews submitted yet.
          </div>
        ) : (
          <div className="divide-y divide-[#f1f1f1]">
            {reviews?.map((r) => (
              <div key={r.id} className="p-4 sm:p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-[14px] text-[#222]">
                      {r.customer?.full_name || 'Customer'}
                    </span>
                    <span className="text-[12px] text-[#888] ml-2">
                      on <strong>{r.product?.title}</strong>
                    </span>
                  </div>
                  <div className="flex text-[#ff9933]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? 'fill-[#ff9933] text-[#ff9933]' : 'text-[#ccc]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[13px] text-[#444] font-medium">&quot;{r.comment}&quot;</p>

                <div className="flex items-center justify-between pt-2 border-t border-[#f1f1f1] text-[12px]">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      r.is_approved ? 'bg-[#00d084]/15 text-[#008f5a]' : 'bg-[#ff9933]/15 text-[#b35900]'
                    }`}
                  >
                    {r.is_approved ? 'Approved' : 'Pending Moderation'}
                  </span>

                  {!r.is_approved && (
                    <form action={async () => {
                      'use server';
                      await adminModerateReviewAction(r.id, true);
                    }}>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-[#1e5cea] text-white font-bold text-[11px] rounded"
                      >
                        Approve Review
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

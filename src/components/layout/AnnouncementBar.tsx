import React from 'react';
import { Truck, ShieldCheck, PhoneCall } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-amber-400">
            <Truck className="w-3.5 h-3.5" />
            <span>Fast delivery across all 16 Regions in Ghana</span>
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Genuine Physical Products</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1">
            <PhoneCall className="w-3 h-3 text-slate-400" />
            <span>Support: +233 (0) 50 000 0000</span>
          </span>
          <span className="bg-slate-800 text-amber-300 font-semibold px-2 py-0.5 rounded text-[11px]">
            GHS (GH₵)
          </span>
        </div>
      </div>
    </div>
  );
}

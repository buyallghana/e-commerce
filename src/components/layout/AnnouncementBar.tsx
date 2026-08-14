import React from 'react';
import Link from 'next/link';
import { Phone, Truck, ShieldCheck } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-[#f5f5f5] text-[#666666] text-[12px] border-b border-[#e1e1e1] py-1.5 hidden sm:block">
      <div className="container-custom flex items-center justify-between">
        {/* Left message */}
        <div className="flex items-center gap-4">
          <span className="font-normal flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#1e5cea]" />
            <span>Nationwide doorstep delivery across Ghana</span>
          </span>
          <span className="text-[#ccc]">|</span>
          <span className="flex items-center gap-1 text-[#444]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00d084]" />
            <span>100% Genuine Physical Inventory</span>
          </span>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4 text-[#555]">
          <span className="flex items-center gap-1.5 text-[#222] font-semibold">
            <Phone className="w-3 h-3 text-[#1e5cea]" />
            <span>+233 (0) 50 000 0000</span>
          </span>
          <span className="text-[#ccc]">|</span>
          <Link href="/account" className="hover:text-[#1e5cea] transition-colors">
            Track Order
          </Link>
          <span className="text-[#ccc]">|</span>
          <span className="bg-white border border-[#ddd] text-[#222] font-bold px-1.5 py-0.5 rounded text-[11px]">
            GHS (GH₵)
          </span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { getActiveShippingZones } from '@/lib/data/shipping';
import { formatGHS } from '@/lib/utils';
import { Truck, MapPin } from 'lucide-react';

export default async function AdminShippingPage() {
  const zones = await getActiveShippingZones();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#222]">Ghana Shipping Zones & Rates</h1>
          <p className="text-[12px] text-[#666]">Configure delivery fees across Ghana&apos;s 16 regions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const rate = zone.rates?.[0];
          return (
            <div key={zone.id} className="bg-white border border-[#e1e1e1] rounded-md p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[15px] text-[#222]">{zone.name}</h3>
                <span className="bg-[#1e5cea] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                  {rate ? formatGHS(Number(rate.base_fee)) : 'GHS 0'}
                </span>
              </div>

              <div className="text-[12px] text-[#666]">
                <div className="flex items-center gap-1.5 font-semibold text-[#444] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1e5cea]" />
                  <span>Covered Regions:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {zone.regions.map((r, i) => (
                    <span key={i} className="bg-[#f5f5f5] text-[#555] px-2 py-0.5 rounded text-[11px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#f1f1f1] flex justify-between text-[12px] text-[#777]">
                <span>Estimated Timeframe:</span>
                <strong className="text-[#222]">{rate?.estimated_days || '1-2 business days'}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

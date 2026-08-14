import React from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-xl flex items-center justify-center mx-auto">
          BA
        </div>
        <h1 className="text-xl font-bold text-slate-950">BuyAll Ghana</h1>
        <p className="text-xs text-slate-500">
          Backend services, database schema, Paystack webhook, and server actions are ready and online.
        </p>
        <div className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
          ● Ready for UI Instructions
        </div>
      </div>
    </main>
  );
}

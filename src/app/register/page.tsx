'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpAction } from '@/app/actions/auth';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);

    const res = await signUpAction(formData);
    setIsLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block font-black text-3xl tracking-tight text-[#222529]">
          BUYALL<span className="text-[#1e5cea]">GH</span>
        </Link>
        <h2 className="mt-2 text-[20px] font-bold text-[#222529]">Create a Customer Account</h2>
        <p className="mt-1 text-[13px] text-[#666]">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-[#1e5cea] hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-[#e1e1e1] rounded-md shadow-xs space-y-5">
          {errorMsg && (
            <div className="p-3 bg-[#fff0f0] border border-[#f5c6cb] text-[#e53935] text-[12px] font-bold rounded">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
            <div>
              <label className="block font-bold text-[#333] mb-1">Full Name *</label>
              <div className="relative rounded">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Kwame Mensah"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#ccc] rounded text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#333] mb-1">Email Address *</label>
              <div className="relative rounded">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kwame@example.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#ccc] rounded text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#333] mb-1">Ghana Phone Number (For Courier) *</label>
              <div className="relative rounded">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="024 123 4567"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#ccc] rounded text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#333] mb-1">Password *</label>
              <div className="relative rounded">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 border border-[#ccc] rounded text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded bg-[#1e5cea] hover:bg-[#1545b5] text-white font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-2xs"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#f1f1f1] flex items-center justify-center gap-2 text-[12px] text-[#777]">
            <ShieldCheck className="w-4 h-4 text-[#00d084]" />
            <span>Fast Ghana delivery & Paystack escrow</span>
          </div>
        </div>
      </div>
    </div>
  );
}

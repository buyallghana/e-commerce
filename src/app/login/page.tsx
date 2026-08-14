'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInAction } from '@/app/actions/auth';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const res = await signInAction(formData);
    setIsLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-8 border border-[#e1e1e1] rounded-md shadow-xs space-y-5">
      {errorMsg && (
        <div className="p-3 bg-[#fff0f0] border border-[#f5c6cb] text-[#e53935] text-[12px] font-bold rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
        <div>
          <label className="block font-bold text-[#333] mb-1">Email Address</label>
          <div className="relative rounded">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2.5 border border-[#ccc] rounded text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-bold text-[#333]">Password</label>
          </div>
          <div className="relative rounded">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 border border-[#ccc] rounded text-[#222] focus:outline-hidden focus:border-[#1e5cea]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded bg-[#1e5cea] hover:bg-[#1545b5] text-white font-bold text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-2xs"
        >
          <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-[#f1f1f1] flex items-center justify-center gap-2 text-[12px] text-[#777]">
        <ShieldCheck className="w-4 h-4 text-[#00d084]" />
        <span>Secure encryption & single-vendor order tracking</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block font-black text-3xl tracking-tight text-[#222529]">
          BUYALL<span className="text-[#1e5cea]">GH</span>
        </Link>
        <h2 className="mt-2 text-[20px] font-bold text-[#222529]">Sign in to your account</h2>
        <p className="mt-1 text-[13px] text-[#666]">
          Or{' '}
          <Link href="/register" className="font-bold text-[#1e5cea] hover:underline">
            create a new customer account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="p-8 text-center text-[13px] text-[#888]">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

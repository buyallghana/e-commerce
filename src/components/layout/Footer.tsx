import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#222529] text-[#999] text-[13px] border-t border-[#333] mt-auto pb-16 lg:pb-0">
      {/* Newsletter Strip */}
      <div className="bg-[#1e5cea] text-white py-6">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-[18px] tracking-tight">Subscribe To Our Newsletter</h3>
            <p className="text-[12px] text-white/80">Get all the latest information on Events, Sales and Offers in Ghana.</p>
          </div>
          <div className="w-full max-w-md flex rounded overflow-hidden bg-white p-1">
            <input
              type="email"
              placeholder="Your E-mail Address"
              className="flex-1 px-3 py-2 text-[13px] text-[#222] focus:outline-hidden"
            />
            <button className="bg-[#222529] hover:bg-[#333] text-white font-bold text-[12px] px-5 py-2 uppercase rounded-sm transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links Grid */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Contact Info */}
          <div className="space-y-3">
            <div className="font-black text-2xl text-white tracking-tighter">
              BUYALL<span className="text-[#1e5cea]">GH</span>
            </div>
            <p className="text-[12px] text-[#aaa] leading-relaxed">
              Ghana&apos;s trusted single-vendor online store for authentic apparel, handcrafted goods, tech gear, and skincare.
            </p>
            <div className="space-y-2 pt-2 text-[12px] text-[#ccc]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#1e5cea]" />
                <span className="font-bold text-white">+233 (0) 50 000 0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#1e5cea]" />
                <span>support@buyallghana.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#1e5cea]" />
                <span>Accra Central, Greater Accra Region</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-bold text-[14px] text-white uppercase tracking-wider mb-4 border-b border-[#333] pb-2">
              Popular Categories
            </h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/products?category=fashion-apparel" className="hover:text-white transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link href="/products?category=electronics-gadgets" className="hover:text-white transition-colors">
                  Electronics & Tech
                </Link>
              </li>
              <li>
                <Link href="/products?category=beauty-personal-care" className="hover:text-white transition-colors">
                  Beauty & Skincare
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-living" className="hover:text-white transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Catalog Goods
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div>
            <h4 className="font-bold text-[14px] text-white uppercase tracking-wider mb-4 border-b border-[#333] pb-2">
              Customer Care
            </h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Profile & Orders
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Track Delivery
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Methods */}
          <div>
            <h4 className="font-bold text-[14px] text-white uppercase tracking-wider mb-4 border-b border-[#333] pb-2">
              Payment & Security
            </h4>
            <p className="text-[12px] text-[#aaa] mb-3">
              We accept all major Ghanaian Mobile Money and card payments securely through Paystack.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="bg-[#333] text-white px-2.5 py-1 rounded font-bold">MTN MoMo</span>
              <span className="bg-[#333] text-white px-2.5 py-1 rounded font-bold">Telecel Cash</span>
              <span className="bg-[#333] text-white px-2.5 py-1 rounded font-bold">AT Money</span>
              <span className="bg-[#333] text-white px-2.5 py-1 rounded font-bold">Visa / Master</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#333] py-4 text-center text-[12px] text-[#777]">
        <div className="container-custom">
          <p>Copyright © {new Date().getFullYear()} BuyAll Ghana. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { Globe, Compass, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-20 text-neutral-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-xs tracking-wider uppercase">
              Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:underline">Help Centre</a></li>
              <li><a href="#" className="hover:underline">StayCover Protection</a></li>
              <li><a href="#" className="hover:underline">Anti-discrimination</a></li>
              <li><a href="#" className="hover:underline">Disability support</a></li>
              <li><a href="#" className="hover:underline">Cancellation options</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-xs tracking-wider uppercase">
              Hosting
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/host/properties/new" className="hover:underline">StayNest your home</a></li>
              <li><a href="#" className="hover:underline">Cover for Hosts</a></li>
              <li><a href="#" className="hover:underline">Hosting resources</a></li>
              <li><a href="#" className="hover:underline">Community forum</a></li>
              <li><a href="#" className="hover:underline">Hosting responsibly</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-xs tracking-wider uppercase">
              StayNest
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:underline">Newsroom</a></li>
              <li><a href="#" className="hover:underline">New features</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Investors</a></li>
              <li><a href="#" className="hover:underline">Gift cards</a></li>
            </ul>
          </div>

          {/* Column 4 - Brand blurb */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-neutral-900">StayNest</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Modern full-stack property rental marketplace connecting hosts and guests worldwide.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-neutral-800">
              <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                <Globe className="w-4 h-4" />
                <span>English (IN)</span>
              </div>
              <div className="cursor-pointer hover:underline">₹ INR</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 StayNest, Inc. • Privacy • Terms • Sitemap • Company details
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
            <span>as an Internship Capstone Project</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

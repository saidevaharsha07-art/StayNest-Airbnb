import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Compass, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 flex items-center justify-center text-brand-500 mb-6">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">
          We can't seem to find the page you're looking for
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm mb-8 leading-relaxed">
          The link might be broken, or the page may have been removed. Let's get you back on track.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-900 text-white font-bold text-xs shadow-md hover:bg-neutral-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;

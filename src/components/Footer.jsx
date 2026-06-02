import React from 'react';
import { Clapperboard, Shield, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Branding Logo */}
        <div className="flex items-center space-x-2">
          <Clapperboard className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-bold tracking-tight text-white">
            The Review <span className="text-amber-500 font-serif italic font-medium">Guy</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6 text-xs text-gray-500 font-light">
          <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <Link to="/categories" className="hover:text-gray-300 transition-colors">Categories</Link>
          <a href="#" className="hover:text-gray-300 transition-colors flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Privacy</span>
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors flex items-center space-x-1">
            <HelpCircle className="h-3 w-3" />
            <span>Support</span>
          </a>
        </div>

        {/* Rights Notice */}
        <div className="text-[11px] text-gray-600 font-light font-mono">
          &copy; {new Date().getFullYear()} The Review Guy. Created for movie lovers.
        </div>

      </div>
    </footer>
  );
}

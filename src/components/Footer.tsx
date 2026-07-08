import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_transparent.png";

export default function Footer() {
  return (
    <footer className="bg-surface-container pt-20 pb-10 px-5 md:px-20 border-t border-surface-variant">
      <div className="max-w-[1536px] mx-auto">
        {/* Top Section: Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 mb-24 px-5">
          {/* Main Brand Column */}
          <div className="flex flex-col items-start col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Gabby Newluk Logo" className="h-8 w-auto object-contain" />
              <span className="font-serif text-3xl italic text-primary block">Gabby Newluk</span>
            </div>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6 max-w-xs">
              A modern translation of rich sartorial heritage. Crafted in Accra, worn globally.
            </p>
          </div>

          {/* Column 1: Shop */}
          <div className="flex flex-col lg:pl-10">
            <h4 className="text-[10px] tracking-widest uppercase font-label text-primary mb-6">Shop</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/shop" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/category/kaftans" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">Kaftans</Link></li>
              <li><Link to="/category/agbadas" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">Agbadas</Link></li>
              <li><Link to="/category/accessories" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Column 2: Help */}
          <div className="flex flex-col">
            <h4 className="text-[10px] tracking-widest uppercase font-label text-primary mb-6">Help</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/contact" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">Contact Us</Link></li>
              <li><a href="/#faq" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">FAQ</a></li>
              <li><Link to="/shipping" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/size-guide" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">Size Guide</Link></li>
              <li><Link to="/how-to-measure" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">How to Measure</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="flex flex-col">
            <h4 className="text-[10px] tracking-widest uppercase font-label text-primary mb-6">Legal</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/legal" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal" className="font-sans text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-outline-variant/50 mb-16"></div>

        {/* Large Logo */}
        <div className="flex justify-center items-center gap-4 mb-16 overflow-hidden">
          <img src={logo} alt="Gabby Newluk Logo" className="h-[12vw] sm:h-[140px] w-auto object-contain" />
          <h2 className="font-serif text-[12vw] sm:text-[140px] leading-none text-primary italic tracking-tight opacity-90 overflow-hidden whitespace-nowrap text-center">
            Gabby Newluk
          </h2>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-outline-variant/50">
          <p className="text-label text-on-surface-variant mb-6 sm:mb-0">
            © {new Date().getFullYear()} GABBY NEWLUK. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            {['INSTAGRAM'].map((social) => (
              <a key={social} href={social === 'INSTAGRAM' ? "https://www.instagram.com/gabbynewlukclothing/" : "#"} target={social === 'INSTAGRAM' ? "_blank" : undefined} rel={social === 'INSTAGRAM' ? "noopener noreferrer" : undefined} className="text-label text-on-surface-variant hover:text-primary transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

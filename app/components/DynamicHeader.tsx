'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LOGO_VERSION = '20260424';

export default function DynamicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const trigger = window.innerHeight * 0.75;
      setIsScrolled(scrolled > trigger);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-100 transition-all duration-500 flex justify-between items-center text-white p-4 ${
        isScrolled ? 'md:bg-white' : 'md:p-8'
      }`} style={{color: isScrolled ? '#514A51' : 'white'}}>
        {/* Logo */}
        <Link href="/" className="flex items-center transition-transform hover:scale-105 duration-300">
          <Image 
            src={`/images/logo/logo5.PNG?v=${LOGO_VERSION}`}
            alt="art0nym" 
            width={isScrolled ? 120 : 160}
            height={isScrolled ? 60 : 80}
            className="transition-all duration-300"
            style={{
              height: 'auto'
            }}
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <a 
            href="#gallery" 
            onClick={(e) => { e.preventDefault(); document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }); }} 
            className="px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 font-semibold"
            style={{
              color: isScrolled ? '#514A51' : 'white', 
              textShadow: isScrolled ? 'none' : '2px 2px 4px rgba(0,0,0,0.8)', 
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#514A51';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isScrolled ? '#514A51' : 'white';
            }}
          >
            Gallery
          </a>
          <a 
            href="#past-conventions" 
            onClick={(e) => { e.preventDefault(); document.getElementById('past-conventions')?.scrollIntoView({ behavior: 'smooth' }); }} 
            className="px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 font-semibold"
            style={{
              color: isScrolled ? '#514A51' : 'white', 
              textShadow: isScrolled ? 'none' : '2px 2px 4px rgba(0,0,0,0.8)', 
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#514A51';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isScrolled ? '#514A51' : 'white';
            }}
          >
            Past Events
          </a>
          <a 
            href="#events" 
            onClick={(e) => { e.preventDefault(); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }); }} 
            className="px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 font-semibold"
            style={{
              color: isScrolled ? '#514A51' : 'white', 
              textShadow: isScrolled ? 'none' : '2px 2px 4px rgba(0,0,0,0.8)', 
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#514A51';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isScrolled ? '#514A51' : 'white';
            }}
          >
            Upcoming Events
          </a>
          {/* Contact link removed for privacy */}
        </nav>

        {/* Mobile Hamburger */}
        <button 
          className="md:hidden z-110 w-10 h-10 flex flex-col justify-center items-center relative ml-auto"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span 
            className={`absolute block w-7 h-0.5 transition-all duration-300 ease-in-out`}
            style={{
              backgroundColor: isScrolled ? '#514A51' : 'white',
              transform: isMobileMenuOpen ? 'rotate(45deg)' : 'translateY(-8px)',
              opacity: isMobileMenuOpen ? 1 : 1
            }}
          />
          <span 
            className={`absolute block w-7 h-0.5 transition-all duration-300 ease-in-out`}
            style={{
              backgroundColor: isScrolled ? '#514A51' : 'white',
              opacity: isMobileMenuOpen ? 0 : 1
            }}
          />
          <span 
            className={`absolute block w-7 h-0.5 transition-all duration-300 ease-in-out`}
            style={{
              backgroundColor: isScrolled ? '#514A51' : 'white',
              transform: isMobileMenuOpen ? 'rotate(-45deg)' : 'translateY(8px)',
              opacity: isMobileMenuOpen ? 1 : 1
            }}
          />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-90 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'}}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`fixed right-0 top-0 h-full w-80 transition-transform duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{backgroundColor: '#FFFFFF'}}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 p-8 pt-24 space-y-6">
              <a 
                href="#gallery" 
                className="block text-2xl font-bold transition-all hover:translate-x-2 hover:opacity-70"
                style={{color: '#514A51', cursor: 'pointer'}}
                onClick={(e) => { e.preventDefault(); document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
              >
                Gallery
              </a>
              <a 
                href="#past-conventions" 
                className="block text-2xl font-bold transition-all hover:translate-x-2 hover:opacity-70"
                style={{color: '#514A51', cursor: 'pointer'}}
                onClick={(e) => { e.preventDefault(); document.getElementById('past-conventions')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
              >
                Past Events
              </a>
              <a 
                href="#events" 
                className="block text-2xl font-bold transition-all hover:translate-x-2 hover:opacity-70"
                style={{color: '#514A51', cursor: 'pointer'}}
                onClick={(e) => { e.preventDefault(); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}
              >
                Events
              </a>
              {/* Contact link removed for privacy */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
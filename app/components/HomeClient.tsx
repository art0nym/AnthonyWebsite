'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import DynamicHeader from './DynamicHeader';
import ParallaxContent from './ParallaxContent';
import Gallery from './Gallery';
import ConventionTableGallery from './ConventionTableGallery';
import EventsSchedule from './EventsSchedule';
import type { ScheduleMonth, SiteImage } from '@/lib/site-content';
// ...existing code...
// ...existing code...

interface HomeClientProps {
  galleryImages: SiteImage[];
  conventionTableImages: SiteImage[];
  schedule: ScheduleMonth[];
}

export default function HomeClient({ galleryImages, conventionTableImages, schedule }: HomeClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollFrame = useRef<number | null>(null);
  const latestScroll = useRef(0);

  const computeContentOpacity = () => {
    const heroHeight = window.innerHeight * 1.05 - 100;
    const fadeStartScroll = heroHeight * 0.6; // Start fading at 60%
    const fadeEndScroll = heroHeight * 0.95; // Complete at 95%
    const scrollProgress = Math.max(0, latestScroll.current - fadeStartScroll);
    const fadeRange = fadeEndScroll - fadeStartScroll;
    const opacity = Math.min(1, fadeRange > 0 ? scrollProgress / fadeRange : 1);
    if (contentRef.current) {
      contentRef.current.style.opacity = opacity.toString();
      contentRef.current.style.pointerEvents = opacity < 0.5 ? 'none' : 'auto';
    }
  };

  useEffect(() => {
    const updateContentOpacity = () => {
      scrollFrame.current = null;
      computeContentOpacity();
    };

    const handleScroll = () => {
      if (isModalOpen) {
        if (contentRef.current) {
          contentRef.current.style.opacity = '1';
          contentRef.current.style.pointerEvents = 'auto';
        }
        return;
      }
      latestScroll.current = window.pageYOffset;
      if (scrollFrame.current === null) {
        scrollFrame.current = window.requestAnimationFrame(updateContentOpacity);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Kick off initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollFrame.current !== null) {
        cancelAnimationFrame(scrollFrame.current);
      }
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen && contentRef.current) {
      contentRef.current.style.opacity = '1';
      contentRef.current.style.pointerEvents = 'auto';
      return;
    }
    computeContentOpacity();
  }, [isModalOpen]);

  return (
    <div className="min-h-screen" style={{backgroundColor: '#D9F1F0', color: '#514A51'}}>
      {/* Header - only show when modal is not open */}
      {!isModalOpen && <DynamicHeader />}

      {/* Hero */}
      <ParallaxContent />

      {/* Main Content Container */}
      <div 
        ref={contentRef}
        className="relative"
        style={{
          backgroundColor: 'transparent',
          color: '#514A51',
          opacity: 0,
          transition: 'opacity 0.1s ease-out',
          pointerEvents: 'none'
        }}
      >
        <div className="relative z-10">
        {/* Gallery Section - replaces illustration section */}
        <section id="gallery" className="py-16" style={{scrollMarginTop: '120px'}}>
          <div className="text-center mb-8 px-4">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-4" 
              style={{ color: '#7576F9', textTransform: 'uppercase' }}
            >
              ILLUSTRATIONS
            </h2>
          </div>
          <Gallery images={galleryImages} onModalChange={setIsModalOpen} />
        </section>

        {/* Past Convention Tables Section */}
        <section id="past-conventions" className="py-16" style={{scrollMarginTop: '120px'}}>
          <div className="text-center mb-8 px-4">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-4" 
              style={{ color: '#7576F9', textTransform: 'uppercase' }}
            >
              Past Convention Tables
            </h2>
            <p className="text-lg md:text-xl" style={{ color: '#514A51' }}>
              Convention tables and appearances
            </p>
          </div>
          <ConventionTableGallery images={conventionTableImages} onModalChange={setIsModalOpen} />
        </section>

  <EventsSchedule galleryImages={galleryImages} schedule={schedule} />

        {/* Footer Section (contact form omitted) */}
        <footer className="py-16 px-8" style={{backgroundColor: '#D9F1F0', scrollMarginTop: '120px'}}>
          <div className="max-w-6xl mx-auto space-y-16">
            {/* About Section */}
            <div className="space-y-4">
              <div className="text-center mb-8">
                <h3 className="text-4xl font-bold mb-3" style={{color: '#75B8F9'}}>About Art0nym</h3>
              </div>
              <p className="text-lg leading-relaxed mb-4" style={{color: '#514A51'}}>
                Art0nym is a digital artist who specializes in stylized fan art illustrations. By combining semi-realism and anime styles, he showcases a vibrant and action-packed scene with every piece.
              </p>
            </div>

            {/* Social Media & Copyright */}
            <div className="border-t pt-8" style={{borderColor: '#75B8F9'}}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
                <div className="text-sm" style={{color: '#514A51'}}>
                  © 2026 <span className="font-semibold" style={{color: '#514A51'}}>art0nym</span>. All rights reserved.
                </div>
                <div className="flex space-x-3">
                  <a href="https://x.com/art0nym15" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                    <Image src="/images/socials/x.png" alt="X (Twitter)" width={40} height={40} className="w-10 h-10 rounded-lg" />
                  </a>
                  <a href="https://www.instagram.com/art0nym" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                    <Image src="/images/socials/ig.png" alt="Instagram" width={40} height={40} className="w-10 h-10 rounded-lg" />
                  </a>
                  <a href="https://cara.app/art0nym" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                    <Image src="/images/socials/cara.png" alt="Cara" width={40} height={40} className="w-10 h-10 rounded-lg" />
                  </a>
                </div>
              </div>
              <div className="text-xs text-center md:text-left" style={{color: '#514A51'}}>
                Characters & relevant concepts in fanwork pieces belong to their respective owners.
              </div>
            </div>
          </div>
        </footer>
        {/* Social links and copyright section should be placed elsewhere if needed */}
        </div>
      </div>
    </div>
  );
}

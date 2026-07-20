'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Helper to format image name to title
function formatImageTitle(filename: string) {
  // Remove extension
  const name = filename.replace(/\.[^/.]+$/, "");
  // Split by capital letters and numbers
  const parts = name.match(/([A-Z][a-z]+|[0-9]+)/g);
  if (!parts) return name;
  // Assume last part is year if it's all digits
  const year = parts[parts.length - 1].match(/^\d{4}$/) ? parts.pop() : undefined;
  return parts.join(' ') + (year ? ` ${year}` : '');
}

export default function PastConventionTablesSection({ onModalChange }: { onModalChange?: (isOpen: boolean) => void }) {
  // List of images in conventionTables folder
  const images = useMemo(() => [
    '/images/conventionTables/AnimeLasVegas2025.jpeg',
    '/images/conventionTables/AnimeMatsuri2025.jpeg',
    '/images/conventionTables/AnimeTown2025.jpeg',
    '/images/conventionTables/FanX2025.jpeg',
    '/images/conventionTables/GemStateComicCon2025.jpeg',
    '/images/conventionTables/HachiCon2025.jpg',
    '/images/conventionTables/MagicValleyComicCon2025.jpeg',
    '/images/conventionTables/NostalgiaCon2025.jpeg',
    '/images/conventionTables/OneAnime2025.jpg',
    '/images/conventionTables/TwinCities2025.jpg',
  ], []);

  // Track modal state and selected image
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Parallax effect for yumia background
  const yumiaRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const preloadedRef = useRef(new Set<number>());

  const preloadImage = (index: number) => {
    if (preloadedRef.current.has(index)) return;
    const imageSrc = images[index];
    if (!imageSrc) return;
    const img = new window.Image();
    img.src = imageSrc;
    preloadedRef.current.add(index);
    if (typeof img.decode === 'function') {
      img.decode().catch(() => undefined);
    }
  };

  useEffect(() => {
    let ticking = false;
    let latestScroll = 0;

    const updateParallax = () => {
      ticking = false;
      if (yumiaRef.current) {
        yumiaRef.current.style.transform = `translateX(-50%) translate3d(0, ${latestScroll * 0.15}px, 0)`;
      }
    };

    const handleScroll = () => {
      latestScroll = window.pageYOffset;
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Preload all images on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          images.forEach((_, index) => preloadImage(index));
        });
      } else {
        setTimeout(() => {
          images.forEach((_, index) => preloadImage(index));
        }, 2000);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [images]);

  const openModal = (imageSrc: string, index: number) => {
    preloadImage(index);
    setSelectedImage(imageSrc);
    setCurrentImageIndex(index);
    setShowModal(true);
    onModalChange?.(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
    onModalChange?.(false);
  };
    // Lock body scroll when modal is open
    useEffect(() => {
      if (!showModal) return;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [showModal]);
  const goToPrevious = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    preloadImage(newIndex);
    setCurrentImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };
  const goToNext = () => {
    const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    preloadImage(newIndex);
    setCurrentImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  // Preload adjacent images when modal is open
  useEffect(() => {
    if (!showModal) return;
    const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    const nextIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    preloadImage(currentImageIndex);
    preloadImage(prevIndex);
    preloadImage(nextIndex);
  }, [showModal, currentImageIndex, images.length]);

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* Yumia parallax background layer */}
      <div
        ref={yumiaRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -400,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          zIndex: 0,
          willChange: 'transform',
          pointerEvents: 'none',
        }}
      >
        <Image
          src="/images/galleryImages/yumia.JPG"
          alt=""
          fill
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>
      {/* Gradient overlay with reduced opacity */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          zIndex: 1,
          background: '#FFFFFF',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
      <section className="px-8" style={{ position: 'relative', zIndex: 2, paddingTop: '96px', paddingBottom: '96px', minHeight: '600px' }}>
      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#514A51', textTransform: 'uppercase' }}>Past Convention Tables</h2>
      <div className="relative max-w-6xl mx-auto">
        {/* Left Arrow */}
        <button
          onClick={() => {
            const container = document.getElementById('convention-scroll');
            if (container) {
              const scrollAmount = 300;
              if (container.scrollLeft <= 0) {
                container.scrollLeft = container.scrollWidth - container.clientWidth;
              } else {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
              }
            }
          }}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
        >
          ‹
        </button>
        <div
          id="convention-scroll"
          className="overflow-x-auto pb-4 whitespace-nowrap"
          style={{scrollSnapType: 'x mandatory'}}
        >
          {images.map((imageSrc, index) => (
            <div
              key={index}
              className="inline-block cursor-pointer mr-2"
              style={{scrollSnapAlign: 'start'}}
              onClick={() => openModal(imageSrc, index)}
            >
              <div style={{ position: 'relative', height: '450px', width: 'auto' }}>
                <Image
                  src={imageSrc}
                  alt={formatImageTitle(imageSrc.split('/').pop() || '')}
                  fill
                  sizes="(min-width:1024px) 50vw, 90vw"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          ))}
        </div>
        {/* Right Arrow */}
        <button
          onClick={() => {
            const container = document.getElementById('convention-scroll');
            if (container) {
              const scrollAmount = 300;
              if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                container.scrollLeft = 0;
              } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
              }
            }
          }}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
        >
          ›
        </button>
      </div>
      {/* Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black" onClick={closeModal}>
          {/* Blurred background image */}
          <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <Image
              src={selectedImage}
              alt="Blurred background"
              fill
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center', filter: 'blur(15px) brightness(0.4)', transform: 'scale(1.5)' }}
            />
          </div>
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0" style={{zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)'}}></div>
          {/* Content */}
          <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
            {/* Title */}
            <div className="mb-4 text-white text-2xl font-bold text-center bg-black bg-opacity-50 px-4 py-2 rounded">
              {formatImageTitle(selectedImage.split('/').pop() || '')}
            </div>
            <div className="relative" style={{ width: 'auto', height: '80vh' }}>
              <Image
                src={selectedImage}
                alt={formatImageTitle(selectedImage.split('/').pop() || '')}
                fill
                sizes="100vw"
                style={{ objectFit: 'contain', boxShadow: '0 0 40px rgba(0,0,0,0.7)' }}
                priority
                loading="eager"
                fetchPriority="high"
              />
            </div>
            {/* Left Arrow */}
            <button onClick={e => {e.stopPropagation(); goToPrevious();}} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75">‹</button>
            {/* Right Arrow */}
            <button onClick={e => {e.stopPropagation(); goToNext();}} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75">›</button>
            {/* Close Button */}
            <button onClick={closeModal} className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75">×</button>
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">{currentImageIndex + 1} / {images.length}</div>
          </div>
        </div>
      )}
      </section>
    </div>
  );
}

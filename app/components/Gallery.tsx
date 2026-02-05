'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback, useRef } from 'react';

interface GalleryImage {
  src: string;
  previewSrc?: string;
  alt: string;
  width: number;
  height: number;
  isLandscape?: boolean;
}

interface GalleryProps {
  images: GalleryImage[];
  onModalChange?: (isOpen: boolean) => void;
}

export default function Gallery({ images, onModalChange }: GalleryProps) {
  const [loadedImages, setLoadedImages] = useState<boolean[]>(new Array(images.length).fill(false));
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [inView, setInView] = useState<boolean[]>(new Array(images.length).fill(false));
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const preloadedRef = useRef(new Set<number>());

  // Aggressive preload function that uses fetch with higher priority
  const preloadImage = useCallback((index: number) => {
    if (preloadedRef.current.has(index) || !images[index]) return;
    const image = images[index];
    preloadedRef.current.add(index);
    
    // Use fetch to preload the image data
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        fetch(image.src).catch(() => {
          // Fallback to Image element if fetch fails
          const img = new window.Image();
          img.src = image.src;
        });
      });
    } else {
      fetch(image.src).catch(() => {
        const img = new window.Image();
        img.src = image.src;
      });
    }
  }, [images]);

  // Preload images in background after page load
  useEffect(() => {
    // Wait for page to be idle, then preload all images aggressively
    const timer = setTimeout(() => {
      images.forEach((_, index) => {
        // Preload all images immediately, not just when idle
        preloadImage(index);
      });
    }, 100); // Reduced delay for faster preloading
    return () => clearTimeout(timer);
  }, [images, preloadImage]);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setShowModal(true);
    onModalChange?.(true);
    
    // Aggressively preload current image and surrounding images
    setTimeout(() => {
      const prevIdx = index > 0 ? index - 1 : images.length - 1;
      const nextIdx = index < images.length - 1 ? index + 1 : 0;
      const next2Idx = nextIdx < images.length - 1 ? nextIdx + 1 : (nextIdx === images.length - 1 ? 0 : 1);
      const prev2Idx = prevIdx > 0 ? prevIdx - 1 : images.length - 1;
      
      // Preload current and 4 surrounding images
      preloadImage(index);
      preloadImage(prevIdx);
      preloadImage(nextIdx);
      preloadImage(next2Idx);
      preloadImage(prev2Idx);
    }, 0);
  };

  const closeLightbox = useCallback(() => {
    setShowModal(false);
    setSelectedImage(null);
    onModalChange?.(false);
  }, [onModalChange]);

  const goToPrevious = useCallback(() => {
    if (selectedImage === null) return;
    const newIndex = selectedImage > 0 ? selectedImage - 1 : images.length - 1;
    setSelectedImage(newIndex);
    // Preload adjacent images immediately for instant transitions
    setTimeout(() => {
      const prevIdx = newIndex > 0 ? newIndex - 1 : images.length - 1;
      const nextIdx = newIndex < images.length - 1 ? newIndex + 1 : 0;
      const next2Idx = nextIdx < images.length - 1 ? nextIdx + 1 : (nextIdx === images.length - 1 ? 0 : 1);
      preloadImage(newIndex);
      preloadImage(prevIdx);
      preloadImage(nextIdx);
      preloadImage(next2Idx);
    }, 0);
  }, [selectedImage, images.length, preloadImage]);

  const goToNext = useCallback(() => {
    if (selectedImage === null) return;
    const newIndex = selectedImage < images.length - 1 ? selectedImage + 1 : 0;
    setSelectedImage(newIndex);
    // Preload adjacent images immediately for instant transitions
    setTimeout(() => {
      const prevIdx = newIndex > 0 ? newIndex - 1 : images.length - 1;
      const nextIdx = newIndex < images.length - 1 ? newIndex + 1 : 0;
      const next2Idx = nextIdx < images.length - 1 ? nextIdx + 1 : (nextIdx === images.length - 1 ? 0 : 1);
      preloadImage(newIndex);
      preloadImage(prevIdx);
      preloadImage(nextIdx);
      preloadImage(next2Idx);
    }, 0);
  }, [selectedImage, images.length, preloadImage]);

  useEffect(() => {
    if (!showModal || selectedImage === null) return;
    
    // Preload a wider range of images for smooth navigation
    const preloadRange = (centerIndex: number, radius: number) => {
      for (let i = -radius; i <= radius; i++) {
        let idx = centerIndex + i;
        if (idx < 0) idx += images.length;
        if (idx >= images.length) idx -= images.length;
        preloadImage(idx);
      }
    };
    
    // Preload current image and 3 images in each direction
    preloadRange(selectedImage, 3);
  }, [showModal, selectedImage, images.length, preloadImage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showModal) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Escape':
          event.preventDefault();
          closeLightbox();
          break;
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal, goToPrevious, goToNext, closeLightbox]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Reveal items on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (entry.isIntersecting) {
            setInView(prev => {
              const next = [...prev];
              next[index] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [images.length]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!showModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showModal]);

  // No perspective row alternation / depth mapping

  return (
    <>
      {/* Pixelate filter removed */}
      <div className="masonry-gallery">
        {images.map((image, index) => (
          <div
            key={index}
            ref={(el) => { itemRefs.current[index] = el; }}
            data-index={index}
            className={`masonry-item ${loadedImages[index] ? 'loaded' : ''} ${inView[index] ? 'in-view' : ''} ${image.isLandscape ? 'landscape' : 'portrait'}`}
            onClick={() => openLightbox(index)}
          >
            <figure>
              <div className="image__container">
                <Image
                  src={image.previewSrc || image.src}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  onLoad={() => handleImageLoad(index)}
                  className="gallery-image"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
              </div>
              <figcaption>{image.alt}</figcaption>
            </figure>
          </div>
        ))}
      </div>

      {/* Modal - same as CarouselSection */}
      {showModal && selectedImage !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Blurred background image */}
          <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <Image
              src={images[selectedImage].src}
              alt="Blurred background"
              fill
              sizes="100vw"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                filter: 'blur(15px) brightness(0.4)',
                transform: 'scale(1.5)'
              }}
            />
          </div>
          
          {/* Semi-transparent overlay */}
          <div 
            className="absolute inset-0"
            style={{ zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={closeLightbox}
          ></div>
          
          {/* Content */}
          <div className="relative w-full h-full flex items-center justify-center z-10">
            <Image
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              width={images[selectedImage].width}
              height={images[selectedImage].height}
              className={`w-full h-full object-contain`}
              style={{
                filter: 'blur(0px)',
                transition: 'none'
              }}
              priority
              loading="eager"
              fetchPriority="high"
              
            />
            
            {/* Left Arrow */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75"
            >
              ‹
            </button>
            
            {/* Right Arrow */}
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75"
            >
              ›
            </button>
            
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75"
            >
              ×
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .masonry-gallery {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 40px 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Ensure tiles have height at all breakpoints */
        .masonry-item.portrait {
          aspect-ratio: 2 / 3;
        }

        .masonry-item.landscape {
          aspect-ratio: 3 / 2;
        }

        @media (min-width: 640px) {
          .masonry-gallery {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .masonry-gallery {
            /* Use 6 columns: 3 cols for tall images (2 cols each), 3 cols for wide pairs (3 cols each) */
            grid-template-columns: repeat(6, 1fr);
            /* Let height be determined by aspect ratio */
            grid-auto-rows: auto;
            grid-auto-flow: dense;
          }

          /* Portrait/tall images span 2 columns (equivalent to 1 of 3 original columns) */
          .masonry-item.portrait {
            grid-column: span 2;
          }

          /* Landscape/wide images span 3 columns (1/2 of a row when paired) */
          .masonry-item.landscape {
            grid-column: span 3;
          }
        }

        .masonry-item {
          cursor: pointer;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          overflow: hidden;
          position: relative;
          will-change: transform;
        }

        .masonry-item.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        .masonry-item:hover {
          z-index: 10;
        }

        figure {
          background: #fff;
          transition: all 140ms ease;
          padding: 0.5rem;
          height: 100%;
          position: relative;
        }

        .image__container {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: repeat(16, 1fr);
          overflow: hidden;
        }

        /* Removed pixelate overlay pseudo-elements */

        /* Variant animations removed */

        .gallery-image {
          display: block;
          grid-column: -1 / 1;
          grid-row: -1 / 1;
        }

        .masonry-item::before {
          content: "";
          position: absolute;
          inset: 0;
          background: #212121;
          transition: transform 140ms ease, opacity 140ms ease, filter 140ms ease;
        }

        .masonry-item::after {
          content: "";
          position: absolute;
          inset: 0;
          transition: opacity 140ms ease;
          opacity: 0;
        }

        .masonry-item figcaption {
          position: absolute;
          bottom: 1em;
          backdrop-filter: blur(10px);
          color: #fff;
          clip-path: polygon(0 100%, 0 100%, 100% 100%, 100% 100%);
          padding: 0.5em;
          font-size: clamp(12px, 2.2vw, 16px);
          translate: 0.5em;
          transform: translateY(1em);
          transition: transform 240ms ease, clip-path 240ms ease, box-shadow 240ms ease;
          z-index: 2;
          pointer-events: none;
        }

        /* Hover effects */
        .masonry-item:hover::before {
          transform: translate(-6%, 0%);
          opacity: 0.3;
          filter: blur(3px);
        }
        .masonry-item.frame-variant-b:hover::before {
          transform: translate(6%, 0%);
        }
        /* Pixelate hover overlays removed */
        .masonry-item.in-view figure {
          transform: translateY(0);
        }
        .masonry-item:hover figure {
          transform: translateY(0) scale(1.05);
        }
        .masonry-item:hover figcaption {
          transform: translateY(0);
          box-shadow: inset 0 0 0 1px #000;
          clip-path: polygon(0 0, 0 100%, 100% 100%, 100% 0);
        }

        /* Keyframes removed */

        /* Depth classes removed */
      `}</style>
    </>
  );
}

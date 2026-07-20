'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback, useRef } from 'react';

interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  isLandscape?: boolean;
}

interface ConventionTableGalleryProps {
  images: GalleryImage[];
  onModalChange?: (isOpen: boolean) => void;
}

export default function ConventionTableGallery({ images, onModalChange }: ConventionTableGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<boolean[]>(new Array(images.length).fill(false));
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [inView, setInView] = useState<boolean[]>(new Array(images.length).fill(false));
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const preloadedRef = useRef(new Set<number>());

  // Preload images in background after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          images.forEach((image, index) => {
            if (!preloadedRef.current.has(index)) {
              const img = new window.Image();
              img.src = image.src;
              preloadedRef.current.add(index);
            }
          });
        });
      } else {
        setTimeout(() => {
          images.forEach((image, index) => {
            if (!preloadedRef.current.has(index)) {
              const img = new window.Image();
              img.src = image.src;
              preloadedRef.current.add(index);
            }
          });
        }, 2000);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [images]);

  // Format image filename into a readable title
  const formatTitle = (filename: string) => {
    // Remove file extension and path
    const nameWithoutExt = filename.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
    // Add space before capital letters (except the first one) and numbers
    const formatted = nameWithoutExt.replace(/([A-Z])/g, ' $1').replace(/([0-9]+)/g, ' $1').trim();
    return formatted;
  };

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
    setImageLoaded(true);
    setIsInitialLoad(false);
    onModalChange?.(true);
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
  }, [selectedImage, images.length]);

  const goToNext = useCallback(() => {
    if (selectedImage === null) return;
    const newIndex = selectedImage < images.length - 1 ? selectedImage + 1 : 0;
    setSelectedImage(newIndex);
  }, [selectedImage, images.length]);

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

  // Staggered reveal on scroll - one by one animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (entry.isIntersecting) {
            // Add a slight delay based on index for staggered effect
            setTimeout(() => {
              setInView(prev => {
                const next = [...prev];
                next[index] = true;
                return next;
              });
            }, index * 100); // 100ms delay between each image
          }
        });
      },
      { threshold: 0.2 }
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

  return (
    <>
      <div className="convention-puzzle-grid">
        {images.map((image, index) => (
          <div
            key={index}
            ref={(el) => { itemRefs.current[index] = el; }}
            data-index={index}
            className={`puzzle-item hover-zoom ${loadedImages[index] ? 'loaded' : ''} ${inView[index] ? 'in-view' : ''}`}
            onClick={() => openLightbox(index)}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
              onLoad={() => handleImageLoad(index)}
              className="puzzle-image"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        ))}
      </div>

      {/* Modal - same as Gallery */}
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
          <div className="relative w-full h-full flex flex-col items-center justify-center z-10 p-8">
            {/* Title */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                {formatTitle(images[selectedImage].src)}
              </h2>
            </div>
            
            {/* Image Container - constrained height */}
            <div className="flex items-center justify-center w-full" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <Image
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                width={images[selectedImage].width}
                height={images[selectedImage].height}
                className={`object-contain`}
                style={{
                  maxWidth: '90%',
                  maxHeight: '100%',
                  filter: 'blur(0px)',
                  transition: 'none'
                }}
                priority
                onLoad={() => setImageLoaded(true)}
              />
            </div>
            
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
        .convention-puzzle-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (min-width: 640px) {
          .convention-puzzle-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .convention-puzzle-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .puzzle-item {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          cursor: pointer;
          opacity: 0;
          transform: translateY(40px) scale(0.9);
          transition: opacity 0.8s ease, transform 0.8s ease;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }

        .puzzle-item.in-view {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .puzzle-item:hover {
          z-index: 10;
        }

        .puzzle-image {
          display: block;
        }
      `}</style>
    </>
  );
}

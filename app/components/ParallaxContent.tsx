'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const HERO_ASSET_VERSION = '20260424';

export default function ParallaxContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const foregroundRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [foregroundLoaded, setForegroundLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Morphing arrow animation
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const path = svg.querySelector('#path') as SVGPathElement;
    if (!path) return;

    const pathLength = path.getTotalLength();
    const startingPoint = path.getPointAtLength(0);
    const PATH_SEGMENTS = 600;

    const pathPoints: Array<{ type: string; x: number; y: number }> = [
      { type: 'M', x: startingPoint.x, y: startingPoint.y }
    ];

    for (
      let i = pathLength / PATH_SEGMENTS;
      i <= pathLength;
      i += pathLength / PATH_SEGMENTS
    ) {
      const p = path.getPointAtLength(i);
      pathPoints.push({ type: 'L', x: p.x, y: p.y });
    }

    let pathElementCache: SVGPathElement | null = null;

    function updatePathElement(
      pointsArray: Array<{ type: string; x: number; y: number }>,
      percentageComplete: number
    ) {
      const pointsToInclude = Math.ceil(pointsArray.length * percentageComplete);
      let pathString = '';

      for (let i = 0; i < pointsToInclude; i++) {
        pathString += `${pointsArray[i].type}${pointsArray[i].x} ${pointsArray[i].y}`;
      }

      if (!pathElementCache) {
        pathElementCache = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        pathElementCache.setAttribute('id', 'temporarySVGArrowPath');
        pathElementCache.setAttribute('stroke', '#FFFFFF');
        pathElementCache.setAttribute('fill', 'none');
        pathElementCache.setAttribute('stroke-width', '3');
        pathElementCache.setAttribute('stroke-linecap', 'round');
        pathElementCache.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(pathElementCache);
      }

      pathElementCache.setAttribute('d', pathString);
    }

    function easeOut(x: number) {
      return x < 0.95 ? Math.sin(((x * 1) / 0.95) * (Math.PI / 2)) : 1.0;
    }

    const duration = 4000;
    let start: number | undefined;
    let previousTimeStamp: number | undefined;
    let isReverse = false;

    function step(timestamp: number) {
      if (start === undefined) {
        start = timestamp;
      }
      const elapsed = timestamp - start;

      if (previousTimeStamp !== timestamp) {
        const rawPercentage = Math.min((1 / duration) * elapsed, 1.0);
        const percentage = isReverse ? 1 - easeOut(rawPercentage) : easeOut(rawPercentage);

        updatePathElement(pathPoints, percentage);
      }

      previousTimeStamp = timestamp;

      if (elapsed < duration) {
        window.requestAnimationFrame(step);
      } else {
        // Toggle direction and restart animation
        isReverse = !isReverse;
        start = undefined;
        previousTimeStamp = undefined;
        window.requestAnimationFrame(step);
      }
    }

    const animationId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    let ticking = false;
    let latestScroll = 0;
    let lastProcessedScroll = -1;

    const updateOnScroll = () => {
      ticking = false;
      const scrolled = latestScroll;
      
      // Skip updates if scroll position hasn't changed significantly
      if (Math.abs(scrolled - lastProcessedScroll) < 1) {
        return;
      }
      lastProcessedScroll = scrolled;

      // Background scrolls slower (parallax effect) - scroll up
      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translate3d(0, ${scrolled * -0.03}px, 0)`;
      }

      // Foreground scrolls faster - scroll up
      if (foregroundRef.current) {
        foregroundRef.current.style.transform = `translate3d(0, ${scrolled * -0.15}px, 0)`;
      }

      // Fade out hero based on scroll: start at 60% height, finish at 95%
      if (containerRef.current) {
        const heroHeight = window.innerHeight * 1.05 - 100;
        const fadeStart = heroHeight * 0.4;
        const fadeEnd = heroHeight * 0.95;
        const progress = Math.min(1, Math.max(0, (scrolled - fadeStart) / (fadeEnd - fadeStart)));
        const opacity = 1 - progress;
        containerRef.current.style.opacity = opacity.toString();
      }

      // Fade out arrow based on scroll (start at 25% of viewport height)
      if (arrowRef.current) {
        const fadeStart = window.innerHeight * 0.25;
        const opacity = Math.max(0, 1 - scrolled / fadeStart);
        arrowRef.current.style.opacity = opacity.toString();
      }
    };

    const handleScroll = () => {
      latestScroll = window.pageYOffset;
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(updateOnScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: 'calc(105vh - 100px)' }}
    >
      {/* Background layer - scrolls slower */}
      <div
        ref={backgroundRef}
        className="fixed left-0 right-0 w-full"
        style={{
          top: 0,
          height: '120vh',
          willChange: 'transform',
          zIndex: 0
        }}
      >
        <Image
          src={`/images/hero/hero-background.PNG?v=${HERO_ASSET_VERSION}`}
          alt="Hero background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
          style={{
            filter: backgroundLoaded ? 'blur(0px)' : 'blur(10px)',
            transition: 'filter 0.3s ease-out',
            transform: isMobile ? 'scale(1.1) translateY(-60px)' : 'scale(1.1) translateY(-80px)',
            transformOrigin: 'top center'
          }}
          onLoad={() => setBackgroundLoaded(true)}
        />
      </div>

      {/* Foreground layer - scrolls faster */}
      <div
        ref={foregroundRef}
        className="fixed left-0 right-0 w-full"
        style={{
          top: 0,
          height: '120vh',
          willChange: 'transform',
          zIndex: 2
        }}
      >
        <Image
          src={`/images/hero/character.PNG?v=${HERO_ASSET_VERSION}`}
          alt="Hero foreground"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
          style={{
            filter: foregroundLoaded ? 'blur(0px)' : 'blur(10px)',
            transition: 'filter 0.3s ease-out',
            transform: isMobile ? 'scale(1.15) translateY(calc(30px + 10%)) translateX(12px)' : 'scale(1.15) translateY(calc(-30px + 10%)) translateX(20px)',
            transformOrigin: 'center center'
          }}
          onLoad={() => setForegroundLoaded(true)}
        />
      </div>

      {/* Downward arrow indicator (center-bottom) */}
      <div
        ref={arrowRef}
        className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center"
        style={{
          transition: 'opacity 0.3s ease-out'
        }}
      >
        <div className="hero-arrow-wrapper">
          <svg
            ref={svgRef}
            className="hero-arrow"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            width="48"
            height="48"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="7 13 12 18 17 13"></polyline>
            <polyline points="7 6 12 11 17 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
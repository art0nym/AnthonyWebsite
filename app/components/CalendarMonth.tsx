'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface Event {
  name: string;
  dates: string;
  url?: string;
}

interface CalendarMonthProps {
  month: string;
  events: Event[];
  imageSrc: string;
}

export default function CalendarMonth({ month, events, imageSrc }: CalendarMonthProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
      position: 'relative',
      width: '360px',
      height: '360px',
      transform: isVisible ? 'translateX(0)' : 'translateX(-100px)',
      opacity: isVisible ? 1 : 0,
      transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease-out'
    }}>
      {/* Background Image Container */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#514A51',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        {imageSrc && (
          <Image 
            src={imageSrc}
            alt={month}
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'top',
              filter: 'url(#duotone)'
            }}
            priority
          />
        )}
      </div>

      {/* Calendar Content - Full size, shifted to top right ~50% */}
      <div style={{
        position: 'absolute',
        top: 34,
        left: 34,
        width: '100%',
        height: '100%',
        border: '10px solid #fff',
        fontFamily: "'Josefin Sans', sans-serif",
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        boxSizing: 'border-box',
        zIndex: 1,
        boxShadow: '0 7px 6px 0 rgba(0, 0, 0, 0.1), 0 10px 19px 0 rgba(0, 0, 0, 0.11)'
      }}>
        {/* Calendar Table */}
        <table style={{
          position: 'absolute',
          top: '15px',
          left: '20px',
          width: 'calc(100% - 40px)',
          borderCollapse: 'collapse',
          color: '#fff',
          fontSize: '16px',
          textAlign: 'center'
        }}>
          <thead>
            <tr>
              {month.toUpperCase().split('').map((char, idx) => (
                <th key={idx} style={{textAlign: 'center', fontSize: '16px', paddingBottom: '8px', fontWeight: 'bold', width: '14.28%', letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'}}>
                  {char}
                </th>
              ))}
              {new Array(Math.max(0, 7 - month.length)).fill(null).map((_, idx) => (
                <th key={`empty-${idx}`} style={{textAlign: 'center', fontSize: '16px', paddingBottom: '8px', fontWeight: 'bold', width: '14.28%', letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'}}>
                  &nbsp;
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((event, idx) => (
                <tr key={idx}>
                  <td colSpan={7} style={{
                    textAlign: 'center',
                    fontSize: '16px',
                    cursor: event.url ? 'pointer' : 'default',
                    transition: 'opacity 0.3s ease',
                    opacity: 1,
                    color: '#fff',
                    padding: '8px',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                  }}>
                    <div style={{textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'}}>
                      {event.url ? (
                        <a href={event.url} target="_blank" rel="noopener noreferrer" style={{
                          color: 'inherit',
                          textDecoration: 'none',
                          transition: 'opacity 0.3s ease, text-shadow 0.3s ease',
                          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
                        }}>
                          {event.name}
                        </a>
                      ) : (
                        event.name
                      )}
                    </div>
                    <div style={{fontSize: '12px', marginTop: '4px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'}}>{event.dates}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{
                  textAlign: 'center',
                  fontSize: '16px',
                  cursor: 'default',
                  transition: 'opacity 0.3s ease',
                  opacity: 0.5,
                  color: '#fff',
                  padding: '20px',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                }}>
                  No events scheduled
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

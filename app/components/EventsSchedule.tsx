'use client';

import CalendarMonth from './CalendarMonth';
import type { ScheduleMonth, SiteImage } from '@/lib/site-content';

interface EventsScheduleProps {
  galleryImages: SiteImage[];
  schedule: ScheduleMonth[];
}

export default function EventsSchedule({ galleryImages, schedule }: EventsScheduleProps) {
  return (
    <div style={{position: 'relative', width: '100%'}}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: '100%',
        zIndex: 0,
        padding: '32px 0',
        background: '#FFFFFF',
        pointerEvents: 'none'
      }} />
      <svg style={{visibility:'hidden', width:0, height:0}} width="0" height="0">
        <filter id="duotone" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.03 0.1 0.01 0 0.318 0.092 0.309 0.031 0 0.29 0.14 0.471 0.048 0 0.318 0 0 0 1 0" />
        </filter>
      </svg>
      <section id="events" style={{
        position: 'relative',
        zIndex: 1,
        padding: '2rem',
        paddingBottom: 'calc(2rem + 50px)',
        scrollMarginTop: '120px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '3rem',
          color: '#7576F9',
          textTransform: 'uppercase'
        }}>
          Convention Schedule
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '40px',
          justifyItems: 'center',
          padding: '0 5%'
        }}>
          {schedule.map((monthData) => {
            // Find gallery image matching month number
            const fallbackImageSrc = galleryImages.find(img => {
              const filename = img.src.split('/').pop() || '';
              const num = parseInt(filename);
              return num === monthData.monthNumber;
            })?.src || galleryImages[0]?.src || '';
            const imageSrc = monthData.imageSrc || fallbackImageSrc;

            return (
              <CalendarMonth
                key={monthData.month}
                month={monthData.month}
                events={monthData.events}
                imageSrc={imageSrc}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

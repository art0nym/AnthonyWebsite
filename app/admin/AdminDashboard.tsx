'use client';

import Image from 'next/image';
import { useMemo, useState, useTransition } from 'react';
import type { ScheduleMonth, SiteImage } from '@/lib/site-content';

interface AdminDashboardProps {
  initialSchedule: ScheduleMonth[];
  initialGalleryImages: SiteImage[];
  initialConventionImages: SiteImage[];
}

function sortImages(images: SiteImage[]) {
  return [...images].sort((left, right) => {
    const leftName = left.src.split('/').pop() ?? '';
    const rightName = right.src.split('/').pop() ?? '';
    const leftPrefix = parseInt(leftName.match(/^\d+/)?.[0] ?? '0', 10);
    const rightPrefix = parseInt(rightName.match(/^\d+/)?.[0] ?? '0', 10);
    return leftPrefix - rightPrefix;
  });
}

function externalAdminPath(pathname: string) {
  if (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')) {
    return pathname.replace(/^\/admin/, '') || '/';
  }

  return pathname;
}

export default function AdminDashboard({
  initialSchedule,
  initialGalleryImages,
  initialConventionImages,
}: AdminDashboardProps) {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [galleryImages, setGalleryImages] = useState(sortImages(initialGalleryImages));
  const [conventionImages, setConventionImages] = useState(initialConventionImages);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, startSaving] = useTransition();
  const [uploadingTarget, setUploadingTarget] = useState<'gallery' | 'convention' | null>(null);

  const galleryOptions = useMemo(
    () => galleryImages.map(image => ({ value: image.src, label: image.alt || image.src.split('/').pop() || image.src })),
    [galleryImages]
  );

  function updateMonth(monthIndex: number, updater: (month: ScheduleMonth) => ScheduleMonth) {
    setSchedule(current => current.map((month, index) => (index === monthIndex ? updater(month) : month)));
  }

  async function saveSchedule() {
    setMessage('');
    setError('');

    startSaving(async () => {
      const response = await fetch('/api/admin/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error ?? 'Unable to save the schedule.');
        return;
      }

      setMessage('Schedule saved. The public site now reads from this data file.');
    });
  }

  async function uploadImage(target: 'gallery' | 'convention', file: File) {
    setUploadingTarget(target);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('target', target);
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error ?? 'Upload failed.');
        return;
      }

      if (target === 'gallery') {
        setGalleryImages(current => sortImages([...current, payload.image as SiteImage]));
      } else {
        setConventionImages(current => [...current, payload.image as SiteImage]);
      }

      setMessage(`${target === 'gallery' ? 'Gallery' : 'Convention'} image uploaded successfully.`);
    } catch {
      setError('Upload failed.');
    } finally {
      setUploadingTarget(null);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.assign(externalAdminPath('/admin/login'));
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f6efe5', color: '#514A51' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 48px' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ margin: 0, color: '#7576F9', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Admin workspace
            </p>
            <h1 style={{ margin: '8px 0 10px', fontSize: '2.5rem' }}>Manage gallery uploads and the event schedule</h1>
            <p style={{ margin: 0, maxWidth: '720px', lineHeight: 1.6 }}>
              Upload new artwork or convention images, then edit the monthly schedule that the public site renders.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={saveSchedule}
              disabled={isSaving}
              style={{
                border: 0,
                borderRadius: '999px',
                padding: '12px 18px',
                background: '#7576F9',
                color: '#fff',
                fontWeight: 700,
                cursor: isSaving ? 'wait' : 'pointer',
              }}
            >
              {isSaving ? 'Saving...' : 'Save schedule'}
            </button>
            <button
              type="button"
              onClick={logout}
              style={{
                borderRadius: '999px',
                padding: '12px 18px',
                border: '1px solid rgba(81, 74, 81, 0.2)',
                background: '#fff',
                color: '#514A51',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Log out
            </button>
          </div>
        </header>

        {message ? (
          <div style={{ marginBottom: '16px', borderRadius: '16px', padding: '14px 16px', background: '#dff7e5', color: '#175c2c' }}>
            {message}
          </div>
        ) : null}
        {error ? (
          <div style={{ marginBottom: '16px', borderRadius: '16px', padding: '14px 16px', background: '#fde7e7', color: '#912018' }}>
            {error}
          </div>
        ) : null}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(81, 74, 81, 0.08)' }}>
            <h2 style={{ marginTop: 0 }}>Upload gallery art</h2>
            <p style={{ lineHeight: 1.6 }}>Uploads go into the main illustration gallery and get the next numeric prefix automatically.</p>
            <input
              type="file"
              accept="image/*"
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadImage('gallery', file);
                  event.currentTarget.value = '';
                }
              }}
            />
            <p style={{ marginBottom: 0, marginTop: '12px', color: '#7576F9', fontWeight: 700 }}>{galleryImages.length} gallery images</p>
            {uploadingTarget === 'gallery' ? <p style={{ marginBottom: 0 }}>Uploading...</p> : null}
          </div>

          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(81, 74, 81, 0.08)' }}>
            <h2 style={{ marginTop: 0 }}>Upload convention images</h2>
            <p style={{ lineHeight: 1.6 }}>Uploads go into the convention table section and appear on the public site after refresh.</p>
            <input
              type="file"
              accept="image/*"
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadImage('convention', file);
                  event.currentTarget.value = '';
                }
              }}
            />
            <p style={{ marginBottom: 0, marginTop: '12px', color: '#7576F9', fontWeight: 700 }}>{conventionImages.length} convention images</p>
            {uploadingTarget === 'convention' ? <p style={{ marginBottom: 0 }}>Uploading...</p> : null}
          </div>
        </section>

        <section style={{ display: 'grid', gap: '20px' }}>
          {schedule.map((month, monthIndex) => (
            <article key={month.month} style={{ background: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(81, 74, 81, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{month.month}</h2>
                  <p style={{ margin: '6px 0 0', color: '#6b6570' }}>Month #{month.monthNumber}</p>
                </div>
                <label style={{ display: 'grid', gap: '8px', minWidth: '280px', fontWeight: 600 }}>
                  Background image
                  <select
                    value={month.imageSrc ?? ''}
                    onChange={event => updateMonth(monthIndex, current => ({ ...current, imageSrc: event.target.value || null }))}
                    style={{ borderRadius: '12px', border: '1px solid rgba(81, 74, 81, 0.2)', padding: '12px 14px' }}
                  >
                    <option value="">Automatic fallback</option>
                    {galleryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {month.events.map((event, eventIndex) => (
                  <div
                    key={`${month.month}-${eventIndex}`}
                    style={{
                      display: 'grid',
                      gap: '12px',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      alignItems: 'end',
                      padding: '16px',
                      borderRadius: '18px',
                      background: '#f8f5ff',
                    }}
                  >
                    <label style={{ display: 'grid', gap: '8px', fontWeight: 600 }}>
                      Event name
                      <input
                        value={event.name}
                        onChange={typedEvent => updateMonth(monthIndex, current => ({
                          ...current,
                          events: current.events.map((existingEvent, existingIndex) => (
                            existingIndex === eventIndex ? { ...existingEvent, name: typedEvent.target.value } : existingEvent
                          )),
                        }))}
                        style={{ borderRadius: '12px', border: '1px solid rgba(81, 74, 81, 0.2)', padding: '12px 14px' }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '8px', fontWeight: 600 }}>
                      Dates
                      <input
                        value={event.dates}
                        onChange={typedEvent => updateMonth(monthIndex, current => ({
                          ...current,
                          events: current.events.map((existingEvent, existingIndex) => (
                            existingIndex === eventIndex ? { ...existingEvent, dates: typedEvent.target.value } : existingEvent
                          )),
                        }))}
                        style={{ borderRadius: '12px', border: '1px solid rgba(81, 74, 81, 0.2)', padding: '12px 14px' }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '8px', fontWeight: 600 }}>
                      URL
                      <input
                        value={event.url ?? ''}
                        onChange={typedEvent => updateMonth(monthIndex, current => ({
                          ...current,
                          events: current.events.map((existingEvent, existingIndex) => (
                            existingIndex === eventIndex
                              ? { ...existingEvent, url: typedEvent.target.value || undefined }
                              : existingEvent
                          )),
                        }))}
                        placeholder="https://example.com"
                        style={{ borderRadius: '12px', border: '1px solid rgba(81, 74, 81, 0.2)', padding: '12px 14px' }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => updateMonth(monthIndex, current => ({
                        ...current,
                        events: current.events.filter((_, existingIndex) => existingIndex !== eventIndex),
                      }))}
                      style={{
                        borderRadius: '12px',
                        padding: '12px 14px',
                        border: '1px solid rgba(145, 32, 24, 0.2)',
                        background: '#fff',
                        color: '#912018',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Remove event
                    </button>
                  </div>
                ))}

                {month.events.length === 0 ? <p style={{ margin: 0, color: '#6b6570' }}>No events in this month yet.</p> : null}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => updateMonth(monthIndex, current => ({
                      ...current,
                      events: [...current.events, { name: '', dates: '', url: '' }],
                    }))}
                    style={{
                      borderRadius: '999px',
                      padding: '12px 18px',
                      border: '1px solid rgba(117, 118, 249, 0.3)',
                      background: '#fff',
                      color: '#7576F9',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Add event
                  </button>

                  {month.imageSrc ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden' }}>
                        <Image src={month.imageSrc} alt={`${month.month} background`} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <span style={{ color: '#6b6570' }}>Selected background</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
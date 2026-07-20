'use client';

import { FormEvent, useState } from 'react';

function getPostLoginPath(next: string | null) {
  if (next) {
    return next;
  }

  if (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')) {
    return '/';
  }

  return '/admin';
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error ?? 'Login failed.');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      window.location.assign(getPostLoginPath(params.get('next')));
    } catch {
      setError('Unable to reach the login endpoint.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #d9f1f0 0%, #f9e5d0 100%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.88)',
          boxShadow: '0 24px 80px rgba(81, 74, 81, 0.18)',
          border: '1px solid rgba(117, 118, 249, 0.14)',
        }}
      >
        <p style={{ margin: 0, color: '#7576F9', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Admin
        </p>
        <h1 style={{ marginTop: '12px', marginBottom: '8px', fontSize: '2rem', color: '#514A51' }}>
          Sign in to manage the site
        </h1>
        <p style={{ marginTop: 0, marginBottom: '24px', color: '#514A51', lineHeight: 1.5 }}>
          This is the temporary admin account for uploading images and editing the convention schedule.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <label style={{ display: 'grid', gap: '8px', color: '#514A51', fontWeight: 600 }}>
            Username
            <input
              value={username}
              onChange={event => setUsername(event.target.value)}
              autoComplete="username"
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(81, 74, 81, 0.2)',
                padding: '12px 14px',
                fontSize: '1rem',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '8px', color: '#514A51', fontWeight: 600 }}>
            Password
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(81, 74, 81, 0.2)',
                padding: '12px 14px',
                fontSize: '1rem',
              }}
            />
          </label>

          {error ? <p style={{ margin: 0, color: '#b42318' }}>{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              border: 0,
              borderRadius: '999px',
              padding: '14px 18px',
              background: '#7576F9',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: submitting ? 'wait' : 'pointer',
            }}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
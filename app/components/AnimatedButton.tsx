'use client';

interface AnimatedButtonProps {
  href: string;
  text: string;
}

export default function AnimatedButton({ href, text }: AnimatedButtonProps) {
  return (
    <a 
      href={href}
      target="_blank" 
      rel="noopener noreferrer"
      className="animated-btn"
      style={{
        minWidth: '160px',
        width: 'fit-content',
        backgroundColor: 'white',
        padding: '0 30px',
        height: '50px',
        fontFamily: 'Arial, sans-serif',
        textTransform: 'uppercase',
        fontSize: '14px',
        color: '#7576F9',
        letterSpacing: '2.8px',
        fontWeight: '700',
        lineHeight: '1.6',
        boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        transition: 'all 0.4s ease',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        border: '0',
        textDecoration: 'none',
        overflow: 'hidden',
        margin: '0 auto'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 20px -12px rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.letterSpacing = '2px';
        e.currentTarget.style.color = 'white';
        const before = e.currentTarget.querySelector('.btn-before') as HTMLElement;
        const after = e.currentTarget.querySelector('.btn-after') as HTMLElement;
        if (before) before.style.width = '51%';
        if (after) after.style.width = '51%';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 15px 40px -10px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.letterSpacing = '2.8px';
        e.currentTarget.style.color = '#7576F9';
        const before = e.currentTarget.querySelector('.btn-before') as HTMLElement;
        const after = e.currentTarget.querySelector('.btn-after') as HTMLElement;
        if (before) before.style.width = '4px';
        if (after) after.style.width = '4px';
      }}
    >
      <span 
        className="btn-before"
        style={{
          content: '""',
          position: 'absolute',
          width: '4px',
          height: '100%',
          top: 0,
          left: 0,
          transition: 'all 0.4s ease',
          backgroundColor: '#7576F9',
          zIndex: 0
        }}
      />
      <span 
        className="btn-after"
        style={{
          content: '""',
          position: 'absolute',
          width: '4px',
          height: '100%',
          top: 0,
          right: 0,
          transition: 'all 0.4s ease',
          backgroundColor: '#7576F9',
          zIndex: 0
        }}
      />
      <span style={{ zIndex: 1, textAlign: 'center' }}>{text}</span>
    </a>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export default function SiteLoader() {
  const [shouldShow, setShouldShow] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [dots, setDots] = useState("");
  const pathRef = useRef<SVGPathElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  // Check on mount (client-side only) to avoid hydration mismatch
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited") === "true";
    if (!hasVisited) {
      // Defer setState to avoid synchronous state update in effect
      setTimeout(() => setShouldShow(true), 0);
    }
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    // Animate dots
    let dotCount = 0;
    const dotsInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setDots(".".repeat(dotCount));
    }, 400);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const path = pathRef.current;
    const textEl = textRef.current;

    let rafId: number | null = null;

    try {
      if (path) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;
        path.getBoundingClientRect();
        path.style.transition = "stroke-dashoffset 4s linear";
        path.style.strokeDashoffset = "0";
      }

      const start = performance.now();
      const duration = 4000;
      const tick = (now: number) => {
        const elapsed = Math.min(now - start, duration);
        const progress = elapsed / duration;
        const value = Math.round(progress * 100);
        if (textEl) {
          textEl.textContent = String(value);
        }
        if (elapsed < duration) {
          rafId = requestAnimationFrame(tick);
        } else if (textEl) {
          textEl.textContent = "100";
        }
      };
      rafId = requestAnimationFrame(tick);

      const fadeTimer = setTimeout(() => {
        setOpacity(0);
      }, 4500);

      const hideTimer = setTimeout(() => {
        setShouldShow(false);
        localStorage.setItem("hasVisited", "true");
        document.body.style.overflow = previousOverflow;
      }, 5000);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        clearInterval(dotsInterval);
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
        document.body.style.overflow = previousOverflow;
      };
    } catch {
      document.body.style.overflow = previousOverflow;
      clearInterval(dotsInterval);
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        opacity: opacity,
        transition: "opacity 0.5s ease-out",
      }}
      role="status"
      aria-label="Loading"
    >
      <div
        style={{
          position: "relative",
          width: "300px",
          height: "300px",
        }}
      >
        <svg
          width="300"
          height="300"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 204 204"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <path
            ref={pathRef}
            d="m2,102c0,82.11,17.89,100,100,100,82.11,0,100-17.89,100-100,0-82.11-17.89-100-100-100C19.89,2,2,19.89,2,102Z"
            style={{
              fill: "none",
              stroke: "#7576F9",
              strokeMiterlimit: 10,
              strokeWidth: "4px",
            }}
          />
        </svg>
        <p
          ref={textRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            margin: 0,
            fontSize: "4rem",
            lineHeight: 1,
            color: "#7576F9",
          }}
        >
          0
        </p>
        <p
          style={{
            position: "absolute",
            left: "50%",
            top: "calc(50% + 180px)",
            transform: "translateX(-50%)",
            margin: 0,
            fontSize: "2rem",
            fontWeight: "700",
            color: "#7576F9",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-geist-sans), sans-serif",
          }}
        >
          serving you some cool art{dots}
        </p>
      </div>
    </div>
  );
}

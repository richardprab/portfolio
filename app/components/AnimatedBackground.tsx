"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";

export const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Mouse tracking with spring animation for smooth following
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 35, stiffness: 275 }; // Responsive spring

  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Balanced movement - noticeable but not overwhelming
    mouseX.set((mousePosition.x - 50) * 1.0);
    mouseY.set((mousePosition.y - 50) * 1.0);
  }, [mousePosition, mouseX, mouseY]);

  // Base animation values (will be animated)
  const blob1BaseX = useMotionValue(0);
  const blob1BaseY = useMotionValue(0);
  const blob1Rotate = useMotionValue(0);
  const blob2BaseX = useMotionValue(75);
  const blob2BaseY = useMotionValue(65);
  const blob2Rotate = useMotionValue(0);

  // Combine base animation with mouse offset - balanced intensity
  const blob1X = useTransform(
    [blob1BaseX, smoothMouseX],
    ([baseX, mouseX]: number[]) => `calc(${baseX}vw + ${mouseX * 2.0}px)`
  );
  const blob1Y = useTransform(
    [blob1BaseY, smoothMouseY],
    ([baseY, mouseY]: number[]) => `calc(${baseY}vh + ${mouseY * 2.0}px)`
  );
  const blob2X = useTransform(
    [blob2BaseX, smoothMouseX],
    ([baseX, mouseX]: number[]) => `calc(${baseX}vw + ${mouseX * -1.6}px)`
  );
  const blob2Y = useTransform(
    [blob2BaseY, smoothMouseY],
    ([baseY, mouseY]: number[]) => `calc(${baseY}vh + ${mouseY * -1.6}px)`
  );

  // Animate base positions
  useEffect(() => {
    if (prefersReducedMotion) return;

    // Animate blob 1
    const controls1X = animate(blob1BaseX, [0, 20, 5, 0], {
      duration: 18,
      repeat: Infinity,
      ease: "linear",
    });
    const controls1Y = animate(blob1BaseY, [0, 15, 30, 0], {
      duration: 18,
      repeat: Infinity,
      ease: "linear",
    });
    const controls1Rotate = animate(blob1Rotate, [0, 120, 240, 360], {
      duration: 18,
      repeat: Infinity,
      ease: "linear",
    });

    // Animate blob 2
    const controls2X = animate(blob2BaseX, [75, 60, 90, 75], {
      duration: 20,
      repeat: Infinity,
      ease: "linear",
    });
    const controls2Y = animate(blob2BaseY, [65, 80, 50, 65], {
      duration: 20,
      repeat: Infinity,
      ease: "linear",
    });
    const controls2Rotate = animate(blob2Rotate, [0, 120, 240, 360], {
      duration: 20,
      repeat: Infinity,
      ease: "linear",
    });

    return () => {
      controls1X.stop();
      controls1Y.stop();
      controls1Rotate.stop();
      controls2X.stop();
      controls2Y.stop();
      controls2Rotate.stop();
    };
  }, [prefersReducedMotion, blob1BaseX, blob1BaseY, blob1Rotate, blob2BaseX, blob2BaseY, blob2Rotate]);

  return (
    <div 
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none" 
      aria-hidden="true"
      style={{ 
        zIndex: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
        <motion.div
          className="absolute rounded-full"
          style={{
          width: '650px',
          height: '650px',
          left: 0,
          top: 0,
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.18) 50%, transparent 80%)',
          filter: 'blur(60px)',
          willChange: 'transform',
          x: blob1X,
          y: blob1Y,
          rotate: blob1Rotate,
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '700px',
          height: '700px',
          left: 0,
          top: 0,
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.18) 50%, transparent 80%)',
          filter: 'blur(60px)',
          willChange: 'transform',
          x: blob2X,
          y: blob2Y,
          rotate: blob2Rotate,
          }}
        />
    </div>
  );
};

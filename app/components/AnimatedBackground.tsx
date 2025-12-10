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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 50, stiffness: 150 };

  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    mouseX.set((mousePosition.x - 50) * 0.6);
    mouseY.set((mousePosition.y - 50) * 0.6);
  }, [mousePosition, mouseX, mouseY]);

  const blob1BaseX = useMotionValue(0);
  const blob1BaseY = useMotionValue(0);
  const blob1Rotate = useMotionValue(0);
  const blob2BaseX = useMotionValue(75);
  const blob2BaseY = useMotionValue(65);
  const blob2Rotate = useMotionValue(0);
  const blob3BaseX = useMotionValue(50);
  const blob3BaseY = useMotionValue(20);
  const blob3Rotate = useMotionValue(0);
  const blob1X = useTransform(
    [blob1BaseX, smoothMouseX],
    ([baseX, mouseX]: number[]) => `calc(${baseX}vw + ${mouseX * 1.2}px)`
  );
  const blob1Y = useTransform(
    [blob1BaseY, smoothMouseY],
    ([baseY, mouseY]: number[]) => `calc(${baseY}vh + ${mouseY * 1.2}px)`
  );
  const blob2X = useTransform(
    [blob2BaseX, smoothMouseX],
    ([baseX, mouseX]: number[]) => `calc(${baseX}vw + ${mouseX * -1.0}px)`
  );
  const blob2Y = useTransform(
    [blob2BaseY, smoothMouseY],
    ([baseY, mouseY]: number[]) => `calc(${baseY}vh + ${mouseY * -1.0}px)`
  );
  const blob3X = useTransform(
    [blob3BaseX, smoothMouseX],
    ([baseX, mouseX]: number[]) => `calc(${baseX}vw + ${mouseX * 0.8}px)`
  );
  const blob3Y = useTransform(
    [blob3BaseY, smoothMouseY],
    ([baseY, mouseY]: number[]) => `calc(${baseY}vh + ${mouseY * 1.0}px)`
  );


  useEffect(() => {
    if (prefersReducedMotion) return;

    const controls1X = animate(blob1BaseX, [0, 20, 5, 0], {
      duration: 25,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    });
    const controls1Y = animate(blob1BaseY, [0, 15, 30, 0], {
      duration: 25,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    });
    const controls1Rotate = animate(blob1Rotate, [0, 120, 240, 360], {
      duration: 28,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    });

    const controls2X = animate(blob2BaseX, [75, 60, 90, 75], {
      duration: 27,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    });
    const controls2Y = animate(blob2BaseY, [65, 80, 50, 65], {
      duration: 27,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    });
    const controls2Rotate = animate(blob2Rotate, [0, 120, 240, 360], {
      duration: 30,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    });

    const controls3X = animate(blob3BaseX, [50, 40, 60, 50], {
      duration: 23,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    });
    const controls3Y = animate(blob3BaseY, [20, 35, 10, 20], {
      duration: 23,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    });
    const controls3Rotate = animate(blob3Rotate, [0, 120, 240, 360], {
      duration: 26,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    });

    return () => {
      controls1X.stop();
      controls1Y.stop();
      controls1Rotate.stop();
      controls2X.stop();
      controls2Y.stop();
      controls2Rotate.stop();
      controls3X.stop();
      controls3Y.stop();
      controls3Rotate.stop();
    };
  }, [prefersReducedMotion, blob1BaseX, blob1BaseY, blob1Rotate, blob2BaseX, blob2BaseY, blob2Rotate, blob3BaseX, blob3BaseY, blob3Rotate]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none w-screen h-screen" 
      aria-hidden="true"
    >
        <motion.div
          className="absolute"
          style={{
            width: '760px',
            height: '760px',
            left: 0,
            top: 0,
            background: 'radial-gradient(circle at 75% 30%, rgba(255, 255, 255, 0.3) 5px, rgba(84, 171, 251, 0.8) 8%, rgba(27, 108, 251, 0.6) 60%, rgba(84, 171, 251, 0.8) 100%)',
            borderRadius: '51% 49% 48% 52% / 62% 44% 56% 38%',
            opacity: 0.20,
            filter: 'blur(12px)',
            willChange: 'transform',
            x: blob1X,
            y: blob1Y,
            rotate: blob1Rotate,
          }}
        />
        <motion.div
          className="absolute"
          style={{
            width: '152px',
            height: '152px',
            left: 0,
            top: 0,
            background: '#E6FDFB',
            borderRadius: '44% 56% 46% 54% / 36% 50% 50% 64%',
            boxShadow: '12px 30px 0 -8px rgba(255, 255, 255, 0.15)',
            opacity: 0.25,
            filter: 'blur(4px)',
            willChange: 'transform',
            x: blob1X,
            y: blob1Y,
            rotate: blob1Rotate,
          }}
          transformTemplate={({ x, y, rotate }) => 
            `translate(${x}, ${y}) translate(494px, 152px) rotate(${rotate})`
          }
        />
        
        <motion.div
          className="absolute"
          style={{
            width: '600px',
            height: '600px',
            left: 0,
            top: 0,
            background: 'radial-gradient(circle at 75% 30%, rgba(255, 255, 255, 0.3) 5px, rgba(196, 113, 237, 0.8) 8%, rgba(138, 43, 226, 0.6) 60%, rgba(196, 113, 237, 0.8) 100%)',
            borderRadius: '46% 50% 39% 54% / 56% 57% 50% 50%',
            opacity: 0.20,
            filter: 'blur(12px)',
            willChange: 'transform',
            x: blob2X,
            y: blob2Y,
            rotate: blob2Rotate,
          }}
        />

        <motion.div
          className="absolute"
          style={{
            width: '120px',
            height: '120px',
            left: 0,
            top: 0,
            background: '#f0d5ff',
            borderRadius: '44% 56% 46% 54% / 36% 50% 50% 64%',
            boxShadow: '12px 30px 0 -8px rgba(255, 255, 255, 0.15)',
            opacity: 0.25,
            filter: 'blur(4px)',
            willChange: 'transform',
            x: blob2X,
            y: blob2Y,
            rotate: blob2Rotate,
          }}
          transformTemplate={({ x, y, rotate }) => 
            `translate(${x}, ${y}) translate(390px, 120px) rotate(${rotate})`
          }
        />

        <motion.div
          className="absolute"
          style={{
            width: '660px',
            height: '660px',
            left: 0,
            top: 0,
            background: 'radial-gradient(circle at 75% 30%, rgba(255, 255, 255, 0.3) 5px, rgba(18, 194, 233, 0.8) 8%, rgba(0, 139, 139, 0.6) 60%, rgba(18, 194, 233, 0.8) 100%)',
            borderRadius: '48% 52% 50% 50% / 58% 46% 54% 42%',
            opacity: 0.20,
            filter: 'blur(12px)',
            willChange: 'transform',
            x: blob3X,
            y: blob3Y,
            rotate: blob3Rotate,
          }}
        />
        <motion.div
          className="absolute"
          style={{
            width: '132px',
            height: '132px',
            left: 0,
            top: 0,
            background: '#d0f0ff',
            borderRadius: '44% 56% 46% 54% / 36% 50% 50% 64%',
            boxShadow: '12px 30px 0 -8px rgba(255, 255, 255, 0.15)',
            opacity: 0.25,
            filter: 'blur(4px)',
            willChange: 'transform',
            x: blob3X,
            y: blob3Y,
            rotate: blob3Rotate,
          }}
          transformTemplate={({ x, y, rotate }) => 
            `translate(${x}, ${y}) translate(429px, 132px) rotate(${rotate})`
          }
        />
    </div>
  );
};

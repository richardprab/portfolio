"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedBackground = () => {
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

  // Blob configurations
  const blobs = [
    {
      id: 1,
      size: 650,
      color: "rgba(0, 0, 0, 0.18)",
      initialX: "0vw",
      initialY: "0vh",
      animateX: ["0vw", "15vw", "5vw", "0vw"],
      animateY: ["0vh", "10vh", "25vh", "0vh"],
      duration: 25,
    },
    {
      id: 2,
      size: 700,
      color: "rgba(0, 0, 0, 0.18)",
      initialX: "85vw",
      initialY: "75vh",
      animateX: ["85vw", "75vw", "90vw", "85vw"],
      animateY: ["75vh", "85vh", "70vh", "75vh"],
      duration: 32,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none" 
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
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full"
          style={{
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            left: 0,
            top: 0,
            background: `radial-gradient(circle, ${blob.color} 0%, ${blob.color} 50%, transparent 80%)`,
            filter: "blur(60px)",
            willChange: "transform",
          }}
          initial={{
            x: blob.initialX,
            y: blob.initialY,
          }}
          animate={{
            x: blob.animateX,
            y: blob.animateY,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : blob.duration,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

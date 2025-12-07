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

  // Blob configurations - Subtle and elegant
  const blobs = [
    {
      id: 1,
      size: 600,
      color: "rgba(0, 0, 0, 0.15)",
      initialX: "-20vw",
      initialY: "10vh",
      animateX: ["-20vw", "10vw", "-20vw"],
      animateY: ["10vh", "30vh", "10vh"],
      duration: 25,
    },
    {
      id: 2,
      size: 500,
      color: "rgba(0, 0, 0, 0.18)",
      initialX: "120vw",
      initialY: "5vh",
      animateX: ["120vw", "100vw", "120vw"],
      animateY: ["5vh", "25vh", "5vh"],
      duration: 30,
    },
    {
      id: 3,
      size: 700,
      color: "rgba(0, 0, 0, 0.15)",
      initialX: "40vw",
      initialY: "110vh",
      animateX: ["40vw", "60vw", "40vw"],
      animateY: ["110vh", "90vh", "110vh"],
      duration: 35,
    },
    {
      id: 4,
      size: 550,
      color: "rgba(0, 0, 0, 0.18)",
      initialX: "10vw",
      initialY: "120vh",
      animateX: ["10vw", "30vw", "10vw"],
      animateY: ["120vh", "100vh", "120vh"],
      duration: 28,
    },
    {
      id: 5,
      size: 650,
      color: "rgba(0, 0, 0, 0.15)",
      initialX: "130vw",
      initialY: "80vh",
      animateX: ["130vw", "110vw", "130vw"],
      animateY: ["80vh", "100vh", "80vh"],
      duration: 32,
    },
    {
      id: 6,
      size: 580,
      color: "rgba(0, 0, 0, 0.18)",
      initialX: "50vw",
      initialY: "-10vh",
      animateX: ["50vw", "70vw", "50vw"],
      animateY: ["-10vh", "10vh", "-10vh"],
      duration: 27,
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
            left: "50%",
            top: "50%",
            marginLeft: `-${blob.size / 2}px`,
            marginTop: `-${blob.size / 2}px`,
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

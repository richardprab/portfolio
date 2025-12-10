"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SCROLL_CONFIG } from "../config/animations";

export const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(
    heroScrollProgress, 
    [0, SCROLL_CONFIG.HERO_FADE_THRESHOLD], 
    [1, 0]
  );
  const heroY = useTransform(
    heroScrollProgress, 
    [0, SCROLL_CONFIG.HERO_FADE_THRESHOLD], 
    [0, SCROLL_CONFIG.HERO_Y_OFFSET]
  );
  const heroScale = useTransform(
    heroScrollProgress, 
    [0, SCROLL_CONFIG.HERO_FADE_THRESHOLD], 
    [1, SCROLL_CONFIG.HERO_SCALE]
  );

  return (
    <motion.main 
      id="technical-skills"
      ref={heroRef}
      style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
      className="pt-4 pb-8 sm:pb-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-7xl mx-auto min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] relative">
        <div className="flex flex-col justify-center lg:justify-end order-2 lg:order-1 pb-8 lg:pb-0 relative z-0">
          <motion.div
            className="relative z-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl xl:text-[11rem] font-thin text-black leading-none mb-2 sm:mb-4">
              Richard
            </h1>
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl xl:text-[11rem] font-thin text-black leading-none"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Prabowo
            </motion.h1>
          </motion.div>
        </div>

        <div className="flex flex-col items-end lg:items-end relative order-1 lg:order-2 pt-8 lg:pt-0 z-20">
          <motion.div
            className="mb-4 sm:mb-6 relative w-[66.67%] max-w-lg lg:max-w-xl xl:max-w-2xl h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 rounded-lg overflow-hidden absolute right-4 sm:right-8 top-0 lg:absolute lg:right-0 lg:top-0 lg:-ml-8 xl:-ml-12 z-30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Image
              src="/profile-image.JPG"
              alt="Richard Prabowo - Software Engineer"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 1024px) 66vw, (max-width: 1280px) 33vw, 22vw"
              onError={(e) => {
                e.currentTarget.src = '';
              }}
            />
          </motion.div>
          <motion.p
            className="text-black text-base sm:text-lg max-w-md text-right lg:absolute lg:bottom-0 leading-relaxed mt-4 lg:mt-0 mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Hi! I&apos;m someone who loves to<br />
            code and create intuitive<br />
            Digital Experiences.
          </motion.p>
        </div>
      </div>
    </motion.main>
  );
};


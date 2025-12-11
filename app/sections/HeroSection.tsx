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
      id="home"
      ref={heroRef}
      style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
      className="pt-6 sm:pt-12 pb-16 sm:pb-20 lg:pt-4 lg:pb-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-10 lg:gap-16 max-w-7xl mx-auto min-h-[75vh] sm:min-h-[80vh] lg:min-h-[80vh] relative">
        {/* Mobile: Centered Layout, Desktop: Left Aligned */}
        <div className="flex flex-col justify-center items-center lg:items-start lg:justify-end order-2 lg:order-1 pb-0 lg:pb-0 relative z-0">
          <motion.div
            className="relative z-0 text-center lg:text-left w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl xl:text-[11rem] font-thin text-black leading-[0.9] mb-3 sm:mb-4 lg:mb-2 lg:mb-4">
              Richard
            </h1>
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl xl:text-[11rem] font-thin text-black leading-[0.9]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Prabowo
            </motion.h1>
          </motion.div>

          {/* Mobile Description - Below Name */}
          <motion.p
            className="text-black text-lg sm:text-xl md:text-2xl max-w-lg text-center lg:hidden leading-relaxed mt-8 sm:mt-10 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Hi! I love creating things that matter and finding the 'why' behind them. I’m endlessly curious and always looking to learn something new.
          </motion.p>
        </div>

        {/* Mobile: Image Below Text, Desktop: Original Absolute Positioning */}
        <div className="flex flex-col items-center lg:items-end relative order-1 lg:order-2 pt-0 lg:pt-0 z-20">
          {/* Mobile Image - Modern Circular/Square with Shadow */}
          <motion.div
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 aspect-square rounded-3xl overflow-hidden shadow-2xl lg:hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <Image
              src="/profile_image.JPG"
              alt="Richard Prabowo - Software Engineer"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
              priority
              unoptimized={process.env.NODE_ENV === 'development'}
              onError={(e) => {
                e.currentTarget.src = '';
              }}
            />
          </motion.div>

          {/* Desktop Image - Original Absolute Positioning */}
          <motion.div
            className="hidden lg:block mb-4 sm:mb-6 relative w-[66.67%] max-w-lg lg:max-w-xl xl:max-w-2xl h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 rounded-lg overflow-hidden absolute right-4 sm:right-8 top-0 lg:absolute lg:right-0 lg:top-0 lg:-ml-8 xl:-ml-12 z-30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Image
              src="/profile_image.JPG"
              alt="Richard Prabowo - Software Engineer"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 1024px) 66vw, (max-width: 1280px) 33vw, 22vw"
              unoptimized={process.env.NODE_ENV === 'development'}
              onError={(e) => {
                e.currentTarget.src = '';
              }}
            />
          </motion.div>

          {/* Desktop Description Text */}
          <motion.p
            className="hidden lg:block text-black text-base sm:text-lg max-w-md text-right lg:absolute lg:bottom-0 leading-relaxed mt-4 lg:mt-0 mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Hi! I love creating things that matter<br className="hidden lg:block"/>
            and finding the 'why' behind them.<br className="hidden lg:block"/>
            I’m endlessly curious and<br className="hidden lg:block"/> 
            always looking to learn<br className="hidden lg:block"/>
            something new.
          </motion.p>
        </div>
      </div>
    </motion.main>
  );
};


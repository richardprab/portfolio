"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { Experience } from "../types";

interface ExperienceItemProps {
  experience: Experience;
  index: number;
}

export const ExperienceItem = ({ experience, index }: ExperienceItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Slide in from bottom when entering - no exit animation
  const y = useTransform(
    scrollYProgress,
    [0, 0.3, 1],
    [200, 0, 0]
  );
  
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 1],
    [0, 1, 1]
  );

  return (
    <motion.div
      ref={ref}
      className="border-t border-gray-200 first:border-t-0"
      style={{ y, opacity }}
    >
    <div className="py-8 sm:py-10 lg:py-12">
      <div className={`flex flex-col ${experience.image && !imageError ? 'lg:flex-row lg:items-start' : ''} gap-6 sm:gap-8`}>
        {/* Left side - Image (if available and not errored) */}
        {experience.image && !imageError && (
          <div className="lg:w-56 xl:w-64 flex-shrink-0">
            <div className="relative aspect-video lg:aspect-square rounded-lg overflow-hidden bg-gray-200">
              <Image
                src={experience.image}
                alt={experience.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 256px"
                onError={() => {
                  setImageError(true);
                }}
              />
            </div>
          </div>
        )}
        
        {/* Right side - Content */}
        <div className="flex-1">
          {/* Title and Date on same line */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-black">
              {experience.title}
            </h3>
            <p className="text-lg sm:text-xl font-bold text-black">
              {experience.dates}
            </p>
          </div>
          
          {/* Description */}
          <div>
            {experience.description.map((content, idx) => (
              <p key={idx} className="text-gray-600 text-sm sm:text-base leading-relaxed mb-2">
                {content}
              </p>
            ))}
          </div>
          
          {/* Technologies */}
          {experience.technologies && experience.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {experience.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs sm:text-sm text-gray-700 shadow-sm bg-white border border-gray-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
  );
};


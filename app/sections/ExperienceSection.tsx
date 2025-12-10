"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import { useExperiences } from "../hooks/useExperiences";
import { Experience } from "../types";

export const ExperienceSection = () => {
  const { data: experiences = [], isLoading, error } = useExperiences();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of the entire section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax offsets for each card (progressive speeds - each card moves slightly faster)
  // Balanced increments prevent overlap while maintaining parallax effect
  const parallaxOffsets = [40, 55, 70, 85, 100, 115];
  
  // Create all transforms at the top level (not inside map/loop)
  // This ensures hooks are called in consistent order and follows React's rules of hooks
  const transform0 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[0]]);
  const transform1 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[1]]);
  const transform2 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[2]]);
  const transform3 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[3]]);
  const transform4 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[4]]);
  const transform5 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[5]]);
  
  // Array of transforms for easy indexing
  const transforms = [transform0, transform1, transform2, transform3, transform4, transform5];

  return (
    <section id="experience" className="py-12 sm:py-16 relative z-0 overflow-visible" ref={sectionRef}>
      <div className="max-w-7xl mx-auto overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start overflow-visible">
          {/* Left Side - Bigger Header (Sticky) */}
          <div className="flex flex-col lg:sticky lg:top-24 lg:self-start overflow-visible">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block p-[1px] rounded-full mb-8 bg-[linear-gradient(to_right,black_0%,black_10%,rgba(0,0,0,0.3)_40%,rgba(0,0,0,0.1)_60%,#e5e5e5_80%)]">
                <div className="px-4 py-2 rounded-full bg-white">
                  <span className="text-black text-sm font-medium">Experience</span>
                </div>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-black leading-tight mb-6">
                A Yearly snapshot<br />
                of my technical<br />
                progression
              </h2>
              <p className="text-gray-600 text-lg sm:text-xl leading-relaxed max-w-lg">
                An annual summary that tracks my technical journey and professional development throughout the year.
              </p>
            </motion.div>

            {/* Mobile: Show experiences below header */}
            {!isLoading && !error && (
              <div className="lg:hidden mt-12 space-y-6">
                {experiences.map((experience, index) => (
                  <ExperienceParallaxCard
                    key={`${experience.title}-${index}`}
                    experience={experience}
                    index={index}
                    yTransform={undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Parallax Experience Cards */}
          <div className="hidden lg:block pt-20 overflow-visible">
            {isLoading && (
              <div className="py-12">
                <p className="text-gray-600">Loading experiences...</p>
              </div>
            )}
            
            {error && (
              <div className="py-12">
                <p className="text-red-600">
                  {error instanceof Error ? error.message : "Failed to load experiences"}
                </p>
              </div>
            )}

            {!isLoading && !error && (
              <div className="flex flex-col justify-start relative pb-14">
                {experiences.map((experience, index) => (
                  <div key={`${experience.title}-${index}`} className={index > 0 ? "mt-10" : ""}>
                    <ExperienceParallaxCard
                      experience={experience}
                      index={index}
                      yTransform={transforms[index] || transforms[0]}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

interface ExperienceParallaxCardProps {
  experience: Experience;
  index: number;
  yTransform?: MotionValue<number>;
}

const ExperienceParallaxCard = ({ experience, index, yTransform }: ExperienceParallaxCardProps) => {
  return (
    <motion.div
      style={yTransform ? { y: yTransform } : undefined}
      className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm w-full"
    >
      <div className="space-y-4">
        {/* Title and Date */}
        <div>
          <h3 className="text-xl font-bold text-black mb-1">
            {experience.title}
          </h3>
          <p className="text-base font-semibold text-gray-700">
            {experience.dates}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          {experience.description.map((content, idx) => (
            <p key={idx} className="text-gray-600 text-sm leading-relaxed">
              {content}
            </p>
          ))}
        </div>

        {/* Technologies */}
        {experience.technologies && experience.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {experience.technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs text-gray-700 bg-gray-50 border border-gray-200"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};


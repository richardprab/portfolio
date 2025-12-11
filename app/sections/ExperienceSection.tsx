"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import { useExperiences } from "../hooks/useExperiences";
import { Experience } from "../types";
import { GlassCard } from "../components/GlassCard";

export const ExperienceSection = () => {
  const { data: experiences = [], isLoading, error } = useExperiences();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const parallaxOffsets = [40, 55, 70, 85, 100, 115];
  
  const transform0 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[0]]);
  const transform1 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[1]]);
  const transform2 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[2]]);
  const transform3 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[3]]);
  const transform4 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[4]]);
  const transform5 = useTransform(scrollYProgress, [0, 1], [0, parallaxOffsets[5]]);
  
  const transforms = [transform0, transform1, transform2, transform3, transform4, transform5];

  return (
    <section id="experience" className="py-12 sm:py-16 relative z-0 overflow-visible" ref={sectionRef}>
      <div className="max-w-7xl mx-auto overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start overflow-visible">
          <div className="flex flex-col lg:sticky lg:top-24 lg:self-start overflow-visible">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="section-badge-wrapper mb-8">
                <div className="section-badge">
                  <span className="section-badge-text">Experience</span>
                </div>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary leading-tight mb-6">
                Retrospective<br />
                of my technical<br />
                progression
              </h2>
              <p className="text-secondary text-lg sm:text-xl leading-relaxed max-w-lg">
                An annual summary that tracks my technical journey and professional development throughout the year.
              </p>
            </motion.div>

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

          <div className="hidden lg:block pt-20 overflow-visible">
            {isLoading && (
              <div className="py-12">
                <p className="text-secondary">Loading experiences...</p>
              </div>
            )}
            
            {error && (
              <div className="py-12">
                <p className="text-red-600 dark:text-red-400">
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
    <GlassCard
      yTransform={yTransform}
      variant="white"
      size="md"
      className="w-full"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-primary mb-1">
            {experience.title}
          </h3>
          <p className="text-base font-semibold text-tertiary">
            {experience.dates}
          </p>
        </div>

        <div className="space-y-2">
          {experience.description.map((content, idx) => (
            <p key={idx} className="text-secondary text-sm leading-relaxed">
              {content}
            </p>
          ))}
        </div>

        {experience.technologies && experience.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {experience.technologies.map((tech, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-800 dark:text-gray-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-300/60 dark:border-gray-600/60 shadow-sm shadow-black/5 dark:shadow-white/5 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-400/60 dark:hover:border-gray-500/60 hover:shadow-md hover:shadow-black/10 dark:hover:shadow-white/10 transition-all duration-200"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};


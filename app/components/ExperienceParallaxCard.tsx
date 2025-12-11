"use client";

import { MotionValue } from "framer-motion";
import { Experience } from "../types";
import { GlassCard } from "./GlassCard";

interface ExperienceParallaxCardProps {
  experience: Experience;
  index: number;
  yTransform?: MotionValue<number>;
}

export const ExperienceParallaxCard = ({ experience, yTransform }: ExperienceParallaxCardProps) => {
  return (
    <GlassCard
      yTransform={yTransform}
      variant="white"
      size="md"
      className="w-full"
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-black mb-1">
            {experience.title}
          </h3>
          <p className="text-base font-semibold text-black dark:text-black">
            {experience.dates}
          </p>
        </div>

        <div className="space-y-2">
          {experience.description.map((content, idx) => (
            <p key={idx} className="text-black dark:text-black text-sm leading-relaxed">
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


"use client";

import { SectionHeader } from "../components/SectionHeader";
import { ExperienceItem } from "../components/ExperienceItem";
import { useExperiences } from "../hooks/useExperiences";

export const ExperienceSection = () => {
  const { data: experiences = [], isLoading, error } = useExperiences();

  return (
    <section id="experience" className="py-12 sm:py-16 relative z-0">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Experience"
          title={<>A Yearly snapshot<br />of my technical progression</>}
          description="An annual summary that tracks my technical journey and professional development throughout the year."
        />

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading experiences...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">
              {error instanceof Error ? error.message : "Failed to load experiences"}
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="space-y-0 rounded-2xl overflow-hidden">
            {experiences.map((experience, index) => (
              <ExperienceItem
                key={`${experience.title}-${index}`}
                experience={experience}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};


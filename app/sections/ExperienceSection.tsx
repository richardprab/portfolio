"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { ExperienceItem } from "../components/ExperienceItem";
import { Experience } from "../types";

export const ExperienceSection = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await fetch('/api/experience');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transform MongoDB documents to match Experience interface
          const items = data.data.map((item: {
            _id?: string;
            title: string;
            description: string[];
            dates: string;
            image?: string;
            technologies?: string[];
          }) => ({
            title: item.title,
            description: item.description,
            dates: item.dates,
            image: item.image || undefined,
            technologies: item.technologies || undefined,
          }));
          setExperiences(items);
        } else {
          setError(data.error || 'Failed to load experiences');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load experiences';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  return (
    <section id="experience" className="py-12 sm:py-16 relative z-0">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Experience"
          title={<>A Yearly snapshot<br />of my technical progression</>}
          description="An annual summary that tracks my technical journey and professional development throughout the year."
        />

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading experiences...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
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


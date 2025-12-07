"use client";

import { SectionHeader } from "../components/SectionHeader";
import { ExperienceItem } from "../components/ExperienceItem";
import { Experience } from "../types";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export const ExperienceSection = ({ experiences }: ExperienceSectionProps) => {
  return (
    <section className="py-12 sm:py-16 bg-[#fafafa] backdrop-blur-sm relative z-0">
      <div className="mx-auto">
        <SectionHeader
          tag="Experience"
          title={<>A Yearly snapshot<br />of my technical progression</>}
          description="An annual summary that tracks my technical journey and professional development throughout the year."
        />

        <div className="space-y-0 rounded-2xl overflow-hidden">
          {experiences.map((experience, index) => (
            <ExperienceItem
              key={`${experience.title}-${index}`}
              experience={experience}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


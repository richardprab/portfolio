"use client";

import { SectionHeader } from "../components/SectionHeader";
import { useAscentStore } from "../components/three/store";
import { SKILLS, SKILL_ITEM_COUNT, isSimpleIcon, type Skill, type ReactIconComponent } from "../data/skills";

const SkillChip = ({ skill }: { skill: Skill }) => {
  const Icon = skill.isReactIcon ? (skill.icon as ReactIconComponent) : null;
  return (
    <span
      className="group inline-flex items-center gap-1.5 mr-4 mb-1.5 text-sm text-primary"
      style={{ "--brand": `#${skill.color ?? "888888"}` } as React.CSSProperties}
    >
      <span
        className="w-3.5 h-3.5 flex-none text-secondary transition-colors duration-300 group-hover:[color:var(--brand)]"
        aria-hidden="true"
      >
        {Icon ? (
          <Icon className="w-3.5 h-3.5" />
        ) : isSimpleIcon(skill.icon) ? (
          <svg role="img" viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d={skill.icon.path} />
          </svg>
        ) : null}
      </span>
      {skill.name}
    </span>
  );
};

export const SkillsSection = () => {
  // Once the camera docks at the notice board, the scrolling header yields —
  // the sign carries its own title, and nothing slides over it.
  const headerYields = useAscentStore((s) => s.anchored && Math.abs(s.campT - 1) < 0.38);

  return (
    <section id="skills" className="py-20 sm:py-28 relative z-0">
      <div className="max-w-7xl mx-auto">
        <div
          className={`transition-opacity duration-500 ${
            headerYields ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <SectionHeader
            camp="Camp 01"
            designation="Basecamp"
            elevation="880 m"
            title={
              <>
                Gear manifest —<br />
                read the notice board
              </>
            }
            blurb={`${SKILL_ITEM_COUNT} items packed across languages, frameworks, data tooling and operations, painted on the basecamp notice board.`}
          />
        </div>

        {/* In the 3D experience the manifest is painted onto the notice
            board itself; this flowing copy serves small screens, no-WebGL
            visitors and screen readers. */}
        <div className="anchored-hidden">
          {/* card-scrim: on small screens the camera still docks at the 3D
              board behind this copy — the scrim keeps the two manifests from
              double-exposing. */}
          <div className="card-scrim grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
            {SKILLS.map((category, categoryIndex) => (
              <div key={category.name}>
                <div className="instrument text-secondary mb-1.5">
                  <span className="text-accent">{`0${categoryIndex + 1}`}</span>
                  {` / ${category.name}`}
                </div>
                <div className="border-t border-line pt-2">
                  {category.skills.map((skill) => (
                    <SkillChip key={skill.name} skill={skill} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

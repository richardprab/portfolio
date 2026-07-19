"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperiences } from "../hooks/useExperiences";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SectionHeader } from "../components/SectionHeader";
import { useAscentStore } from "../components/three/store";
import { activeLegIndex } from "../components/three/anchors";
import type { Experience } from "../types";

// "Business Analyst Intern @Shopee Pte Ltd" -> role + organisation.
const splitTitle = (title: string): { role: string; org: string | null } => {
  const at = title.indexOf("@");
  if (at === -1) return { role: title, org: null };
  return { role: title.slice(0, at).trim(), org: title.slice(at + 1).trim() };
};

const stripBullet = (line: string) => line.replace(/^[\s•\-–]+/, "");

const LegBody = ({ experience, legNumber }: { experience: Experience; legNumber: number }) => {
  const { role, org } = splitTitle(experience.title);
  return (
    <div>
      <div className="instrument text-secondary flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
        <span className="text-accent">{`Leg 0${legNumber}`}</span>
        <span aria-hidden="true">—</span>
        <span>{experience.dates}</span>
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-primary leading-snug">
        {role}
        {org && (
          <>
            {" "}
            <span className="text-secondary font-normal">@ {org}</span>
          </>
        )}
      </h3>

      <ul className="mt-3 space-y-2">
        {experience.description.map((line, idx) => (
          <li key={idx} className="text-secondary text-sm leading-relaxed flex gap-2.5">
            <span className="text-accent flex-none mt-[2px]" aria-hidden="true">
              +
            </span>
            <span>{stripBullet(line)}</span>
          </li>
        ))}
      </ul>

      {experience.technologies && experience.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {experience.technologies.map((tech, idx) => (
            <span key={idx} className="instrument text-secondary border border-line px-1.5 py-0.5">
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// The route-log title card: the dock's opening pane. It rides the flight
// from the notice board, so the camp is INTRODUCED before Leg 01 begins —
// an in-flow header can never sync with the camera (scrolling forward it
// has left the viewport before the camera arrives), so the intro lives in
// the dock with everything else.
const RouteIntro = ({ count }: { count: number }) => (
  <div>
    <p className="instrument text-secondary flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
      <span className="text-accent">Camp 02</span>
      <span aria-hidden="true">—</span>
      <span>Switchback Ridge · 1,450 m</span>
    </p>
    <h3 className="text-lg sm:text-xl font-semibold text-primary leading-snug">
      Route log — walk the switchbacks
    </h3>
    <p className="text-secondary text-sm leading-relaxed mt-3">
      The trail below is the timeline: every hairpin turn a job change, climbed
      in order from 2022 to now. The leg underfoot burns amber.
    </p>
    <p className="instrument text-secondary mt-3.5">{`0${count} legs · 2022 → now`}</p>
  </div>
);

// One panel for the whole camp: it never leaves the screen while the
// switchbacks are walked — only its content changes. It opens with the
// route-log intro during the flight in, then follows the glowing leg
// underfoot: intro → Leg 01 → … → Leg 04.
const LegDock = () => {
  // 1.6: late enough that the notice board has left the frame; 1.84: the
  // intro hands over to Leg 01 exactly as the walker sets off (legProgress
  // starts at 1.84 — see AscentBackground). The handoff carries HYSTERESIS
  // (legs release back to the intro only under 1.74): trackpad momentum
  // overshoots the boundary and settles back, and without the gap that
  // reads as Leg 01 flashing before the camp introduces itself.
  const [phase, setPhase] = useState<"off" | "intro" | "legs">("off");
  useEffect(() => {
    const derive = (campT: number) =>
      setPhase((prev) => {
        if (campT < 1.6 || campT >= 2.5) return "off";
        if (prev === "legs") return campT < 1.74 ? "intro" : "legs";
        return campT >= 1.84 ? "legs" : "intro";
      });
    derive(useAscentStore.getState().campT);
    return useAscentStore.subscribe((s) => derive(s.campT));
  }, []);
  const walked = useAscentStore((s) => activeLegIndex(s.legProgress));
  const { data: experiences = [] } = useExperiences();
  const count = experiences.length;
  // The trail is walked chronologically: lowest switchback = oldest job.
  const experience = experiences[count - 1 - walked];
  if (!experience) return null;
  const onLegs = phase === "legs";
  const onCamp = phase !== "off";

  return (
    <aside className="leg-dock card-scrim" data-on={onCamp ? "1" : "0"} aria-hidden={!onCamp}>
      <div className="instrument text-secondary flex items-center gap-2 mb-5" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className={onLegs && i <= walked ? "text-accent" : ""}>{`0${i + 1}`}</span>
            {i < count - 1 && (
              <span className={`h-px w-5 ${onLegs && i < walked ? "bg-accent" : "bg-line"}`} />
            )}
          </span>
        ))}
      </div>
      {/* While hidden ("off"), the mounted pane is the INTRO — if a leg
          rested here instead, entering the camp would play that stale
          leg's exit animation right as the dock fades in: Leg 01 flashing
          before the camp introduces itself. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase === "legs" ? `leg-${walked}` : "intro"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {phase === "legs" ? (
            <LegBody experience={experience} legNumber={walked + 1} />
          ) : (
            <RouteIntro count={count} />
          )}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
};

export const ExperienceSection = () => {
  const { data: experiences = [], isLoading, error } = useExperiences();

  return (
    <section id="experience" className="py-20 sm:py-28 relative z-0">
      <div className="max-w-7xl mx-auto">
        {/* In the 3D experience the dock's intro pane carries this header
            (an in-flow header can't stay in sync with the camera); it lays
            out normally on small screens, without WebGL and for readers. */}
        <div className="anchored-hidden">
          <SectionHeader
            camp="Camp 02"
            designation="Switchback Ridge"
            elevation="1,450 m"
            title={
              <>
                Route log —<br />
                walk the switchbacks
              </>
            }
            blurb="The trail below is the timeline: every hairpin turn a job change, climbed in order from 2022 to now. The leg underfoot burns amber."
          />
        </div>

        {isLoading && <LoadingSpinner />}

        {error && (
          <div className="py-12">
            <p className="instrument text-accent">
              {error instanceof Error ? error.message : "Failed to load route log"}
            </p>
          </div>
        )}

        {/* In the 3D experience the legs live on the glowing switchback
            trail with the dock panel; this flowing copy serves small
            screens, no-WebGL visitors and screen readers. */}
        {!isLoading && !error && (
          <div className="anchored-hidden">
            {/* card-scrim per leg: on small screens the glowing trail runs
                right behind this copy. */}
            <ol className="space-y-12 max-w-3xl">
              {experiences.map((experience, index) => (
                <li key={`${experience.title}-${index}`} className="card-scrim">
                  <LegBody experience={experience} legNumber={experiences.length - index} />
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <LegDock />
    </section>
  );
};

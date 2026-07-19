"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  camp: string; // e.g. "CAMP 01"
  designation: string; // e.g. "BASECAMP"
  elevation: string; // e.g. "880 M"
  title: string | ReactNode;
  blurb?: string;
}

// A survey plate: designation line, title, and a ruled base with a waypoint.
export const SectionHeader = ({ camp, designation, elevation, title, blurb }: SectionHeaderProps) => (
  <motion.div
    className="pb-10 sm:pb-14"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <div className="instrument text-secondary flex items-center gap-3 mb-5">
      <span className="text-accent">{camp}</span>
      <span aria-hidden="true">—</span>
      <span>{designation}</span>
      <span aria-hidden="true">—</span>
      <span>{elevation}</span>
      <span className="leader hidden sm:block" aria-hidden="true" />
    </div>

    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary leading-[1.05] tracking-tight max-w-3xl">
        {title}
      </h2>
      {blurb && (
        <p className="text-secondary text-sm sm:text-base leading-relaxed lg:max-w-xs lg:text-right">
          {blurb}
        </p>
      )}
    </div>

    <div className="mt-6 flex items-center gap-3" aria-hidden="true">
      <span className="waypoint-dot" />
      <span className="h-px flex-1 bg-line" />
    </div>
  </motion.div>
);

"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  tag: string;
  title: string | ReactNode;
  description: string;
}

export const SectionHeader = ({ tag, title, description }: SectionHeaderProps) => (
  <motion.div 
    className="pb-8 sm:pb-12"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
      <div className="flex-1">
        <motion.div 
          className="section-badge-wrapper mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="section-badge">
            <span className="section-badge-text">{tag}</span>
          </div>
        </motion.div>
        <motion.h2 
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary leading-tight"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {title}
        </motion.h2>
      </div>
      <motion.div 
        className="lg:w-1/3 lg:text-right"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <p className="text-secondary text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      </motion.div>
    </div>
  </motion.div>
);


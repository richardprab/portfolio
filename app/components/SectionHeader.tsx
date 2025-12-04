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
    className="px-4 sm:px-8 lg:px-16 xl:px-24 pb-8 sm:pb-12"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
      <div className="flex-1">
        <motion.div 
          className="inline-block p-[1px] rounded-full mb-6 bg-[linear-gradient(to_right,black_0%,black_10%,rgba(0,0,0,0.3)_40%,rgba(0,0,0,0.1)_60%,#e5e5e5_80%)]"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="px-4 py-2 rounded-full bg-white">
            <span className="text-black text-sm font-medium">{tag}</span>
          </div>
        </motion.div>
        <motion.h2 
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-black leading-tight"
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
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      </motion.div>
    </div>
  </motion.div>
);


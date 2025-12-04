"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface CompanyLogosProps {
  companies: string[];
}

export const CompanyLogos = ({ companies }: CompanyLogosProps) => {
  const scrollDistance = useMemo(
    () => 120 * companies.length + 24 * (companies.length - 1),
    [companies.length]
  );

  return (
    <section className="py-8 sm:py-12 overflow-hidden px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 sm:gap-6 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <motion.div
            className="flex items-center gap-4 sm:gap-6"
            animate={{
              x: [0, -scrollDistance],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...companies, ...companies].map((company, index) => (
              <div
                key={`company-${index}-${company}`}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 rounded-full text-black text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
              >
                {company}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};


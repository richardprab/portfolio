"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "../components/SectionHeader";

interface SkillCategory {
  name: string;
  skills: string[];
}

const SKILLS: SkillCategory[] = [
  {
    name: "Frontend",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML", "CSS", "JavaScript"],
  },
  {
    name: "Backend",
    skills: ["Python", "FastAPI", "Django", "Flask", "Node.js", "PostgreSQL", "MongoDB"],
  },
  {
    name: "Tools & Technologies",
    skills: ["Docker", "Git", "AWS", "Azure", "SQL", "ChromaDB", "Scikit-Learn"],
  },
];

export const SkillsSection = () => {
  return (
    <section id="skills" className="py-12 sm:py-16 relative z-0">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Skills"
          title={<>Technologies I work with<br />and continue to learn</>}
          description="A comprehensive overview of the technologies, frameworks, and tools I use to build modern applications."
        />

        <div className="space-y-12 sm:space-y-16">
          {SKILLS.map((category, categoryIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ 
                duration: 0.7, 
                delay: categoryIndex * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {/* Category Header */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">
                  {category.name}
                </h3>
                <div className="h-px w-20 bg-gradient-to-r from-black to-transparent"></div>
              </div>

              {/* Skills Grid - Larger, more prominent */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 sm:gap-5">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill}
                    className="group relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.4, 
                      delay: categoryIndex * 0.15 + skillIndex * 0.05,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-5 h-full flex items-center justify-center text-center shadow-sm group-hover:shadow-lg group-hover:border-gray-300 transition-all duration-300">
                      <span className="text-sm sm:text-base font-semibold text-black group-hover:text-gray-700 transition-colors duration-300">
                        {skill}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


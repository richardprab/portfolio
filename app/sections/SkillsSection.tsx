"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "../components/SectionHeader";
import { GlassCard } from "../components/GlassCard";
import {
  siPython,
  siR,
  siJavascript,
  siTypescript,
  siHtml5,
  siCss,
  siReact,
  siNodedotjs,
  siNextdotjs,
  siDjango,
  siFlask,
  siTailwindcss,
  siMysql,
  siMongodb,
  siPandas,
  siNumpy,
  siMetabase,
  siDocker,
  siGit,
  siJira,
  siFigma,
  siVercel,
} from "simple-icons/icons";
import {
  SiAmazonwebservices,
  SiTableau,
  SiScipy,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";

interface Skill {
  name: string;
  icon: any;
  isReactIcon?: boolean;
  color?: string;
}

interface SkillCategory {
  name: string;
  skills: Skill[];
}

const SKILLS: SkillCategory[] = [
  {
    name: "Languages",
    skills: [
      { name: "Python", icon: siPython, color: siPython.hex },
      { name: "Java", icon: FaJava, isReactIcon: true, color: "ED8B00" },
      { name: "R", icon: siR, color: siR.hex },
      { name: "JavaScript", icon: siJavascript, color: siJavascript.hex },
      { name: "TypeScript", icon: siTypescript, color: siTypescript.hex },
      { name: "HTML", icon: siHtml5, color: siHtml5.hex },
      { name: "CSS", icon: siCss, color: siCss.hex },
    ],
  },
  {
    name: "Frameworks",
    skills: [
      { name: "React", icon: siReact, color: siReact.hex },
      { name: "Node.js", icon: siNodedotjs, color: siNodedotjs.hex },
      { name: "Next.js", icon: siNextdotjs, color: siNextdotjs.hex },
      { name: "Django", icon: siDjango, color: siDjango.hex },
      { name: "Flask", icon: siFlask, color: siFlask.hex },
      { name: "Tailwind CSS", icon: siTailwindcss, color: siTailwindcss.hex },
    ],
  },
  {
    name: "Data & Databases",
    skills: [
      { name: "SQL", icon: siMysql, color: siMysql.hex },
      { name: "MongoDB", icon: siMongodb, color: siMongodb.hex },
      { name: "Pandas", icon: siPandas, color: siPandas.hex },
      { name: "NumPy", icon: siNumpy, color: siNumpy.hex },
      { name: "Matplotlib", icon: SiScipy, isReactIcon: true, color: "8CAAE6" },
      { name: "Tableau", icon: SiTableau, isReactIcon: true, color: "E97627" },
      { name: "Metabase", icon: siMetabase, color: siMetabase.hex },
    ],
  },
  {
    name: "DevOps & Tools",
    skills: [
      { name: "AWS", icon: SiAmazonwebservices, isReactIcon: true, color: "FF9900" },
      { name: "Azure", icon: VscAzure, isReactIcon: true, color: "0078D4" },
      { name: "Docker", icon: siDocker, color: siDocker.hex },
      { name: "Git", icon: siGit, color: siGit.hex },
      { name: "Jira", icon: siJira, color: siJira.hex },
      { name: "Figma", icon: siFigma, color: siFigma.hex },
      { name: "Vercel", icon: siVercel, color: siVercel.hex },
    ],
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 mt-12">
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
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-black mb-3">
                  {category.name}
                </h3>
                <div className="h-px w-20 bg-gradient-to-r from-black to-transparent"></div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                {category.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    className="group relative"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.5, 
                      delay: categoryIndex * 0.15 + skillIndex * 0.03,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -4,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                  >
                    <GlassCard
                      variant="colored"
                      accentColor={skill.color}
                      size="sm"
                      className="h-full flex flex-col items-center justify-center text-center cursor-default"
                    >
                      <motion.div 
                        className="mb-2 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12"
                        whileHover={{ 
                          scale: 1.15,
                          rotate: [0, -5, 5, -5, 0],
                          transition: { duration: 0.4 }
                        }}
                      >
                        {skill.icon ? (
                          skill.isReactIcon ? (
                            <skill.icon 
                              className="w-full h-full transition-transform duration-300" 
                              style={{ color: skill.color ? `#${skill.color}` : '#000000' }}
                            />
                          ) : 'path' in skill.icon ? (
                            <svg
                              role="img"
                              viewBox="0 0 24 24"
                              className="w-full h-full transition-transform duration-300"
                              style={{ fill: skill.color ? `#${skill.color}` : '#000000' }}
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d={skill.icon.path} />
                            </svg>
                          ) : null
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-black text-xs font-bold">{skill.name.charAt(0)}</span>
                          </div>
                        )}
                      </motion.div>
                      <motion.span 
                        className="text-black text-xs font-medium leading-tight"
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {skill.name}
                      </motion.span>
                    </GlassCard>
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


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
  siDatadog,
} from "simple-icons/icons";
import { SiAmazonwebservices, SiTableau, SiScipy } from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";

// Canonical gear manifest. Consumed by the DOM section (with icons) and by
// the 3D notice-board painter (names only).

export type SimpleIcon = {
  path: string;
  hex: string;
};

export type ReactIconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

export interface Skill {
  name: string;
  icon: SimpleIcon | ReactIconComponent;
  isReactIcon?: boolean;
  color?: string;
}

export const isSimpleIcon = (icon: SimpleIcon | ReactIconComponent): icon is SimpleIcon => {
  return "path" in icon;
};

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

export const SKILLS: SkillCategory[] = [
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
      { name: "Datadog", icon: siDatadog, color: siDatadog.hex },
      { name: "Git", icon: siGit, color: siGit.hex },
      { name: "Jira", icon: siJira, color: siJira.hex },
      { name: "Figma", icon: siFigma, color: siFigma.hex },
      { name: "Vercel", icon: siVercel, color: siVercel.hex },
    ],
  },
];

export const SKILL_ITEM_COUNT = SKILLS.reduce((n, c) => n + c.skills.length, 0);

import { Experience, PortfolioItem, NavItem } from "../types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Item 1", href: "#home" },
  { label: "Item 2", href: "#experience" },
  { label: "Item 3", href: "#portfolio" },
  { label: "Item 4", href: "#about" },
];

export const COMPANY_PLACEHOLDERS = [
  "Company A",
  "Company B",
  "Company C",
  "Company D",
  "Company E",
  "Company F",
];

export const EXPERIENCES: Experience[] = [
  {
    title: "Software Engineer Intern @Horizon Labs",
    description: [
      "- Orchestrated high-throughput backend services using FastAPI, seamlessly integrating data pipelines from Microsoft Azure to power core application features.",
      "- Built responsive front-end components (React, TypeScript) for data visualization and platform management, supporting agile project execution.",
    ],
    dates: "Jul. 2025 – Oct. 2025",
    technologies: ["FastAPI", "SQLAlchemy", "React", "Next.js", "Tailwind CSS", "TypeScript", "MS SQL"],
  },
  {
    title: "Data Analyst Intern @GoTrade (YC S19)",
    description: [
      "- Interpreted a dataset of 500k+ transaction records to extract actionable intelligence, directly supporting strategic planning for a user base of 100k+ active users.",
      "- Compiled weekly insight reports identifying key churn risks, leading to a 10% improvement in targeted retention workflow efficiency.",
      "- Automated KPI dashboards using SQL and Python, eliminating manual data entry and saving 5 hours of managerial time per week.",
    ],
    dates: "May 2025 – Aug. 2025",
    technologies: ["SQL", "Python", "PostgreSQL", "AWS", "Lark", "TablePlus"],
  },
  {
    title: "Systems Administrator Intern @CHB Technology Pte Ltd",
    description: [
      "- Administered Microsoft Azure environments for 10+ enterprise clients, ensuring high availability for critical virtual machines through proactive monitoring.",
      "- Developed key UI components for an internal administrative portal using HTML/CSS and JavaScript, enhancing task efficiency and usability for the support team."
    ],
    dates: "Feb. 2022 – Aug. 2022",
    technologies: ["Microsoft Azure", "Windows Server"],
  },
];

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  { id: "1", title: "Portfolio Item 1", image: "" },
  { id: "2", title: "Portfolio Item 2", image: "" },
  { id: "3", title: "Portfolio Item 3", image: "" },
  { id: "4", title: "Portfolio Item 4", image: "" },
  { id: "5", title: "Portfolio Item 5", image: "" },
  { id: "6", title: "Portfolio Item 6", image: "" },
];


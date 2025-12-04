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
    title: "Graphic Designer at Dewa-Dewi Tech",
    description: [
      "- Graphic Designer at Dewa-Dewi Tech, creating creative and functional visual designs to support brands and digital products.",
      "- Led design initiatives for multiple client projects, resulting in increased brand recognition.",
      "- Collaborated with cross-functional teams to deliver high-quality visual assets.",
    ],
    dates: "2015 - 2017",
    image: "/experience-1.jpg", // Add your image path here
    technologies: ["Photoshop", "Illustrator", "InDesign"],
  },
  {
    title: "UI/UX Designer at Odama Studio",
    description: [
      "UI/UX Designer at Odama Studio, creating intuitive and engaging digital experiences through functional and aesthetic design.",
      "Designed user interfaces for web and mobile applications used by thousands of users.",
      "Conducted user research and usability testing to inform design decisions.",
    ],
    dates: "2017 - 2019",
    image: "/experience-2.jpg", // Add your image path here
    technologies: ["Figma", "Sketch", "Prototyping"],
  },
  {
    title: "UX Researcher at Korsa Studio",
    description: [
      "UX Researcher at Korsa Studio, connecting data and design to create intuitive and effective user experiences.",
      "Performed comprehensive user research studies to identify pain points and opportunities.",
      "Presented findings to stakeholders and influenced product strategy decisions.",
    ],
    dates: "2018 - 2021",
    image: "/experience-3.jpg", // Add your image path here
    technologies: ["User Testing", "Analytics", "Research"],
  },
  {
    title: "Product Designer at Apple. Inc",
    description: [
      "Product Designer at Apple Inc., designing innovative experiences that connect technology and aesthetics to create iconic products",
      "Designing next-generation product experiences for millions of users worldwide.",
      "Working closely with engineering teams to bring designs to life.",
    ],
    dates: "2021 - Now",
    image: "/experience-4.jpg", // Add your image path here
    technologies: ["Design Systems", "Prototyping", "Collaboration"],
  },
];

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  { id: "1", title: "Portfolio Item 1", image: "", category: "Dashboard" },
  { id: "2", title: "Portfolio Item 2", image: "", category: "Saas" },
  { id: "3", title: "Portfolio Item 3", image: "", category: "Product" },
  { id: "4", title: "Portfolio Item 4", image: "", category: "Dashboard" },
  { id: "5", title: "Portfolio Item 5", image: "", category: "Saas" },
  { id: "6", title: "Portfolio Item 6", image: "", category: "Product" },
];


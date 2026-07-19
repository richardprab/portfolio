import type { Experience, PortfolioItem } from "../types";

// Local content source for the portfolio site.
// Edit these arrays to update experiences and projects — no database required.

export const experiences: Experience[] = [
  {
    title: "Business Analyst Intern @Shopee Pte Ltd",
    description: [
      "- Generated weekly policy reports and analyzed market segments to design user surveys, collaborating with local teams to identify core Returns & Refunds bottlenecks.",
      "- Built and automated daily SQL data pipelines from Shopee's internal warehouse to support recurring operational analysis and process improvement.",
    ],
    dates: "May 2026 – Aug. 2026",
    technologies: ["SQL", "Python", "Metabase", "Tableau"],
  },
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
    technologies: ["SQL", "Python", "PostgreSQL", "AWS", "Lark", "TablePlus", "Metabase"],
  },
  {
    title: "Systems Administrator Intern @CHB Technology Pte Ltd",
    description: [
      "- Administered Microsoft Azure environments for 10+ enterprise clients, ensuring high availability for critical virtual machines through proactive monitoring.",
      "- Developed key UI components for an internal administrative portal using HTML/CSS and JavaScript, enhancing task efficiency and usability for the support team.",
    ],
    dates: "Feb. 2022 – Aug. 2022",
    technologies: ["Microsoft Azure", "Windows Server"],
  },
];

export const portfolioItems: PortfolioItem[] = [
  {
    id: "nus-fintech-summit-2025",
    title: "NUS Fintech Summit 2025",
    image: "/portfolio/project_1.png",
    description:
      "Contributed to the official website for the NUS Fintech Summit 2025, a student-run hackathon and financial technology event. My role focused on developing core navigation and key informational sections to ensure a user-friendly experience for participants and sponsors.\n\n• Engineered a fully responsive navigation bar featuring hover-triggered dropdown menus for desktop and a custom hamburger menu for mobile devices, ensuring seamless access to event schedules and registration across all screen sizes.\n• Developed a dedicated dynamic Sponsors page that organizes partners into tiered categories (Platinum, Gold, Silver) and implemented reusable components with custom-styled headers and grid layouts to effectively highlight supporting organizations.\n• Built the \"About\" and \"FAQ\" pages to communicate essential event details, creating interactive UI elements such as expandable FAQ accordions and modular content sections to present text and imagery clearly.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostCSS"],
    demoLink: "https://github.com/NUS-Fintech-Society/SD_Fintech_Summit_2025",
  },
  {
    id: "goshare",
    title: "GoShare",
    image: "/portfolio/project_2.png",
    description:
      "• Developed the Minimum Viable Product (MVP) for a B2B collaboration startup, creating a platform that enables small businesses to coordinate bulk orders and cross-sell products to validate the core business concept.\n• Built a responsive React frontend styled with Tailwind CSS and containerized the entire MVP stack using Docker to facilitate rapid iteration and deployment during the product validation phase.",
    technologies: ["PostgreSQL", "React", "Vite", "Tailwind CSS", "Docker"],
    demoLink: "https://github.com/kaichewy/GoShare",
  },
  {
    id: "canornot",
    title: "CanOrNot",
    image: "/portfolio/project_3.png",
    description:
      "• Developed a comprehensive compliance analysis ecosystem comprising a React web application, a Flask backend API, and a VS Code Extension to automatically evaluate code features against privacy regulations like GDPR and COPPA.\n• Implemented an AI-powered risk assessment engine utilizing Retrieval-Augmented Generation (RAG) with ChromaDB and Sentence Transformers, engineering a resilient fallback mechanism that degrades to \"Pure RAG\" mode to ensure continuous functionality during LLM service outages.\n• Built a modern, responsive frontend dashboard using Tailwind CSS and shadcn/ui for real-time analysis and batch CSV processing, while containerizing the entire multi-service architecture with Docker for streamlined deployment and testing.",
    technologies: ["Python", "Flask", "React", "TypeScript", "Vite", "Tailwind CSS", "ChromaDB", "Docker"],
    videoLink: "https://youtu.be/vpKYJdtNNkA",
    demoLink: "https://devpost.com/software/canornot",
  },
  {
    id: "aha",
    title: "Aha!",
    image: "/portfolio/project_4.png",
    description:
      "• Conceptualized and pitched an intelligent AI tutoring system designed to dynamically tailor lessons to individual student learning styles, pace, and personal school materials, solving key engagement issues in the EdTech market.\n• Designed a dual-stream business model featuring B2C subscriptions for individuals and B2B licensing for schools, differentiating the product through syllabus localization and adaptive teaching algorithms.\n• Developed the product strategy and pitch for CatalystX 2025, identifying market gaps in existing solutions like repetitive questioning and lack of personalized adaptability.",
    technologies: [],
    demoLink:
      "https://www.canva.com/design/DAG1dG4v2pk/F6hGUz7I2bfH5fZqTGy0xw/edit?utm_content=DAG1dG4v2pk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
  },
  {
    id: "olist-market-analysis",
    title: "Olist Market Analysis",
    image: "/portfolio/project_5.png",
    description:
      "• Conducted a comprehensive business analysis of Olist, a Brazilian e-commerce platform, to identify key factors influencing customer retention and optimize sales performance across diverse product categories.\n• Implemented a robust data cleaning and processing pipeline that utilized sentiment analysis and key phrase extraction on customer reviews to derive actionable qualitative insights.\n• Formulated strategic recommendations, including algorithmic enhancements for underperforming categories and targeted seller incentives, backed by geographic and sales data analysis.",
    technologies: ["Pandas", "NumPy", "Tableau", "KeyBERT", "Python"],
    demoLink:
      "https://www.canva.com/design/DAGi7kjZ8IY/DD1dfWNLSYlS-6HdGI0TUg/edit?utm_content=DAGi7kjZ8IY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
  },
  {
    id: "auroramart",
    title: "AuroraMart",
    image: "/portfolio/project_6.jpg",
    description:
      "Designed as a full-featured e-commerce simulation for an academic course, AuroraMart replicates the core functionalities of modern online marketplaces to demonstrate a scalable full-stack architecture.\n• Built a comprehensive e-commerce platform using Django, featuring a custom machine learning recommendation engine that utilizes scikit-learn and pandas to predict user category preferences and suggest products based on association rules.\n• Implemented real-time communication features, including live customer support chat and instant order notifications, by leveraging Django Channels and WebSockets for asynchronous event handling.\n• Designed a scalable architecture with a custom admin dashboard for inventory and order management, integrated Stripe for secure payments, and utilized Tailwind CSS for a responsive, modern frontend interface.",
    technologies: ["Django", "Scikit-Learn", "Tailwind CSS", "Python", "HTML", "CSS", "JavaScript"],
    videoLink: "https://youtu.be/8IYS1bRl4M4",
    demoLink: "https://github.com/richardprab/auroramart",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    image: "/portfolio/project_7.png",
    description:
      "• Developed a modern, responsive personal portfolio website using Next.js and TypeScript to showcase professional experience and projects.\n• Built a local content layer with typed data modules for fast, dependency-free rendering of portfolio items and experience data.\n• Enhanced user engagement with smooth, interactive animations powered by Framer Motion and styled the application with Tailwind CSS for a consistent and polished aesthetic.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "React Query", "React", "Vercel"],
    demoLink: "https://github.com/richardprab/portfolio",
  },
  {
    id: "bearstack",
    title: "BearStack",
    image: "/portfolio/project_8.png",
    description:
      "BearStack is an end-to-end observability and active defense platform for Google Vertex AI that automates reliability through three core pillars.\n\n• Security (Jailbreak Defense): Implemented malicious prompt detection that automatically refuses suspicious requests and triggers Severity-3 incidents in Datadog to alert stakeholders, protecting the LLM from adversarial attacks.\n• Cost (Smart Rate Limiting): Built intelligent rate limiting that identifies abusive usage patterns and enforces HTTP 429 limits to prevent resource exhaustion, demonstrating clear cost optimization signals in Datadog dashboards.\n• Performance (Circuit Breaking): Engineered real-time error budget monitoring with SLO Burn Rate calculations. When downstream dependencies fail, the system trips a Circuit Breaker to stop cascading failures, applying rigorous SRE principles to non-deterministic LLM applications.\n\nInstrumented the Python application with Datadog APM to trace requests from user input to Vertex AI inference, creating a unified \"Single Pane of Glass\" that correlates security, cost, and performance signals for comprehensive observability.",
    technologies: ["Python", "Docker", "Gemini", "Datadog APM"],
    demoLink: "https://devpost.com/software/barkingstack",
    videoLink:
      "https://www.youtube.com/watch?v=aRRMZ3w9a30&embeds_referring_euri=https%3A%2F%2Fdevpost.com%2F&source_ve_path=MjM4NTE",
  },
  {
    id: "your-search-wrapped",
    title: "Your Search Wrapped",
    image: "/portfolio/your_search_wrapped.png",
    description:
      "• Engineered a personalized analytics platform that transforms raw ChatGPT search history into an engaging 'Spotify Wrapped'-style narrative, visualizing user interaction patterns and habits.\n• Implemented a robust NLP backend using FastAPI and PyTorch, leveraging Hugging Face Transformers for semantic topic modeling and Myers-Briggs (MBTI) personality profiling based on linguistic patterns.\n• Built an immersive, interactive 3D frontend with React Three Fiber and Framer Motion, featuring smooth transitions and dynamic data storytelling to enhance the user retrospective experience.",
    technologies: ["React", "FastAPI", "Numpy", "Pandas", "A2T", "XGBoost"],
    videoLink: "https://youtu.be/c1OU6-jiGxk",
    demoLink: "https://devpost.com/software/your-search-wrapped",
  },
  {
    id: "lumen",
    title: "Lumen",
    image: "/portfolio/lumen.png",
    description:
      "• Developed a comprehensive activity management ecosystem to streamline event registration for caregivers and staff, addressing key friction points in manual data consolidation and scheduling.\n• Engineered a robust REST API using Node.js and Express with JWT-based authentication, securing distinct role-based access for participants, volunteers, and administrators while maintaining comprehensive API documentation via Swagger.\n• Built a modern, accessible React 19 frontend styled with Tailwind CSS, implementing complex features like real-time conflict detection, interactive calendar scheduling, and automated daily reminders to enhance user engagement and operational efficiency.",
    technologies: ["React", "Node.js", "Express", "MySQL", "Google Cloud SQL", "Tailwind CSS"],
    videoLink: "https://youtu.be/IYKRKMPCQXs",
    demoLink: "https://devpost.com/software/lumen-dr7njy",
  },
];

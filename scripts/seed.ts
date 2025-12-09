// Load environment variables FIRST before any other imports
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Verify env var is loaded
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in .env.local');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    // Dynamic imports after env vars are loaded
    const { default: connectDB } = await import('../lib/mongodb');
    const { default: PortfolioItem } = await import('../models/PortfolioItem');
    const { default: Experience } = await import('../models/Experience');
    
    await connectDB();
    console.log('Connected to MongoDB Atlas');

    // Seed Portfolio Items
    await PortfolioItem.deleteMany({});
    console.log('Cleared existing portfolio items');

    const portfolioItems = [
      { title: "Portfolio Item 1", image: "" },
      { title: "Portfolio Item 2", image: "" },
      { title: "Portfolio Item 3", image: "" },
      { title: "Portfolio Item 4", image: "" },
      { title: "Portfolio Item 5", image: "" },
      { title: "Portfolio Item 6", image: "" },
    ];

    await PortfolioItem.insertMany(portfolioItems);
    console.log(`Seeded ${portfolioItems.length} portfolio items`);

    // Seed Experiences
    await Experience.deleteMany({});
    console.log('Cleared existing experiences');

    const experiences = [
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

    await Experience.insertMany(experiences);
    console.log(`Seeded ${experiences.length} experiences`);
    
    console.log('Database "MyPortfolio" has been seeded successfully!');
    console.log('   - Collections: portfolioitems, experiences');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

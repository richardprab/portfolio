"use client";

import { Navigation } from "./components/Navigation";
import { CompanyLogos } from "./components/CompanyLogos";
import { HeroSection } from "./sections/HeroSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { NAV_ITEMS, COMPANY_PLACEHOLDERS, EXPERIENCES, PORTFOLIO_ITEMS } from "./data/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation items={NAV_ITEMS} />
      
      <HeroSection />
      
      <CompanyLogos companies={COMPANY_PLACEHOLDERS} />
      
      <ExperienceSection experiences={EXPERIENCES} />
      
      <PortfolioSection portfolioItems={PORTFOLIO_ITEMS} />
    </div>
  );
}

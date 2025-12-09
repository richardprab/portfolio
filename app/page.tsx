"use client";

import { Navigation } from "./components/Navigation";
import { CompanyLogos } from "./components/CompanyLogos";
import { HeroSection } from "./sections/HeroSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { NAV_ITEMS, COMPANY_PLACEHOLDERS } from "./data/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navigation items={NAV_ITEMS} />
        <HeroSection />
        <CompanyLogos companies={COMPANY_PLACEHOLDERS} />
        <ExperienceSection />
        <PortfolioSection />
      </div>
    </div>
  );
}

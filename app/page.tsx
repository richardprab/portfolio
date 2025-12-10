"use client";

import { Navigation } from "./components/Navigation";
import { HeroSection } from "./sections/HeroSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { AnimatedBackground } from "./components/AnimatedBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative">
      <AnimatedBackground />
      
      <div className="relative z-10 px-4 sm:px-8 lg:px-16 xl:px-24">
        <Navigation />
        <HeroSection />
        <ExperienceSection />
        <PortfolioSection />
      </div>
    </div>
  );
}

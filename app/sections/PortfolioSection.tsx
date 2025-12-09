"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { PortfolioCard } from "../components/PortfolioCard";
import { PortfolioItem } from "../types";

export const PortfolioSection = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        
        if (data.success) {
          const items = data.data.map((item: any) => ({
            id: item._id.toString(),
            title: item.title,
            image: item.image,
          }));
          setPortfolioItems(items);
        } else {
          setError('Failed to load portfolio items');
        }
      } catch (err) {
        console.error('Error fetching portfolio items:', err);
        setError('Failed to load portfolio items');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  return (
    <section id="portfolio" className="py-12 sm:py-16 relative z-0">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Portfolio"
          title={<>A collection of projects<br />that showcase my work</>}
          description="A comprehensive showcase of my projects."
        />

        <div className="px-4 sm:px-8 lg:px-16 xl:px-24">
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading portfolio items...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {portfolioItems.map((item, index) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};


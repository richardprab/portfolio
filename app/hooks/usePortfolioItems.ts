import { useQuery } from "@tanstack/react-query";
import { PortfolioItem } from "../types";

interface PortfolioResponse {
  success: boolean;
  data?: Array<{
    _id: { toString: () => string };
    title: string;
    image: string;
    description?: string;
    videoLink?: string;
    demoLink?: string;
    technologies?: string[];
  }>;
  error?: string;
}

async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  const response = await fetch("/api/portfolio");
  const data: PortfolioResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to fetch portfolio items");
  }

  return data.data.map((item) => ({
    id: item._id.toString(),
    title: item.title,
    image: item.image,
    description: item.description,
    videoLink: item.videoLink,
    demoLink: item.demoLink,
    technologies: item.technologies,
  }));
}

export function usePortfolioItems() {
  return useQuery({
    queryKey: ["portfolio-items"],
    queryFn: fetchPortfolioItems,
  });
}


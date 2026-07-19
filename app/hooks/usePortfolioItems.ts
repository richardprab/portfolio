import { useQuery } from "@tanstack/react-query";
import { PortfolioItem } from "../types";
import { portfolioItems } from "../data/portfolio";

async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  return portfolioItems;
}

export function usePortfolioItems() {
  return useQuery({
    queryKey: ["portfolio-items"],
    queryFn: fetchPortfolioItems,
  });
}

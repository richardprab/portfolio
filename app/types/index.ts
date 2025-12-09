export interface Experience {
  title: string;
  description: string[];
  dates: string;
  image?: string;
  technologies?: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
}

export interface NavItem {
  label: string;
  href: string;
}


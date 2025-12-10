import { useQuery } from "@tanstack/react-query";
import { Experience } from "../types";

interface ExperienceResponse {
  success: boolean;
  data?: Array<{
    _id?: string;
    title: string;
    description: string[];
    dates: string;
    image?: string;
    technologies?: string[];
  }>;
  error?: string;
}

async function fetchExperiences(): Promise<Experience[]> {
  const response = await fetch("/api/experience");
  const data: ExperienceResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to fetch experiences");
  }

  return data.data.map((item) => ({
    title: item.title,
    description: item.description,
    dates: item.dates,
    image: item.image || undefined,
    technologies: item.technologies || undefined,
  }));
}

export function useExperiences() {
  return useQuery({
    queryKey: ["experiences"],
    queryFn: fetchExperiences,
  });
}


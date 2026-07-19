import { useQuery } from "@tanstack/react-query";
import { Experience } from "../types";
import { experiences } from "../data/portfolio";

async function fetchExperiences(): Promise<Experience[]> {
  return experiences;
}

export function useExperiences() {
  return useQuery({
    queryKey: ["experiences"],
    queryFn: fetchExperiences,
  });
}

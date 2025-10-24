import { useState, useEffect, useCallback } from "react";
import type { Mentor, Mentee } from "../App";
import { mentorService, type MentorFilters } from "../services/mentorService";
import { useDebounce } from "./useDebounce";

export interface UseMentorsResult {
  mentors: Mentor[];
  recommendedMentors: Mentor[];
  otherMentors: Mentor[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  expertiseOptions: string[];
  experienceOptions: string[];
  availabilityOptions: string[];
}

export interface UseMentorsOptions {
  menteeProfile: Mentee;
  searchTerm: string;
  selectedExpertise: string[];
  selectedExperience: string[];
  selectedAvailability: string[];
}

export const useMentors = ({
  menteeProfile,
  searchTerm,
  selectedExpertise,
  selectedExperience,
  selectedAvailability,
}: UseMentorsOptions): UseMentorsResult => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState({
    expertise: [] as string[],
    experience: [] as string[],
    availability: [] as string[],
  });

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchMentors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: MentorFilters = {
        interests: menteeProfile.interests,
      };

      // Add search and filter parameters
      if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
      if (selectedExpertise.length > 0) filters.expertise = selectedExpertise;
      if (selectedExperience.length > 0)
        filters.experience = selectedExperience;
      if (selectedAvailability.length > 0)
        filters.availability = selectedAvailability;

      const response = await mentorService.fetchMentorsWithFallback(filters);
      setMentors(response.mentors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch mentors");
      console.error("Error fetching mentors:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    menteeProfile.interests,
    debouncedSearchTerm,
    selectedExpertise,
    selectedExperience,
    selectedAvailability,
  ]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await mentorService.getFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      console.error("Error fetching filter options:", err);
      // Generate filter options from existing mentors as fallback
      const uniqueExpertise = Array.from(
        new Set(mentors.flatMap((m) => m.expertise))
      );
      const uniqueExperience = Array.from(
        new Set(mentors.map((m) => m.experience))
      );
      const uniqueAvailability = Array.from(
        new Set(mentors.map((m) => m.availability))
      );

      setFilterOptions({
        expertise: uniqueExpertise,
        experience: uniqueExperience,
        availability: uniqueAvailability,
      });
    }
  }, [mentors]);

  // Initial fetch
  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // Fetch filter options when mentors change
  useEffect(() => {
    if (mentors.length > 0 && filterOptions.expertise.length === 0) {
      fetchFilterOptions();
    }
  }, [mentors, filterOptions.expertise.length, fetchFilterOptions]);

  // Categorize mentors based on user interests
  const recommendedMentors = mentors.filter((mentor) =>
    mentor.expertise.some((exp) => menteeProfile.interests.includes(exp))
  );

  const otherMentors = mentors.filter(
    (mentor) =>
      !mentor.expertise.some((exp) => menteeProfile.interests.includes(exp))
  );

  return {
    mentors,
    recommendedMentors,
    otherMentors,
    isLoading,
    error,
    refetch: fetchMentors,
    expertiseOptions: filterOptions.expertise,
    experienceOptions: filterOptions.experience,
    availabilityOptions: filterOptions.availability,
  };
};

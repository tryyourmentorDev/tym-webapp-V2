import { useState, useEffect, useCallback, useMemo } from "react";
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

const parseExperienceYears = (value: string): number | null => {
  const match = value.match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const years = Number(match[0]);
  return Number.isFinite(years) ? years : null;
};

const matchesExperienceSelection = (
  mentor: Mentor,
  selectedExperience: string[]
) => {
  if (selectedExperience.length === 0) return true;

  const mentorYears =
    parseExperienceYears(mentor.experience) ?? mentor.experienceYears ?? null;

  return selectedExperience.some((filter) => {
    const normalizedFilter = filter.trim().toLowerCase();
    const numbers = normalizedFilter.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];

    if (mentorYears !== null && numbers.length > 0) {
      if (normalizedFilter.includes("+")) {
        return mentorYears >= numbers[0];
      }

      if (numbers.length >= 2) {
        return mentorYears >= numbers[0] && mentorYears <= numbers[1];
      }

      return mentorYears === numbers[0];
    }

    return mentor.experience.trim().toLowerCase() === normalizedFilter;
  });
};

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

      if (menteeProfile.industryId !== undefined) {
        filters.industryId = menteeProfile.industryId;
      }

      if (menteeProfile.jobRoleId !== undefined) {
        filters.jobRoleId = menteeProfile.jobRoleId;
      }

      if (menteeProfile.educationLevelId !== undefined) {
        filters.educationLevelId = menteeProfile.educationLevelId;
      }

      const response = await mentorService.fetchMentorsWithFallback(
        filters,
        menteeProfile
      );
      setMentors(response.mentors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch mentors");
      console.error("Error fetching mentors:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    menteeProfile,
  ]);

  // Initial fetch
  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // Keep filters relevant to the current shortlist instead of showing global
  // options that would always produce an empty result.
  useEffect(() => {
    const experienceBuckets = new Set<string>();

    mentors.forEach((mentor) => {
      const years =
        parseExperienceYears(mentor.experience) ??
        mentor.experienceYears ??
        null;
      if (years === null) return;
      if (years >= 5) experienceBuckets.add("5+ years");
      else if (years >= 3) experienceBuckets.add("3–4 years");
      else experienceBuckets.add("0–2 years");
    });

    const experienceOrder = ["0–2 years", "3–4 years", "5+ years"];

    setFilterOptions({
      expertise: Array.from(
        new Set(mentors.flatMap((mentor) => mentor.expertise))
      ).sort((a, b) => a.localeCompare(b)),
      experience: experienceOrder.filter((item) =>
        experienceBuckets.has(item)
      ),
      availability: Array.from(
        new Set(
          mentors
            .map((mentor) => mentor.availability)
            .filter((item) => item.trim().length > 0)
        )
      ).sort((a, b) => a.localeCompare(b)),
    });
  }, [mentors]);

  const visibleMentors = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

    return mentors.filter((mentor) => {
      const searchableText = [
        mentor.name,
        mentor.company,
        mentor.title,
        mentor.bio,
        ...mentor.expertise,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesExpertise =
        selectedExpertise.length === 0 ||
        selectedExpertise.some((expertise) =>
          mentor.expertise.includes(expertise)
        );
      const matchesExperience =
        matchesExperienceSelection(mentor, selectedExperience);
      const matchesAvailability =
        selectedAvailability.length === 0 ||
        selectedAvailability.includes(mentor.availability);

      return (
        matchesSearch &&
        matchesExpertise &&
        matchesExperience &&
        matchesAvailability
      );
    });
  }, [
    mentors,
    debouncedSearchTerm,
    selectedExpertise,
    selectedExperience,
    selectedAvailability,
  ]);

  // Categorize mentors based on user interests
  const recommendedMentors = visibleMentors.filter((mentor) =>
    mentor.expertise.some((exp) => menteeProfile.interests.includes(exp))
  );

  const otherMentors = visibleMentors.filter(
    (mentor) =>
      !mentor.expertise.some((exp) => menteeProfile.interests.includes(exp))
  );

  return {
    mentors: visibleMentors,
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

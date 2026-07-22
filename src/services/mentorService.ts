import type { Mentor, Mentee } from "../App";

export interface MentorFilters {
  search?: string;
  expertise?: string[];
  experience?: string[];
  availability?: string[];
  interests?: string[]; // For personalized recommendations
  industryId?: number;
  jobRoleId?: number;
  educationLevelId?: number;
}

export interface MentorResponse {
  mentors: Mentor[];
  total: number;
  recommended?: Mentor[];
}

export interface MentorReview {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  createdAt: string;
}

export interface MentorReviewResponse {
  reviews: MentorReview[];
  total: number;
}

export type MentorUnavailableDateTime = Record<string, "full-day" | string[]>;

export interface MentorAvailability {
  workingHours: {
    start: string;
    end: string;
    timezone?: string;
  } | null;
  workingDays: number[];
  unavailableDateTime: MentorUnavailableDateTime;
}

// A single admin-defined bookable slot (mentor_availability_slots). The
// booking endpoint below only ever returns free ones (active, in the future,
// not already booked).
export interface MentorSlot {
  id: number;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
}

export interface MentorBookingPayload {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  mentee?: {
    educationQualificationId?: number | null;
    currentJobRoleId?: number | null;
    expectedJobRoleId?: number | null;
    experienceLevel?: string | null;
    experienceYears?: number | null;
    interests?: string[];
    goals?: string[];
    city?: string;
  };
  booking: {
    mentorId: string;
    date: string;
    time: string;
    timezone: string;
    city: string;
    sessionExpectations?: string;
    cv?: {
      fileName: string;
      mimeType: string;
      size: number;
      base64: string;
    };
  };
}

export interface MentorBookingResponse {
  bookingId: string;
  mentorId: string;
  startTime: string;
  endTime: string;
  status: string;
  message?: string;
}

interface MentorSearchPayload {
  mentee?: {
    industryId: number | null;
    jobRoleId: number | null;
    educationLevelId: number | null;
    experienceLevel: string;
    interests: string[];
    goals: string[];
  };
  filters: MentorFilters;
}

const normalizeMentor = (mentor: any): Mentor => {
  return {
    id: mentor.id?.toString() ?? "",
    name: mentor.name ?? "",
    title: mentor.title ?? "",
    company: mentor.company ?? "",
    expertise: Array.isArray(mentor.expertise) ? mentor.expertise : [],
    experience: mentor.experience ?? "",
    rating: typeof mentor.rating === "number" ? mentor.rating : 0,
    reviewCount:
      typeof mentor.reviewCount === "number" ? mentor.reviewCount : 0,
    availability: mentor.availability ?? "",
    location: mentor.location ?? "",
    languages: Array.isArray(mentor.languages)
      ? mentor.languages
      : [mentor.languages],
    bio: mentor.bio ?? "",
    achievements: Array.isArray(mentor.achievements) ? mentor.achievements : [],
    image: mentor.image ?? "",
    industry: mentor.industry ?? "",
    linkedinUrl:
      typeof mentor.linkedinUrl === "string" && mentor.linkedinUrl.trim()
        ? mentor.linkedinUrl
        : undefined,
    unavailableDateTime:
      mentor.unavailableDateTime &&
      typeof mentor.unavailableDateTime === "object"
        ? mentor.unavailableDateTime
        : {},
    workingHours:
      mentor.workingHours && typeof mentor.workingHours === "object"
        ? mentor.workingHours
        : undefined,
    workingDays: Array.isArray(mentor.workingDays) ? mentor.workingDays : [],
  };
};

class MentorService {
  private baseURL: string;
  private matchingEndpoint: string;

  constructor() {
    // Use environment variable or default to localhost for development
    this.baseURL =
      import.meta.env.VITE_API_BASE_URL ||
      "https://try-your-mentor-bff.onrender.com";

    this.matchingEndpoint =
      import.meta.env.VITE_MATCHING_URL ||
      "https://try-your-mentor-bff.onrender.com/matching";
  }

  /**
   * Fetch mentors from the backend API
   * @param filters - Optional filters to apply
   * @returns Promise containing mentors and metadata
   */
  async fetchMentors(
    filters: MentorFilters = {},
    menteeProfile?: Mentee,
  ): Promise<MentorResponse> {
    try {
      const payload: MentorSearchPayload = {
        mentee: menteeProfile
          ? {
              industryId: menteeProfile.industryId ?? null,
              jobRoleId: menteeProfile.jobRoleId ?? null,
              educationLevelId: menteeProfile.educationLevelId ?? null,
              experienceLevel: menteeProfile.experienceLevel,
              interests: menteeProfile.interests,
              goals: menteeProfile.goals,
            }
          : undefined,
        filters,
      };

      const response = await fetch(this.matchingEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const mentors = Array.isArray(data.mentors)
        ? data.mentors.map(normalizeMentor)
        : [];

      const recommended = Array.isArray(data.recommended)
        ? data.recommended.map(normalizeMentor)
        : undefined;

      return {
        mentors,
        total: data.total ?? mentors.length,
        recommended,
      };
    } catch (error) {
      console.error("Error fetching mentors:", error);
      throw error;
    }
  }

  /**
   * Get all industries from the backend. Used by onboarding's "areas of
   * expertise" step, which despite its wording actually selects an industry
   * (drives industryId for job-role filtering and mentor matching).
   */
  async getIndustries(): Promise<{ id: number; name: string }[]> {
    try {
      const response = await fetch(`${this.baseURL}/industries`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching industries:", error);
      return [];
    }
  }

  /**
   * Get the job roles linked to a given industry. Used by onboarding's job-role
   * step so the options (and their IDs) always match what the admin has onboarded,
   * rather than a hardcoded list that can drift out of sync with the DB.
   */
  async getJobRoles(
    industryId: number,
  ): Promise<{ id: number; name: string }[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/job-roles?industryId=${industryId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching job roles:", error);
      return [];
    }
  }

  /**
   * Get all qualifications (education levels) from the backend. Used by
   * onboarding's education step so the IDs match the DB used for matching.
   */
  async getQualifications(): Promise<{ id: number; name: string }[]> {
    try {
      const response = await fetch(`${this.baseURL}/qualifications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      return [];
    }
  }

  /**
   * Get available filter options from the backend
   */
  async getFilterOptions(): Promise<{
    expertise: string[];
    experience: string[];
    availability: string[];
  }> {
    try {
      const response = await fetch(`${this.baseURL}/mentors/filter-options`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching filter options:", error);
      // Return fallback options if API fails
      return {
        expertise: [],
        experience: [],
        availability: [],
      };
    }
  }

  /**
   * Fetch mentor reviews from backend
   */
  async getMentorReviews(mentorId: string): Promise<MentorReviewResponse> {
    try {
      console.log(`Fetching mentor reviews for ${mentorId}...`);
      const response = await fetch(
        `${this.baseURL}/mentor-reviews/${mentorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        reviews: Array.isArray(data.reviews) ? data.reviews : [],
        total: typeof data.total === "number" ? data.total : 0,
      };
    } catch (error) {
      console.error(`Error fetching mentor reviews for ${mentorId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch mentor availability (working hours/days and unavailable slots)
   */
  async getMentorAvailability(mentorId: string): Promise<MentorAvailability> {
    try {
      const response = await fetch(
        `${this.baseURL}/mentors/${mentorId}/availability`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        workingHours:
          data.workingHours && data.workingHours.start && data.workingHours.end
            ? {
                start: data.workingHours.start,
                end: data.workingHours.end,
                timezone: data.workingHours.timezone ?? undefined,
              }
            : null,
        workingDays: Array.isArray(data.workingDays) ? data.workingDays : [],
        unavailableDateTime:
          data.unavailableDateTime &&
          typeof data.unavailableDateTime === "object"
            ? data.unavailableDateTime
            : {},
      };
    } catch (error) {
      console.error(
        `Error fetching mentor availability for ${mentorId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get a mentor's admin-defined bookable slots (only free ones are ever
   * returned — active, in the future, and not already booked). Pass `date`
   * (YYYY-MM-DD) to scope to a single day — the booking form calls this each
   * time the mentee picks a date, to populate the time dropdown.
   */
  async getMentorSlots(mentorId: string, date?: string): Promise<MentorSlot[]> {
    try {
      const url = date
        ? `${this.baseURL}/mentors/${mentorId}/slots?date=${encodeURIComponent(date)}`
        : `${this.baseURL}/mentors/${mentorId}/slots`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((slot: any) => ({
        id: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
      }));
    } catch (error) {
      console.error(`Error fetching mentor slots for ${mentorId}:`, error);
      throw error;
    }
  }

  /**
   * Submit a booking request for a mentor
   */
  async bookMentorSession(
    mentorId: string,
    payload: MentorBookingPayload,
  ): Promise<MentorBookingResponse> {
    try {
      const response = await fetch(
        `${this.baseURL}/mentors/${mentorId}/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message =
          errorBody?.message || `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error booking mentor session for ${mentorId}:`, error);
      throw error;
    }
  }

  /**
   * Fallback method that simulates API behavior with mock data
   * Useful for development when backend is not available
   */
  async fetchMentorsWithFallback(
    filters: MentorFilters = {},
    menteeProfile?: Mentee,
  ): Promise<MentorResponse> {
    return this.fetchMentors(filters, menteeProfile);
  }
}

// Export a singleton instance
export const mentorService = new MentorService();

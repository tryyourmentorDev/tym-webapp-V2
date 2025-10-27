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

export type MentorUnavailableDateTime = Record<
  string,
  "full-day" | string[]
>;

export interface MentorAvailability {
  workingHours: {
    start: string;
    end: string;
    timezone?: string;
  } | null;
  workingDays: number[];
  unavailableDateTime: MentorUnavailableDateTime;
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
    cv: {
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
    languages: Array.isArray(mentor.languages) ? mentor.languages : [mentor.languages],
    bio: mentor.bio ?? "",
    achievements: Array.isArray(mentor.achievements)
      ? mentor.achievements
      : [],
    image: mentor.image ?? "",
    industry: mentor.industry ?? "",
    unavailableDateTime:
      mentor.unavailableDateTime && typeof mentor.unavailableDateTime === "object"
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
      import.meta.env.VITE_API_BASE_URL || "https://try-your-mentor-bff.onrender.com";

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
    menteeProfile?: Mentee
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
      const response = await fetch(
        `${this.baseURL}/mentor-reviews/${mentorId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
        }
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
        error
      );
      throw error;
    }
  }

  /**
   * Submit a booking request for a mentor
   */
  async bookMentorSession(
    mentorId: string,
    payload: MentorBookingPayload
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
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message =
          errorBody?.message ||
          `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error booking mentor session for ${mentorId}:`, error);
      throw error;
    }
  }

  /**
   * Fallback method using mock data for development/testing
   */
  getMockMentors(): Mentor[] {
    return [
      {
        id: "1",
        name: "Sarah Chen",
        title: "Senior Software Engineer",
        company: "Google",
        expertise: [
          "Software Engineering",
          "AI/Machine Learning",
          "Career Transition",
        ],
        experience: "Senior (8-12 years)",
        rating: 4.9,
        reviewCount: 127,
        availability: "Available",
        location: "San Francisco, CA",
        languages: ["English", "Mandarin"],
        bio: "Passionate about helping engineers transition into senior roles and develop leadership skills.",
        achievements: [
          "Led team of 15 engineers",
          "Built ML systems serving 1B+ users",
          "Published 12 papers",
        ],
        image:
          "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400",
        industry: "Technology",
        unavailableDateTime: {
          "2024-12-25": "full-day", // Christmas - completely unavailable
          "2024-12-31": "full-day", // New Year's Eve - completely unavailable
          "2025-01-01": "full-day", // New Year's Day - completely unavailable
          "2024-11-15": ["10:00", "14:00"], // Specific times unavailable
          "2024-11-16": ["09:00", "15:00"], // Specific times unavailable
          "2024-11-20": ["11:00", "16:00"], // Specific times unavailable
        },
        workingHours: {
          start: "09:00",
          end: "17:00",
          timezone: "PST",
        },
        workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      },
      {
        id: "2",
        name: "Marcus Johnson",
        title: "VP of Product",
        company: "Stripe",
        expertise: [
          "Product Management",
          "Entrepreneurship",
          "Leadership Growth",
        ],
        experience: "Executive (13+ years)",
        rating: 4.8,
        reviewCount: 89,
        availability: "Limited",
        location: "Remote",
        languages: ["English", "Spanish"],
        bio: "Expert in product strategy and building teams that ship world-class products.",
        achievements: [
          "Scaled product from 0 to $100M ARR",
          "Built products used by 50M+ users",
          "Ex-founder",
        ],
        image:
          "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
        industry: "Technology",
        unavailableDateTime: {
          "2025-11-28": "full-day", // Thanksgiving
          "2025-11-29": "full-day", // Black Friday
          "2025-12-20": "full-day", // Personal day
          "2025-12-25": "full-day", // Christmas
          "2025-12-31": "full-day", // New Year's Eve
          "2024-11-18": ["09:00", "10:00", "11:00"], // Morning blocked
          "2024-11-22": ["14:00", "15:00", "16:00", "17:00"], // Afternoon blocked
          "2024-11-25": ["13:00", "14:00"], // Lunch meetings
        },
        workingHours: {
          start: "10:00",
          end: "18:00",
          timezone: "EST",
        },
        workingDays: [1, 2, 3, 4], // Monday to Thursday (limited availability)
      },
      {
        id: "3",
        name: "Emily Rodriguez",
        title: "Data Science Director",
        company: "Netflix",
        expertise: ["Data Science", "AI/Machine Learning", "Technical Skills"],
        experience: "Senior (8-12 years)",
        rating: 5.0,
        reviewCount: 156,
        availability: "Available",
        location: "Los Angeles, CA",
        languages: ["English", "Spanish", "Portuguese"],
        bio: "Helping data professionals advance their careers and master advanced analytics.",
        achievements: [
          "Built recommendation algorithms",
          "PhD in Computer Science",
          "TEDx speaker",
        ],
        image:
          "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
        industry: "Technology",
        unavailableDateTime: {
          "2024-12-23": "full-day", // Holiday break
          "2024-12-24": "full-day", // Christmas Eve
          "2024-12-25": "full-day", // Christmas
          "2024-11-14": ["12:00", "13:00"], // Lunch break
          "2024-11-21": ["10:00", "11:00"], // Team meetings
          "2024-11-27": ["15:00", "16:00", "17:00"], // Conference calls
        },
        workingHours: {
          start: "08:00",
          end: "16:00",
          timezone: "PST",
        },
        workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      },
      {
        id: "4",
        name: "David Kim",
        title: "Design Lead",
        company: "Apple",
        expertise: ["UX/UI Design", "Product Management", "Creative Direction"],
        experience: "Senior (8-12 years)",
        rating: 4.9,
        reviewCount: 203,
        availability: "Available",
        location: "Cupertino, CA",
        languages: ["English", "Korean"],
        bio: "Award-winning designer passionate about creating intuitive user experiences.",
        achievements: [
          "Led design for iOS features",
          "Design awards winner",
          "Design thinking workshops",
        ],
        image:
          "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400",
        industry: "Technology",
        unavailableDateTime: {
          "2024-12-25": "full-day", // Christmas
          "2024-12-26": "full-day", // Boxing Day
          "2025-01-01": "full-day", // New Year's Day
          "2025-01-02": "full-day", // Extended holiday
          "2024-11-19": ["09:00", "10:00"], // Design review meetings
          "2024-11-26": ["14:00", "15:00"], // Client presentations
          "2024-12-03": ["11:00", "12:00"], // Team sync
        },
        workingHours: {
          start: "09:00",
          end: "18:00",
          timezone: "PST",
        },
        workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      },
      {
        id: "5",
        name: "Jennifer Walsh",
        title: "Marketing Director",
        company: "HubSpot",
        expertise: ["Marketing", "Sales", "Leadership Growth"],
        experience: "Senior (8-12 years)",
        rating: 4.7,
        reviewCount: 94,
        availability: "Available",
        location: "Boston, MA",
        languages: ["English", "French"],
        bio: "Expert in growth marketing and building high-performing marketing teams.",
        achievements: [
          "Grew user base by 300%",
          "Built $50M+ pipeline",
          "Marketing awards",
        ],
        image:
          "https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400",
        industry: "Technology",
        unavailableDateTime: {
          "2024-11-28": "full-day", // Thanksgiving
          "2024-11-29": "full-day", // Black Friday
          "2024-12-25": "full-day", // Christmas
          "2024-11-15": ["13:00", "14:00", "15:00"], // Marketing strategy meetings
          "2024-11-22": ["10:00", "11:00"], // Campaign reviews
          "2024-11-27": ["16:00", "17:00"], // End of month reporting
        },
        workingHours: {
          start: "09:00",
          end: "17:30",
          timezone: "EST",
        },
        workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      },
      {
        id: "6",
        name: "Alex Thompson",
        title: "Startup Founder & CEO",
        company: "CloudTech (Acquired)",
        expertise: ["Entrepreneurship", "Leadership Growth", "Sales"],
        experience: "Executive (13+ years)",
        rating: 4.8,
        reviewCount: 178,
        availability: "Limited",
        location: "Austin, TX",
        languages: ["English"],
        bio: "Serial entrepreneur with 2 successful exits. Love helping first-time founders.",
        achievements: [
          "2 successful exits",
          "Raised $50M+ funding",
          "Forbes 30 under 30",
        ],
        image:
          "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400",
        industry: "Technology",
        unavailableDateTime: {
          "2024-11-25": "full-day", // Travel day
          "2024-11-26": "full-day", // Conference
          "2024-11-27": "full-day", // Conference
          "2024-12-25": "full-day", // Christmas
          "2024-12-31": "full-day", // New Year's Eve
          "2025-11-14": ["09:00", "10:00", "11:00", "14:00", "15:00"], // Board meetings and investor calls
          "2024-11-21": ["13:00", "14:00", "15:00", "16:00"], // Due diligence meetings
          "2024-12-05": ["10:00", "11:00"], // Strategic planning
        },
        workingHours: {
          start: "10:00",
          end: "16:00", // Limited hours as an executive
          timezone: "CST",
        },
        workingDays: [2, 4], // Tuesday and Thursday only (very limited)
      },
    ];
  }

  /**
   * Fallback method that simulates API behavior with mock data
   * Useful for development when backend is not available
   */
  async fetchMentorsWithFallback(
    filters: MentorFilters = {},
    menteeProfile?: Mentee
  ): Promise<MentorResponse> {
    return this.fetchMentors(filters, menteeProfile);
  }
}

// Export a singleton instance
export const mentorService = new MentorService();

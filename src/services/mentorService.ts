import type { Mentor } from "../App";

export interface MentorFilters {
  search?: string;
  expertise?: string[];
  experience?: string[];
  availability?: string[];
  interests?: string[]; // For personalized recommendations
}

export interface MentorResponse {
  mentors: Mentor[];
  total: number;
  recommended?: Mentor[];
}

class MentorService {
  private baseURL: string;

  constructor() {
    // Use environment variable or default to localhost for development
    this.baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
  }

  /**
   * Fetch mentors from the backend API
   * @param filters - Optional filters to apply
   * @returns Promise containing mentors and metadata
   */
  async fetchMentors(filters: MentorFilters = {}): Promise<MentorResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      if (filters.search) {
        queryParams.append("search", filters.search);
      }

      if (filters.expertise && filters.expertise.length > 0) {
        queryParams.append("expertise", filters.expertise.join(","));
      }

      if (filters.experience && filters.experience.length > 0) {
        queryParams.append("experience", filters.experience.join(","));
      }

      if (filters.availability && filters.availability.length > 0) {
        queryParams.append("availability", filters.availability.join(","));
      }

      if (filters.interests && filters.interests.length > 0) {
        queryParams.append("interests", filters.interests.join(","));
      }

      const url = `${this.baseURL}/mentors${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
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
    filters: MentorFilters = {}
  ): Promise<MentorResponse> {
    try {
      return await this.fetchMentors(filters);
    } catch (error) {
      console.warn("API call failed, using mock data:", error);

      // Filter mock data client-side to simulate API behavior
      const mockMentors = this.getMockMentors();
      const filteredMentors = this.filterMentorsClientSide(
        mockMentors,
        filters
      );

      return {
        mentors: filteredMentors,
        total: filteredMentors.length,
      };
    }
  }

  /**
   * Client-side filtering for mock data (simulates backend filtering)
   */
  private filterMentorsClientSide(
    mentors: Mentor[],
    filters: MentorFilters
  ): Mentor[] {
    return mentors.filter((mentor) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          mentor.name.toLowerCase().includes(searchTerm) ||
          mentor.title.toLowerCase().includes(searchTerm) ||
          mentor.company.toLowerCase().includes(searchTerm) ||
          mentor.expertise.some((exp) =>
            exp.toLowerCase().includes(searchTerm)
          );

        if (!matchesSearch) return false;
      }

      // Expertise filter
      if (filters.expertise && filters.expertise.length > 0) {
        const matchesExpertise = filters.expertise.some((exp) =>
          mentor.expertise.includes(exp)
        );
        if (!matchesExpertise) return false;
      }

      // Experience filter
      if (filters.experience && filters.experience.length > 0) {
        if (!filters.experience.includes(mentor.experience)) return false;
      }

      // Availability filter
      if (filters.availability && filters.availability.length > 0) {
        if (!filters.availability.includes(mentor.availability)) return false;
      }

      return true;
    });
  }
}

// Export a singleton instance
export const mentorService = new MentorService();

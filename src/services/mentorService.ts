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

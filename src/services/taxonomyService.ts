export interface TaxonomyOption {
  id: number;
  name: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://try-your-mentor-bff.onrender.com";

const requestOptions = async (
  path: string,
  fallback: TaxonomyOption[]
): Promise<TaxonomyOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) return fallback;

    return data
      .map((item) => ({
        id: Number(item.id),
        name: String(item.name ?? item.label ?? "").trim(),
      }))
      .filter((item) => Number.isFinite(item.id) && item.name);
  } catch (error) {
    console.warn(`Using local taxonomy fallback for ${path}`, error);
    return fallback;
  }
};

const industryFallback: TaxonomyOption[] = [
  { id: 1, name: "Software Engineering" },
  { id: 2, name: "Quality Engineering" },
  { id: 3, name: "Business Analysis" },
];

const qualificationFallback: TaxonomyOption[] = [
  { id: 1, name: "BSc. in Engineering" },
  { id: 2, name: "Master's" },
  { id: 3, name: "Bachelor's Degree" },
  { id: 4, name: "Master's Degree" },
  { id: 5, name: "Other" },
];

const goalFallback: TaxonomyOption[] = [
  { id: 1, name: "Find a job" },
  { id: 2, name: "Technical Skills Improvement" },
  { id: 3, name: "Soft Skills Development" },
  { id: 4, name: "Interview Preparation" },
  { id: 5, name: "Communication Skills" },
  { id: 6, name: "Career Transition" },
  { id: 7, name: "Leadership Growth" },
  { id: 8, name: "Job Search Strategy" },
  { id: 9, name: "Industry Knowledge" },
  { id: 10, name: "Meet Industry Experts" },
  { id: 11, name: "Project Management" },
];

const jobRoleFallback: Record<number, TaxonomyOption[]> = {
  1: [
    { id: 1, name: "Intern Software Engineer" },
    { id: 11, name: "Associate Software Engineer" },
    { id: 12, name: "Software Engineer" },
    { id: 13, name: "Senior Software Engineer" },
    { id: 14, name: "Associate Technical Lead" },
    { id: 15, name: "Technical Lead" },
    { id: 16, name: "Senior Technical Lead" },
    { id: 17, name: "Software Architect" },
  ],
  2: [
    { id: 18, name: "Quality Engineer" },
    { id: 19, name: "Senior Quality Engineer" },
    { id: 20, name: "Associate Quality Engineering Lead" },
    { id: 21, name: "Quality Engineering Lead" },
    { id: 22, name: "Senior Quality Engineering Lead" },
  ],
  3: [
    { id: 23, name: "Business Analyst Intern" },
    { id: 24, name: "Junior Business Analyst" },
    { id: 25, name: "Business Analyst" },
    { id: 26, name: "Senior Business Analyst" },
    { id: 27, name: "Lead Business Analyst" },
  ],
};

export const taxonomyService = {
  getIndustries: () => requestOptions("/industries", industryFallback),
  getQualifications: () =>
    requestOptions("/qualifications", qualificationFallback),
  getGoals: (industryId: number) =>
    requestOptions(`/goals?industryId=${industryId}`, goalFallback),
  getJobRoles: (industryId: number) =>
    requestOptions(
      `/job-roles?industryId=${industryId}`,
      jobRoleFallback[industryId] ?? []
    ),
};

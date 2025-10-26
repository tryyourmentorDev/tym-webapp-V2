import React, { useState } from "react";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { Mentee, Mentor } from "../App";
import { useMentors } from "../hooks/useMentors";

interface MentorDiscoveryProps {
  menteeProfile: Mentee;
  onMentorSelect: (mentor: Mentor, similarMentors: Mentor[]) => void;
  onBackToHome: () => void;
}

export const MentorDiscovery: React.FC<MentorDiscoveryProps> = ({
  menteeProfile,
  onMentorSelect,
  onBackToHome,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(
    []
  );
  const [showFilters, setShowFilters] = useState(false);

  // Use the custom hook to fetch mentors
  const {
    mentors: filteredMentors,
    recommendedMentors,
    otherMentors,
    isLoading,
    error,
    refetch,
    expertiseOptions,
    experienceOptions,
    availabilityOptions,
  } = useMentors({
    menteeProfile,
    searchTerm,
    selectedExpertise,
    selectedExperience,
    selectedAvailability,
  });

  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedExpertise([]);
    setSelectedExperience([]);
    setSelectedAvailability([]);
    setSearchTerm("");
  };

  const activeFiltersCount =
    selectedExpertise.length +
    selectedExperience.length +
    selectedAvailability.length;

  const handleMentorSelect = (mentor: Mentor) => {
    const similarMentors = filteredMentors.filter(
      (mentorItem) => mentorItem.id !== mentor.id
    );
    onMentorSelect(mentor, similarMentors);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Try Your Mentor
              </span>
            </button>
            <div className="text-sm text-gray-600">
              {filteredMentors.length} mentor
              {filteredMentors.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Mentor
          </h1>
          <p className="text-gray-600">
            Based on your interests: {menteeProfile.interests.join(", ")}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search mentors by name, company, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 ml-2 transform transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Expertise Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Expertise
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {expertiseOptions.map((expertise) => (
                      <label key={expertise} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedExpertise.includes(expertise)}
                          onChange={() =>
                            toggleFilter(
                              expertise,
                              selectedExpertise,
                              setSelectedExpertise
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {expertise}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Experience Level
                  </label>
                  <div className="space-y-2">
                    {experienceOptions.map((experience) => (
                      <label key={experience} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedExperience.includes(experience)}
                          onChange={() =>
                            toggleFilter(
                              experience,
                              selectedExperience,
                              setSelectedExperience
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {experience}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Availability
                  </label>
                  <div className="space-y-2">
                    {availabilityOptions.map((availability) => (
                      <label key={availability} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAvailability.includes(availability)}
                          onChange={() =>
                            toggleFilter(
                              availability,
                              selectedAvailability,
                              setSelectedAvailability
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {availability}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-8">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Finding mentors...
              </h3>
              <p className="text-gray-600">
                Please wait while we search for the perfect mentors for you
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600 mb-4">
                {error || "Failed to fetch mentors. Please try again."}
              </p>
              <button
                onClick={refetch}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          )}

          {/* Success State - Show Results */}
          {!isLoading && !error && (
            <>
              {/* Recommended Mentors */}
              {recommendedMentors.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Recommended for You
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {recommendedMentors.length}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedMentors.map((mentor) => (
                      <MentorCard
                        key={mentor.id}
                        mentor={mentor}
                        onSelect={handleMentorSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Mentors */}
              {otherMentors.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Other Mentors
                    <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                      {otherMentors.length}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherMentors.map((mentor) => (
                      <MentorCard
                        key={mentor.id}
                        mentor={mentor}
                        onSelect={handleMentorSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {filteredMentors.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No mentors found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MentorCard: React.FC<{
  mentor: Mentor;
  onSelect: (mentor: Mentor) => void;
}> = ({ mentor, onSelect }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(mentor)}
    >
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={mentor.image}
          alt={mentor.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {mentor.name}
          </h3>
          <p className="text-gray-600 text-sm truncate">{mentor.title}</p>
          <p className="text-gray-500 text-sm truncate">{mentor.company}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-400 mr-1" />
          <span>{mentor.rating}</span>
          <span className="ml-1">({mentor.reviewCount})</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span
            className={
              mentor.availability === "Available"
                ? "text-green-600"
                : "text-orange-600"
            }
          >
            {mentor.availability}
          </span>
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-600 mb-4">
        <MapPin className="w-4 h-4 mr-1" />
        <span>{mentor.location}</span>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{mentor.bio}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {mentor.expertise.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
          >
            {skill}
          </span>
        ))}
        {mentor.expertise.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            +{mentor.expertise.length - 3} more
          </span>
        )}
      </div>

      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        View Profile
      </button>
    </div>
  );
};

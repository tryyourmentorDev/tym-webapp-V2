import React, { useState, useMemo } from 'react';
import { Search, Filter, Star, MapPin, Clock, Globe, ChevronDown } from 'lucide-react';
import type { Mentee, Mentor } from '../App';

interface MentorDiscoveryProps {
  menteeProfile: Mentee;
  onMentorSelect: (mentor: Mentor) => void;
}

// Mock mentor data
const mockMentors: Mentor[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Senior Software Engineer',
    company: 'Google',
    expertise: ['Software Engineering', 'AI/Machine Learning', 'Career Transition'],
    experience: 'Senior (8-12 years)',
    rating: 4.9,
    reviewCount: 127,
    availability: 'Available',
    location: 'San Francisco, CA',
    languages: ['English', 'Mandarin'],
    bio: 'Passionate about helping engineers transition into senior roles and develop leadership skills.',
    achievements: ['Led team of 15 engineers', 'Built ML systems serving 1B+ users', 'Published 12 papers'],
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
    industry: 'Technology'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    title: 'VP of Product',
    company: 'Stripe',
    expertise: ['Product Management', 'Entrepreneurship', 'Leadership Growth'],
    experience: 'Executive (13+ years)',
    rating: 4.8,
    reviewCount: 89,
    availability: 'Limited',
    location: 'Remote',
    languages: ['English', 'Spanish'],
    bio: 'Expert in product strategy and building teams that ship world-class products.',
    achievements: ['Scaled product from 0 to $100M ARR', 'Built products used by 50M+ users', 'Ex-founder'],
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    industry: 'Technology'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    title: 'Data Science Director',
    company: 'Netflix',
    expertise: ['Data Science', 'AI/Machine Learning', 'Technical Skills'],
    experience: 'Senior (8-12 years)',
    rating: 5.0,
    reviewCount: 156,
    availability: 'Available',
    location: 'Los Angeles, CA',
    languages: ['English', 'Spanish', 'Portuguese'],
    bio: 'Helping data professionals advance their careers and master advanced analytics.',
    achievements: ['Built recommendation algorithms', 'PhD in Computer Science', 'TEDx speaker'],
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    industry: 'Technology'
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'Design Lead',
    company: 'Apple',
    expertise: ['UX/UI Design', 'Product Management', 'Creative Direction'],
    experience: 'Senior (8-12 years)',
    rating: 4.9,
    reviewCount: 203,
    availability: 'Available',
    location: 'Cupertino, CA',
    languages: ['English', 'Korean'],
    bio: 'Award-winning designer passionate about creating intuitive user experiences.',
    achievements: ['Led design for iOS features', 'Design awards winner', 'Design thinking workshops'],
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    industry: 'Technology'
  },
  {
    id: '5',
    name: 'Jennifer Walsh',
    title: 'Marketing Director',
    company: 'HubSpot',
    expertise: ['Marketing', 'Sales', 'Leadership Growth'],
    experience: 'Senior (8-12 years)',
    rating: 4.7,
    reviewCount: 94,
    availability: 'Available',
    location: 'Boston, MA',
    languages: ['English', 'French'],
    bio: 'Expert in growth marketing and building high-performing marketing teams.',
    achievements: ['Grew user base by 300%', 'Built $50M+ pipeline', 'Marketing awards'],
    image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=400',
    industry: 'Technology'
  },
  {
    id: '6',
    name: 'Alex Thompson',
    title: 'Startup Founder & CEO',
    company: 'CloudTech (Acquired)',
    expertise: ['Entrepreneurship', 'Leadership Growth', 'Sales'],
    experience: 'Executive (13+ years)',
    rating: 4.8,
    reviewCount: 178,
    availability: 'Limited',
    location: 'Austin, TX',
    languages: ['English'],
    bio: 'Serial entrepreneur with 2 successful exits. Love helping first-time founders.',
    achievements: ['2 successful exits', 'Raised $50M+ funding', 'Forbes 30 under 30'],
    image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    industry: 'Technology'
  }
];

export const MentorDiscovery: React.FC<MentorDiscoveryProps> = ({ 
  menteeProfile, 
  onMentorSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const expertiseOptions = Array.from(new Set(mockMentors.flatMap(m => m.expertise)));
  const experienceOptions = Array.from(new Set(mockMentors.map(m => m.experience)));
  const availabilityOptions = Array.from(new Set(mockMentors.map(m => m.availability)));

  const filteredMentors = useMemo(() => {
    return mockMentors.filter(mentor => {
      const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesExpertise = selectedExpertise.length === 0 || 
                              selectedExpertise.some(exp => mentor.expertise.includes(exp));

      const matchesExperience = selectedExperience.length === 0 || 
                               selectedExperience.includes(mentor.experience);

      const matchesAvailability = selectedAvailability.length === 0 || 
                                 selectedAvailability.includes(mentor.availability);

      return matchesSearch && matchesExpertise && matchesExperience && matchesAvailability;
    });
  }, [searchTerm, selectedExpertise, selectedExperience, selectedAvailability]);

  const recommendedMentors = useMemo(() => {
    return filteredMentors.filter(mentor => 
      mentor.expertise.some(exp => menteeProfile.interests.includes(exp))
    );
  }, [filteredMentors, menteeProfile.interests]);

  const otherMentors = useMemo(() => {
    return filteredMentors.filter(mentor => 
      !mentor.expertise.some(exp => menteeProfile.interests.includes(exp))
    );
  }, [filteredMentors, menteeProfile.interests]);

  const toggleFilter = (value: string, selected: string[], setSelected: (values: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(item => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedExpertise([]);
    setSelectedExperience([]);
    setSelectedAvailability([]);
    setSearchTerm('');
  };

  const activeFiltersCount = selectedExpertise.length + selectedExperience.length + selectedAvailability.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MentorConnect</span>
            </div>
            <div className="text-sm text-gray-600">
              {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
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
            Based on your interests: {menteeProfile.interests.join(', ')}
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
              <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Expertise Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Expertise</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {expertiseOptions.map(expertise => (
                      <label key={expertise} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedExpertise.includes(expertise)}
                          onChange={() => toggleFilter(expertise, selectedExpertise, setSelectedExpertise)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{expertise}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Experience Level</label>
                  <div className="space-y-2">
                    {experienceOptions.map(experience => (
                      <label key={experience} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedExperience.includes(experience)}
                          onChange={() => toggleFilter(experience, selectedExperience, setSelectedExperience)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{experience}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Availability</label>
                  <div className="space-y-2">
                    {availabilityOptions.map(availability => (
                      <label key={availability} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAvailability.includes(availability)}
                          onChange={() => toggleFilter(availability, selectedAvailability, setSelectedAvailability)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{availability}</span>
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
                {recommendedMentors.map(mentor => (
                  <MentorCard key={mentor.id} mentor={mentor} onSelect={onMentorSelect} />
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
                {otherMentors.map(mentor => (
                  <MentorCard key={mentor.id} mentor={mentor} onSelect={onMentorSelect} />
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MentorCard: React.FC<{ mentor: Mentor; onSelect: (mentor: Mentor) => void }> = ({ 
  mentor, 
  onSelect 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => onSelect(mentor)}>
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={mentor.image}
          alt={mentor.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{mentor.name}</h3>
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
          <span className={mentor.availability === 'Available' ? 'text-green-600' : 'text-orange-600'}>
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
        {mentor.expertise.slice(0, 3).map(skill => (
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
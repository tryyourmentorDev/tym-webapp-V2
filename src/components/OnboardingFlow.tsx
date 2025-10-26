import React, { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import type { Mentee } from "../App";

interface OnboardingFlowProps {
  onComplete: (profile: Mentee) => void;
  onBackToHome: () => void;
}

interface RankedOption {
  id: number;
  label: string;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onBackToHome,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Mentee>>({
    interests: [],
    goals: [],
    experienceLevel: "",
    educationLevel: "",
    jobRole: "",
    industryId: undefined,
    educationLevelId: undefined,
    jobRoleId: undefined,
  });

  const industryOptions: RankedOption[] = [
    { id: 1, label: "Software Engineering" },
    { id: 2, label: "Quality Engineering" },
    { id: 3, label: "Business Analysis" },
  ];

  const goalOptions = [
    "Find a job",
    "Technical Skills Improvement",
    "Soft Skills Development",
    "Interview Preparation",
    "Communication Skills",
    "Career Transition",
    "Leadership Growth",
    "Job Search Strategy",
    "Industry Knowledge",
    "Meet Industry Experts",
    "Project Management",
    "Other",
  ];

  const experienceLevels = [
    "Student/Entry Level",
    "Junior (1-2 years)",
    "Mid-level (3-5 years)",
    "Senior (6-8 years)",
    "Mid Senior (8-10 years)",
    "Executive (11+ years)",
  ];

  const educationLevels: RankedOption[] = [
    { id: 1, label: "High School" },
    { id: 2, label: "Diploma" },
    { id: 3, label: "Bachelor's Degree" },
    { id: 4, label: "Master's Degree" },
    { id: 5, label: "Other" },
  ];

  // Job roles mapping based on selected industry
  const jobRolesMapping: Record<number, RankedOption[]> = {
    1: [
      { id: 1, label: "Intern Software Engineer" },
      { id: 11, label: "Associate Software Engineer" },
      { id: 12, label: "Software Engineer" },
      { id: 13, label: "Senior Software Engineer" },
      { id: 14, label: "Associate Technical Lead" },
      { id: 15, label: "Technical Lead" },
      { id: 16, label: "Senior Technical Lead" },
      { id: 17, label: "Software Architect" },
    ],
    2: [
      { id: 9, label: "Intern Quality Engineer" },
      { id: 10, label: "Associate Quality Engineer" },
      { id: 11, label: "Quality Engineer" },
      { id: 12, label: "Senior Quality Engineer" },
      { id: 13, label: "Quality Lead" },
      { id: 14, label: "Senior Quality Lead" },
      { id: 15, label: "Software Architect" },
    ],
    3: [
      { id: 16, label: "Business Analyst Intern" },
      { id: 17, label: "Junior Business Analyst" },
      { id: 18, label: "Business Analyst" },
      { id: 19, label: "Senior Business Analyst" },
      { id: 20, label: "Lead Business Analyst" },
    ],
  };

  // Get job roles for selected industry
  const getJobRolesForIndustry = (): RankedOption[] => {
    const selectedIndustryId = formData.industryId;
    return selectedIndustryId ? jobRolesMapping[selectedIndustryId] || [] : [];
  };

  const handleInterestSelect = (industry: RankedOption) => {
    setFormData({
      ...formData,
      interests: [industry.label],
      industryId: industry.id,
      jobRole: "",
      jobRoleId: undefined,
    });
  };

  const handleGoalToggle = (goal: string) => {
    const current = formData.goals || [];
    const updated = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal];
    setFormData({ ...formData, goals: updated });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.industryId !== undefined;
      case 2:
        return (formData.goals?.length || 0) >= 1;
      case 3:
        return (
          formData.experienceLevel &&
          formData.educationLevel &&
          formData.educationLevelId !== undefined &&
          formData.industryId !== undefined &&
          formData.jobRole &&
          formData.jobRoleId !== undefined
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData as Mentee);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Try Your Mentor
            </span>
          </button>
          <div className="text-sm text-gray-600">Step {currentStep} of 3</div>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Progress
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round((currentStep / 3) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Expertise Interests */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What areas of expertise are you interested in?
              </h2>
              <p className="text-gray-600 mb-8">
                Select the field where you'd like to learn and grow the most.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {industryOptions.map((industry) => {
                  const isSelected = formData.industryId === industry.id;
                  return (
                    <button
                      key={industry.id}
                      onClick={() => handleInterestSelect(industry)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md transform scale-105"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="font-medium">{industry.label}</span>
                    </button>
                  );
                })}
              </div>

              {(formData.interests?.length || 0) > 0 && (
                <div className="mt-6 text-sm text-gray-600">
                  Selected: {formData.interests?.[0]}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What are your main goals?
              </h2>
              <p className="text-gray-600 mb-8">
                Help us understand what you want to achieve through mentorship.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {goalOptions.map((goal) => {
                  const isSelected = formData.goals?.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => handleGoalToggle(goal)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-md transform scale-105"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="font-medium">{goal}</span>
                    </button>
                  );
                })}
              </div>

              {(formData.goals?.length || 0) > 0 && (
                <div className="mt-6 text-sm text-gray-600">
                  Selected {formData.goals?.length} goal
                  {(formData.goals?.length || 0) > 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Education & Experience */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tell us about yourself
              </h2>
              <p className="text-gray-600 mb-8">
                This helps us match you with mentors who understand your
                background.
              </p>

              <div className="space-y-8">
                {/* Education Level */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    What is your highest education level?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {educationLevels.map((education) => (
                      <button
                        key={education.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            educationLevel: education.label,
                            educationLevelId: education.id,
                          })
                        }
                        className={`p-4 rounded-xl text-left transition-all ${
                          formData.educationLevelId === education.id
                            ? "bg-purple-600 text-white shadow-md"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="font-medium">{education.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    What's your experience level?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {experienceLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          setFormData({ ...formData, experienceLevel: level })
                        }
                        className={`p-4 rounded-xl text-left transition-all ${
                          formData.experienceLevel === level
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="font-medium">{level}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job Roles - Only show if expertise is selected */}
                {formData.interests && formData.interests.length > 0 && (
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      What is your current or target job role?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {getJobRolesForIndustry().map((role) => (
                        <button
                          key={role.id}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              jobRole: role.label,
                              jobRoleId: role.id,
                            })
                          }
                          className={`p-4 rounded-xl text-left transition-all ${
                            formData.jobRoleId === role.id
                              ? "bg-indigo-600 text-white shadow-md"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="font-medium">{role.label}</span>
                        </button>
                      ))}
                    </div>
                    {getJobRolesForIndustry().length === 0 && (
                      <p className="text-gray-500 text-sm">
                        Please select an industry first to see available job
                        roles.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all ${
                canProceed()
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {currentStep === 3 ? "Find Mentors" : "Next"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

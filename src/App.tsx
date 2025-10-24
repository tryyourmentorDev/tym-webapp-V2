import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { MentorDiscovery } from "./components/MentorDiscovery";
import { MentorProfile } from "./components/MentorProfile";

export interface Mentee {
  interests: string[];
  goals: string[];
  experienceLevel: string;
  educationLevel: string;
  jobRole: string;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  experience: string;
  rating: number;
  reviewCount: number;
  availability: string;
  location: string;
  languages: string[];
  bio: string;
  achievements: string[];
  image: string;
  industry: string;
}

type AppStep = "landing" | "onboarding" | "discovery" | "profile";

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>("landing");
  const [menteeProfile, setMenteeProfile] = useState<Mentee | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const handleGetStarted = () => {
    setCurrentStep("onboarding");
  };

  const handleOnboardingComplete = (profile: Mentee) => {
    setMenteeProfile(profile);
    setCurrentStep("discovery");
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setCurrentStep("profile");
  };

  const handleBackToDiscovery = () => {
    setCurrentStep("discovery");
    setSelectedMentor(null);
  };

  const handleBackToHome = () => {
    setCurrentStep("landing");
    setMenteeProfile(null);
    setSelectedMentor(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "landing" && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}

      {currentStep === "onboarding" && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onBackToHome={handleBackToHome}
        />
      )}

      {currentStep === "discovery" && menteeProfile && (
        <MentorDiscovery
          menteeProfile={menteeProfile}
          onMentorSelect={handleMentorSelect}
          onBackToHome={handleBackToHome}
        />
      )}

      {currentStep === "profile" && selectedMentor && (
        <MentorProfile
          mentor={selectedMentor}
          onBack={handleBackToDiscovery}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;

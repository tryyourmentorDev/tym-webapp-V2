import { useState, useEffect } from "react";
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
  industryId: number;
  educationLevelId: number;
  jobRoleId: number;
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
  // Availability scheduling
  unavailableDateTime?: {
    [date: string]: string[] | "full-day"; // "full-day" for entire day unavailable, or array of unavailable time slots
  };
  workingHours?: {
    start: string; // "09:00"
    end: string; // "18:00"
    timezone?: string; // "UTC", "EST", etc.
  };
  workingDays?: number[]; // Array of days (0=Sunday, 1=Monday, etc.) when mentor is available
}

type AppStep = "landing" | "onboarding" | "discovery" | "profile";

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>("landing");
  const [menteeProfile, setMenteeProfile] = useState<Mentee | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [similarMentors, setSimilarMentors] = useState<Mentor[]>([]);

  // Initialize from URL on page load
  useEffect(() => {
    const path = window.location.pathname;
    let initialStep: AppStep = "landing";

    if (path === "/onboarding") {
      initialStep = "onboarding";
    } else if (path === "/discovery") {
      // Only allow direct access to discovery if we have mentee data in sessionStorage
      const savedProfile = sessionStorage.getItem("menteeProfile");
      if (savedProfile) {
        try {
          setMenteeProfile(JSON.parse(savedProfile));
          initialStep = "discovery";
        } catch {
          initialStep = "landing";
        }
      } else {
        initialStep = "landing";
      }
    } else if (path === "/profile") {
      // Only allow direct access to profile if we have both mentee and mentor data
      const savedProfile = sessionStorage.getItem("menteeProfile");
      const savedMentor = sessionStorage.getItem("selectedMentor");
      const savedSimilar = sessionStorage.getItem("similarMentors");
      if (savedProfile && savedMentor) {
        try {
          setMenteeProfile(JSON.parse(savedProfile));
          setSelectedMentor(JSON.parse(savedMentor));
          setSimilarMentors(
            savedSimilar ? JSON.parse(savedSimilar) : []
          );
          initialStep = "profile";
        } catch {
          initialStep = "landing";
        }
      } else {
        initialStep = "landing";
      }
    }

    setCurrentStep(initialStep);
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.step) {
        // Validate if we can navigate to the requested step
        if (state.step === "discovery" && !menteeProfile) {
          // Can't go to discovery without completing onboarding
          setCurrentStep("onboarding");
          return;
        }
        if (state.step === "profile" && (!menteeProfile || !selectedMentor)) {
          // Can't go to profile without mentor selection
          if (menteeProfile) {
            setCurrentStep("discovery");
          } else {
            setCurrentStep("onboarding");
          }
          return;
        }

        setCurrentStep(state.step);
        if (state.step === "landing") {
          setMenteeProfile(null);
          setSelectedMentor(null);
          setSimilarMentors([]);
        } else if (state.step === "discovery") {
          setSelectedMentor(null);
          setSimilarMentors([]);
        } else if (state.step === "profile") {
          const savedSimilar = sessionStorage.getItem("similarMentors");
          setSimilarMentors(savedSimilar ? JSON.parse(savedSimilar) : []);
        }
      } else {
        // No state, go to landing
        setCurrentStep("landing");
        setMenteeProfile(null);
        setSelectedMentor(null);
        setSimilarMentors([]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [menteeProfile, selectedMentor]);

  // Warn user before leaving if they're in the middle of onboarding
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (currentStep === "onboarding") {
        event.preventDefault();
        event.returnValue =
          "Are you sure you want to leave? Your progress will be lost.";
        return "Are you sure you want to leave? Your progress will be lost.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentStep]);

  // Update URL when step changes
  useEffect(() => {
    const paths = {
      landing: "/",
      onboarding: "/onboarding",
      discovery: "/discovery",
      profile: "/profile",
    };

    const newPath = paths[currentStep];
    const currentPath = window.location.pathname;

    if (newPath !== currentPath) {
      // Use replaceState for the initial load, pushState for subsequent navigations
      const isInitialLoad = !window.history.state;
      if (isInitialLoad) {
        window.history.replaceState({ step: currentStep }, "", newPath);
      } else {
        window.history.pushState({ step: currentStep }, "", newPath);
      }
    }
  }, [currentStep]);

  // Helper function to navigate with proper state management
  const navigateToStep = (step: AppStep, additionalState?: any) => {
    const paths = {
      landing: "/",
      onboarding: "/onboarding",
      discovery: "/discovery",
      profile: "/profile",
    };

    window.history.pushState({ step, ...additionalState }, "", paths[step]);
    setCurrentStep(step);
  };

  const handleGetStarted = () => {
    navigateToStep("onboarding");
  };

  const handleOnboardingComplete = (profile: Mentee) => {
    setMenteeProfile(profile);
    sessionStorage.setItem("menteeProfile", JSON.stringify(profile));
    navigateToStep("discovery");
  };

  const setProfileSelection = (mentor: Mentor, similar: Mentor[]) => {
    setSelectedMentor(mentor);
    setSimilarMentors(similar);
    sessionStorage.setItem("selectedMentor", JSON.stringify(mentor));
    sessionStorage.setItem("similarMentors", JSON.stringify(similar));
  };

  const handleMentorSelect = (mentor: Mentor, similar: Mentor[]) => {
    setProfileSelection(mentor, similar);
    navigateToStep("profile");
  };

  const handleSimilarMentorSelect = (mentor: Mentor) => {
    const allMentors = selectedMentor
      ? [selectedMentor, ...similarMentors]
      : similarMentors;
    const updatedSimilar = allMentors.filter((item) => item.id !== mentor.id);
    setProfileSelection(mentor, updatedSimilar);
  };

  const handleBackToDiscovery = () => {
    setSelectedMentor(null);
    setSimilarMentors([]);
    sessionStorage.removeItem("similarMentors");
    navigateToStep("discovery");
  };

  const handleBackToHome = () => {
    setMenteeProfile(null);
    setSelectedMentor(null);
    setSimilarMentors([]);
    sessionStorage.removeItem("menteeProfile");
    sessionStorage.removeItem("selectedMentor");
    sessionStorage.removeItem("similarMentors");
    navigateToStep("landing");
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
          similarMentors={similarMentors}
          onSimilarMentorSelect={handleSimilarMentorSelect}
          onBack={handleBackToDiscovery}
          onBackToHome={handleBackToHome}
          menteeProfile={menteeProfile}
        />
      )}
    </div>
  );
}

export default App;

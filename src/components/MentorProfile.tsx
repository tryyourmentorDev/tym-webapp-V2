import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Globe,
  MessageCircle,
  Calendar,
  Heart,
  Share,
  Loader2,
} from "lucide-react";
import type { Mentor, Mentee } from "../App";
import {
  mentorService,
  type MentorReview,
  type MentorUnavailableDateTime,
} from "../services/mentorService";

const defaultWorkingHours = {
  start: "09:00",
  end: "18:00",
  timezone: "UTC",
};

type BookingFormState = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  sessionExpectations: string;
  selectedDate: string;
  selectedTime: string;
  cv: File | null;
};

const createEmptyBookingForm = (): BookingFormState => ({
  firstName: "",
  lastName: "",
  email: "",
  city: "",
  sessionExpectations: "",
  selectedDate: "",
  selectedTime: "",
  cv: null,
});

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const extractExperienceYears = (experienceLevel?: string | null): number | null => {
  if (!experienceLevel) return null;
  const match = experienceLevel.match(/\d+/);
  if (!match) return null;
  const parsed = parseInt(match[0], 10);
  return Number.isNaN(parsed) ? null : parsed;
};

interface MentorProfileProps {
  mentor: Mentor;
  similarMentors: Mentor[];
  onSimilarMentorSelect: (mentor: Mentor) => void;
  onBack: () => void;
  onBackToHome: () => void;
  menteeProfile: Mentee | null;
}

export const MentorProfile: React.FC<MentorProfileProps> = ({
  mentor,
  similarMentors,
  onSimilarMentorSelect,
  onBack,
  onBackToHome,
  menteeProfile,
}) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormState>(() =>
    createEmptyBookingForm()
  );
  const [reviews, setReviews] = useState<MentorReview[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [workingHours, setWorkingHours] = useState(() => {
    if (mentor.workingHours?.start && mentor.workingHours?.end) {
      return {
        start: mentor.workingHours.start,
        end: mentor.workingHours.end,
        timezone: mentor.workingHours.timezone ?? defaultWorkingHours.timezone,
      };
    }
    return defaultWorkingHours;
  });
  const [workingDays, setWorkingDays] = useState<number[]>(
    mentor.workingDays && mentor.workingDays.length > 0
      ? mentor.workingDays
      : [1, 2, 3, 4, 5]
  );
  const [unavailableDateTime, setUnavailableDateTime] =
    useState<MentorUnavailableDateTime>(
      mentor.unavailableDateTime && typeof mentor.unavailableDateTime === "object"
        ? mentor.unavailableDateTime
        : {}
    );
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const resetBookingForm = () => {
    setBookingForm(createEmptyBookingForm());
    setFileInputKey((prev) => prev + 1);
  };

  const fetchAvailability = async () => {
    setAvailabilityError(null);
    setIsAvailabilityLoading(true);
    try {
      const availability = await mentorService.getMentorAvailability(mentor.id);
      setWorkingHours(
        availability.workingHours
          ? {
              start: availability.workingHours.start,
              end: availability.workingHours.end,
              timezone:
                availability.workingHours.timezone ??
                defaultWorkingHours.timezone,
            }
          : defaultWorkingHours
      );
      setWorkingDays(
        availability.workingDays.length > 0
          ? availability.workingDays
          : [1, 2, 3, 4, 5]
      );
      setUnavailableDateTime(availability.unavailableDateTime);
    } catch (error) {
      setAvailabilityError(
        error instanceof Error
          ? error.message
          : "Failed to load availability for this mentor."
      );
    } finally {
      setIsAvailabilityLoading(false);
    }
  };

  const handleSendMessage = () => {
    // In a real app, this would send the message
    alert(`Message sent to ${mentor.name}!`);
    setShowContactForm(false);
    setMessage("");
  };

  const handleBookingSubmit = async () => {
    // Validate required fields
    if (
      !bookingForm.firstName ||
      !bookingForm.lastName ||
      !bookingForm.email ||
      !bookingForm.city ||
      !bookingForm.selectedDate ||
      !bookingForm.selectedTime ||
      !bookingForm.cv
    ) {
      alert("Please fill in all required fields including uploading your CV");
      return;
    }

    setBookingError(null);
    setBookingSuccess(null);

    const cvFile = bookingForm.cv;
    if (!cvFile) {
      setBookingError("CV/Resume upload is required.");
      return;
    }

    setIsBookingLoading(true);
    try {
      const cvBase64 = await fileToBase64(cvFile);
      const timezone =
        workingHours.timezone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone ??
        defaultWorkingHours.timezone;
      const menteeDetails = menteeProfile
        ? {
            educationQualificationId: menteeProfile.educationLevelId ?? null,
            currentJobRoleId: menteeProfile.jobRoleId ?? null,
            expectedJobRoleId: menteeProfile.jobRoleId ?? null,
            experienceLevel: menteeProfile.experienceLevel ?? null,
            experienceYears: extractExperienceYears(
              menteeProfile.experienceLevel
            ),
            interests: menteeProfile.interests ?? [],
            goals: menteeProfile.goals ?? [],
            city: bookingForm.city.trim() || undefined,
          }
        : {
            city: bookingForm.city.trim() || undefined,
          };

      const payload = {
        user: {
          firstName: bookingForm.firstName.trim(),
          lastName: bookingForm.lastName.trim(),
          email: bookingForm.email.trim(),
        },
        mentee: menteeDetails,
        booking: {
          mentorId: mentor.id,
          date: bookingForm.selectedDate,
          time: bookingForm.selectedTime,
          timezone,
          city: bookingForm.city.trim(),
          sessionExpectations:
            bookingForm.sessionExpectations.trim() || undefined,
          cv: {
            fileName: cvFile.name,
            mimeType: cvFile.type,
            size: cvFile.size,
            base64: cvBase64,
          },
        },
      };

      const response = await mentorService.bookMentorSession(
        mentor.id,
        payload
      );

      setBookingSuccess(
        response.message ??
          "Session booked successfully! We'll reach out with next steps."
      );
      resetBookingForm();
      await fetchAvailability();
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Failed to book the session. Please try again."
      );
    } finally {
      setIsBookingLoading(false);
    }
  };

  const updateBookingForm = (field: string, value: string | File | null) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF, DOC, or DOCX file");
        event.target.value = ""; // Reset file input
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert("File size should be less than 5MB");
        event.target.value = ""; // Reset file input
        return;
      }

      updateBookingForm("cv", file);
    } else {
      updateBookingForm("cv", null);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const loadReviews = async () => {
      setIsReviewsLoading(true);
      setReviewsError(null);
      setReviews([]);
      try {
        const response = await mentorService.getMentorReviews(mentor.id);
        if (isSubscribed) {
          setReviews(response.reviews);
        }
      } catch (error) {
        if (isSubscribed) {
          setReviewsError(
            error instanceof Error
              ? error.message
              : "Failed to load mentor reviews"
          );
        }
      } finally {
        if (isSubscribed) {
          setIsReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      isSubscribed = false;
    };
  }, [mentor.id]);

  const getMinDate = (): string => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = (): string => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60); // Allow booking up to 60 days in advance
    return maxDate.toISOString().split("T")[0];
  };

  const isDateAvailable = (dateString: string): boolean => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();

    // Check if it's a working day for this mentor
    if (!workingDays.includes(dayOfWeek)) return false;

    // Check if the entire day is unavailable
    const dateAvailability = unavailableDateTime[dateString];
    if (dateAvailability === "full-day") return false;

    // Check if it's in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const generateTimeSlots = (): string[] => {
    const times = [];
    const startHour = parseInt(workingHours.start.split(":")[0]);
    const endHour = parseInt(workingHours.end.split(":")[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
    }

    return times;
  };

  const getAvailableTimes = (selectedDate: string): string[] => {
    if (
      !selectedDate ||
      !isDateAvailable(selectedDate) ||
      isAvailabilityLoading
    )
      return [];

    const allTimes = generateTimeSlots();
    const dateAvailability = unavailableDateTime[selectedDate];

    // If the entire day is unavailable, return empty array
    if (dateAvailability === "full-day") return [];

    // If there are specific unavailable times, filter them out
    const unavailableForDate = Array.isArray(dateAvailability)
      ? dateAvailability
      : [];
    return allTimes.filter((time) => !unavailableForDate.includes(time));
  };

  const handleOpenBookingModal = () => {
    setShowBookingModal(true);
    setBookingSuccess(null);
    setBookingError(null);
    resetBookingForm();
    void fetchAvailability();
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setBookingSuccess(null);
    setBookingError(null);
    setIsBookingLoading(false);
    resetBookingForm();
    setAvailabilityError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
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
          </div>
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Discovery
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <img
              src={mentor.image}
              alt={mentor.name}
              className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
            />

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mentor.name}
                  </h1>
                  <p className="text-xl text-gray-600 mb-1">{mentor.title}</p>
                  <p className="text-lg text-gray-500">{mentor.company}</p>
                </div>

                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="font-semibold">{mentor.rating}</span>
                  <span className="text-gray-600 ml-1">
                    ({mentor.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <span
                    className={`font-medium ${
                      mentor.availability === "Available"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {mentor.availability}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{mentor.location}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {mentor.languages.join(", ")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Send Message
                </button>
                <button
                  onClick={handleOpenBookingModal}
                  className="flex items-center justify-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
            </div>

            {/* Expertise */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Areas of Expertise
              </h2>
              <div className="flex flex-wrap gap-3">
                {mentor.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Key Achievements
              </h2>
              <ul className="space-y-3">
                {mentor.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recent Reviews
              </h2>
              {isReviewsLoading ? (
                <div className="flex items-center text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                  <span>Loading reviews...</span>
                </div>
              ) : reviewsError ? (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                  Failed to load reviews. {reviewsError}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => {
                    const normalizedRating = Math.max(
                      0,
                      Math.min(5, Math.round(review.rating ?? 0))
                    );
                    return (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.name}
                            </h4>
                          </div>
                          <div className="flex items-center">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < normalizedRating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              {review.date}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">
                          {review.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience Level:</span>
                  <span className="font-medium text-gray-900">
                    {mentor.experience}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium text-gray-900">
                    {mentor.industry}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response Time:</span>
                  <span className="font-medium text-gray-900">
                    &lt; 24 hours
                  </span>
                </div>
              </div>
            </div>

            {/* Similar Mentors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Similar Mentors
              </h3>
              {similarMentors.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {similarMentors.map((similar) => (
                    <button
                      type="button"
                      key={similar.id}
                      onClick={() => onSimilarMentorSelect(similar)}
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left cursor-pointer"
                      aria-label={`View profile for ${similar.name}`}
                    >
                      <img
                        src={similar.image}
                        alt={similar.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {similar.name}
                        </p>
                        <p className="text-gray-600 text-xs truncate">
                          {similar.title}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        <span className="text-xs text-gray-600">
                          {Number.isFinite(similar.rating)
                            ? similar.rating.toFixed(1)
                            : "N/A"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No similar mentors to display right now.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Send Message to {mentor.name}
            </h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain what you'd like to learn..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowContactForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Book a Session with {mentor.name}
              </h3>
              {bookingSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {bookingSuccess}
                </div>
              )}
              {bookingError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bookingError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Personal Information
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.firstName}
                      onChange={(e) =>
                        updateBookingForm("firstName", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.lastName}
                      onChange={(e) =>
                        updateBookingForm("lastName", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) =>
                        updateBookingForm("email", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={bookingForm.city}
                      onChange={(e) =>
                        updateBookingForm("city", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your city"
                    />
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload CV/Resume *
                  </label>
                  <div className="relative">
                    <input
                      key={fileInputKey}
                      type="file"
                      onChange={handleCVUpload}
                      accept=".pdf,.doc,.docx"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                      {bookingForm.cv && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {bookingForm.cv.name} uploaded successfully
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted formats: PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Session Details
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={bookingForm.selectedDate}
                      onChange={(e) =>
                        updateBookingForm("selectedDate", e.target.value)
                      }
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isAvailabilityLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time *
                    </label>
                    <select
                      value={bookingForm.selectedTime}
                      onChange={(e) =>
                        updateBookingForm("selectedTime", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={
                        isAvailabilityLoading ||
                        !bookingForm.selectedDate ||
                        availabilityError !== null
                      }
                    >
                      <option value="">Select a time</option>
                      {getAvailableTimes(bookingForm.selectedDate).map(
                        (time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        )
                      )}
                    </select>
                    {isAvailabilityLoading && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading availability...
                      </p>
                    )}
                    {availabilityError && (
                      <p className="text-sm text-red-600 mt-1">
                        {availabilityError}
                      </p>
                    )}
                    {!isAvailabilityLoading &&
                      !availabilityError &&
                      bookingForm.selectedDate &&
                      getAvailableTimes(bookingForm.selectedDate).length === 0 && (
                        <p className="text-sm text-orange-600 mt-1">
                          No times available on this date. Please choose another day.
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Session Expectations */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What would you like to learn or discuss in this session?
                </label>
                <textarea
                  value={bookingForm.sessionExpectations}
                  onChange={(e) =>
                    updateBookingForm("sessionExpectations", e.target.value)
                  }
                  placeholder="Describe your goals, questions, or what you'd like to focus on during the session..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={handleBookingSubmit}
                  disabled={
                    !bookingForm.firstName ||
                    !bookingForm.lastName ||
                    !bookingForm.email ||
                    !bookingForm.city ||
                    !bookingForm.selectedDate ||
                    !bookingForm.selectedTime ||
                    !bookingForm.cv ||
                    isBookingLoading
                  }
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
                >
                  {isBookingLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Session"
                  )}
                </button>
                <button
                  onClick={handleCloseBookingModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

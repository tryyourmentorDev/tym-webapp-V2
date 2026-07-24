import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  CalendarCheck2,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  Globe2,
  Heart,
  Loader2,
  MapPin,
  MessageSquareText,
  Paperclip,
  Share2,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { Mentor, Mentee } from "../App";
import { BrandLogo } from "./BrandLogo";
import {
  mentorService,
  type MentorBookingResponse,
  type MentorReview,
  type MentorUnavailableDateTime,
} from "../services/mentorService";

const defaultWorkingHours = {
  start: "09:00",
  end: "17:00",
  timezone: "Asia/Colombo",
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

type BookingConfirmation = {
  response: MentorBookingResponse;
  date: string;
  time: string;
};

const emptyBookingForm = (): BookingFormState => ({
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
      const result = String(reader.result ?? "");
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () =>
      reject(new Error("We couldn’t read the attached CV. Please try again."));
    reader.readAsDataURL(file);
  });

const acceptedCVTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const acceptedCVExtensions = [".pdf", ".doc", ".docx"];
const maxCVSize = 5 * 1024 * 1024;

const extractExperienceYears = (
  experienceLevel?: string | null
): number | null => {
  if (!experienceLevel) return null;
  const match = experienceLevel.match(/\d+/);
  if (!match) return 0;
  const parsed = Number.parseInt(match[0], 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const initialsFor = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const datePartsInZone = (timezone: string) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
};

const formatBookingDate = (date: string) => {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] =
    useState<BookingFormState>(emptyBookingForm);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [confirmation, setConfirmation] =
    useState<BookingConfirmation | null>(null);
  const [reviews, setReviews] = useState<MentorReview[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [workingHours, setWorkingHours] = useState(defaultWorkingHours);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [unavailableDateTime, setUnavailableDateTime] =
    useState<MentorUnavailableDateTime>({});
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );
  const [isSaved, setIsSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState("Share");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const timezone = workingHours.timezone || defaultWorkingHours.timezone;

  const fetchAvailability = async () => {
    setIsAvailabilityLoading(true);
    setAvailabilityError(null);
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
          : "Availability is temporarily unavailable."
      );
    } finally {
      setIsAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setIsReviewsLoading(true);
    setReviewsError(null);
    setReviews([]);

    void mentorService
      .getMentorReviews(mentor.id)
      .then((response) => {
        if (active) setReviews(response.reviews);
      })
      .catch((error) => {
        if (active) {
          setReviewsError(
            error instanceof Error ? error.message : "Reviews unavailable"
          );
        }
      })
      .finally(() => {
        if (active) setIsReviewsLoading(false);
      });

    void fetchAvailability();

    return () => {
      active = false;
    };
    // fetchAvailability is intentionally scoped to the selected mentor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentor.id]);

  function closeBookingModal() {
    setShowBookingModal(false);
    setBookingError(null);
    setConfirmation(null);
    setIsBookingLoading(false);
    setBookingForm(emptyBookingForm());
    if (cvInputRef.current) cvInputRef.current.value = "";
  }

  useEffect(() => {
    if (!showBookingModal) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBookingModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => firstInputRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [showBookingModal]);

  const openBookingModal = () => {
    setBookingForm(emptyBookingForm());
    setBookingError(null);
    setConfirmation(null);
    setShowBookingModal(true);
    void fetchAvailability();
  };

  const updateBookingForm = (
    field: keyof BookingFormState,
    value: string
  ) => {
    setBookingForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "selectedDate" ? { selectedTime: "" } : {}),
    }));
  };

  const handleCVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setBookingForm((current) => ({ ...current, cv: null }));
      return;
    }

    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();
    const hasAcceptedType =
      acceptedCVTypes.has(file.type) ||
      acceptedCVExtensions.includes(extension);

    if (!hasAcceptedType) {
      setBookingError("Attach your CV as a PDF, DOC, or DOCX file.");
      event.target.value = "";
      return;
    }

    if (file.size > maxCVSize) {
      setBookingError("Your CV must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setBookingError(null);
    setBookingForm((current) => ({ ...current, cv: file }));
  };

  const removeCV = () => {
    setBookingForm((current) => ({ ...current, cv: null }));
    if (cvInputRef.current) cvInputRef.current.value = "";
  };

  const generateTimeSlots = () => {
    const [startHour, startMinute] = workingHours.start.split(":").map(Number);
    const [endHour, endMinute] = workingHours.end.split(":").map(Number);
    const end = endHour * 60 + endMinute;
    const slots: string[] = [];

    for (
      let current = startHour * 60 + startMinute;
      current + 60 <= end;
      current += 60
    ) {
      const hour = Math.floor(current / 60)
        .toString()
        .padStart(2, "0");
      const minute = (current % 60).toString().padStart(2, "0");
      slots.push(`${hour}:${minute}`);
    }

    return slots;
  };

  const isDateAvailable = (date: string) => {
    if (!date) return false;
    const [year, month, day] = date.split("-").map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    return (
      workingDays.includes(dayOfWeek) &&
      unavailableDateTime[date] !== "full-day"
    );
  };

  const getAvailableTimes = (date: string) => {
    if (!isDateAvailable(date) || isAvailabilityLoading) return [];
    const blocked = Array.isArray(unavailableDateTime[date])
      ? unavailableDateTime[date]
      : [];
    const currentInZone = datePartsInZone(timezone);

    return generateTimeSlots().filter((time) => {
      if (blocked.includes(time)) return false;
      if (date !== currentInZone.date) return true;
      const [hour, minute] = time.split(":").map(Number);
      return hour * 60 + minute > currentInZone.minutes + 30;
    });
  };

  const minDate = datePartsInZone(timezone).date;
  const maxDate = (() => {
    const [year, month, day] = minDate.split("-").map(Number);
    const max = new Date(year, month - 1, day);
    max.setDate(max.getDate() + 60);
    return `${max.getFullYear()}-${String(max.getMonth() + 1).padStart(2, "0")}-${String(max.getDate()).padStart(2, "0")}`;
  })();

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const {
      firstName,
      lastName,
      email,
      city,
      selectedDate,
      selectedTime,
      sessionExpectations,
      cv,
    } = bookingForm;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !city.trim() ||
      !selectedDate ||
      !selectedTime
    ) {
      setBookingError("Complete the required details before booking.");
      return;
    }

    setIsBookingLoading(true);
    setBookingError(null);

    try {
      const cvBase64 = cv ? await fileToBase64(cv) : null;
      const response = await mentorService.bookMentorSession(mentor.id, {
        user: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        },
        mentee: menteeProfile
          ? {
              educationQualificationId:
                menteeProfile.educationLevelId ?? null,
              currentJobRoleId: menteeProfile.jobRoleId ?? null,
              expectedJobRoleId: menteeProfile.jobRoleId ?? null,
              experienceLevel: menteeProfile.experienceLevel ?? null,
              experienceYears: extractExperienceYears(
                menteeProfile.experienceLevel
              ),
              interests: menteeProfile.interests,
              goals: menteeProfile.goals,
              city: city.trim(),
            }
          : { city: city.trim() },
        booking: {
          mentorId: mentor.id,
          date: selectedDate,
          time: selectedTime,
          timezone,
          city: city.trim(),
          sessionExpectations: sessionExpectations.trim() || undefined,
          cv:
            cv && cvBase64
              ? {
                  fileName: cv.name,
                  mimeType: cv.type || "application/octet-stream",
                  size: cv.size,
                  base64: cvBase64,
                }
              : null,
        },
      });

      setConfirmation({
        response,
        date: selectedDate,
        time: selectedTime,
      });
      await fetchAvailability();
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "We couldn’t reserve this session. Please try again."
      );
    } finally {
      setIsBookingLoading(false);
    }
  };

  const shareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${mentor.name} on Try Your Mentor`,
          text: `View ${mentor.name}'s mentor profile`,
          url: window.location.href,
        });
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("Link copied");
      window.setTimeout(() => setShareStatus("Share"), 1800);
    } catch {
      setShareStatus("Share");
    }
  };

  const hasRating = mentor.rating > 0;
  const hasAchievements = mentor.achievements.length > 0;

  return (
    <div className="page-shell flow-canvas">
      <header className="app-header">
        <div className="container-shell grid h-[76px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:grid-cols-[auto_1fr_auto]">
          <button
            type="button"
            onClick={onBackToHome}
            className="justify-self-start"
            aria-label="Try Your Mentor home"
          >
            <BrandLogo />
          </button>

          <nav
            className="hidden items-center justify-center gap-3 lg:flex"
            aria-label="Booking journey"
          >
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-blue-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-3.5 w-3.5" />
              </span>
              Discover
            </button>
            <span className="h-px w-8 bg-slate-200" />
            <span
              className="inline-flex items-center gap-2 text-xs font-black text-blue-700"
              aria-current="step"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                2
              </span>
              Review profile
            </span>
            <span className="h-px w-8 bg-slate-200" />
            <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white">
                3
              </span>
              Book
            </span>
          </nav>

          <button
            type="button"
            onClick={onBack}
            className="btn-secondary min-h-10 px-3 text-sm sm:px-3.5"
            aria-label="Back to mentor matches"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to matches</span>
          </button>
        </div>
      </header>

      <main className="container-shell py-7 sm:py-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          Mentor matches
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900">{mentor.name}</span>
        </button>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-6">
            <section className="surface-card overflow-hidden">
              <div className="relative h-24 overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 sm:h-28">
                <span className="absolute -right-10 -top-20 h-52 w-52 rounded-full border border-white/15" />
                <span className="absolute right-24 top-8 h-24 w-24 rounded-full bg-cyan-300/15 blur-xl" />
                <span className="absolute inset-y-0 left-1/2 w-px rotate-[28deg] bg-white/10" />
              </div>
              <div className="px-5 pb-7 sm:px-8 sm:pb-8">
                <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 md:flex-row md:items-end md:justify-between">
                  <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end">
                    {mentor.image ? (
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-lg sm:h-32 sm:w-32"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-slate-900 text-2xl font-black text-white shadow-lg sm:h-32 sm:w-32">
                        {initialsFor(mentor.name)}
                      </div>
                    )}
                    <div className="rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.6)] sm:mb-1 sm:min-w-[300px] sm:px-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950 sm:text-3xl">
                          {mentor.name}
                        </h1>
                      </div>
                      <p className="mt-1 font-bold text-slate-700">
                        {mentor.title}
                      </p>
                      {mentor.company && (
                        <p className="mt-0.5 text-sm text-slate-500">
                          {mentor.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 flex gap-2 sm:mb-1">
                    <button
                      type="button"
                      onClick={() => setIsSaved((saved) => !saved)}
                      className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition ${
                        isSaved
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      aria-pressed={isSaved}
                      aria-label={
                        isSaved ? "Remove saved mentor" : "Save mentor profile"
                      }
                    >
                      <Heart
                        className="mr-2 h-4 w-4"
                        fill={isSaved ? "currentColor" : "none"}
                      />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={shareProfile}
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                      aria-label="Share mentor profile"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {shareStatus}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
                  {hasRating && (
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Star
                        className="h-4 w-4 text-amber-400"
                        fill="currentColor"
                      />
                      {mentor.rating.toFixed(1)}
                      <span className="font-normal text-slate-400">
                        ({mentor.reviewCount} reviews)
                      </span>
                    </span>
                  )}
                  {mentor.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {mentor.location}
                    </span>
                  )}
                  {mentor.languages?.length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Globe2 className="h-4 w-4 text-slate-400" />
                      {mentor.languages.join(", ")}
                    </span>
                  )}
                  {mentor.linkedinUrl && (
                    <a
                      href={mentor.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-800"
                    >
                      LinkedIn
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </section>

            {mentor.bio && (
              <section className="surface-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MessageSquareText className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Mentor profile
                    </p>
                    <h2 className="text-xl font-black text-slate-950">About</h2>
                  </div>
                </div>
                <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">
                  {mentor.bio}
                </p>
              </section>
            )}

            {mentor.expertise.length > 0 && (
              <section className="surface-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Briefcase className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Areas of focus
                    </p>
                    <h2 className="text-xl font-black text-slate-950">
                      Expertise
                    </h2>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {mentor.expertise.map((expertise) => (
                    <span
                      key={expertise}
                      className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800"
                    >
                      {expertise}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {hasAchievements && (
              <section className="surface-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Award className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Career highlights
                    </p>
                    <h2 className="text-xl font-black text-slate-950">
                      Key achievements
                    </h2>
                  </div>
                </div>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {mentor.achievements.map((achievement) => (
                    <li
                      key={achievement}
                      className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(isReviewsLoading || reviews.length > 0) && !reviewsError && (
              <section className="surface-card p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Mentee feedback
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      Reviews
                    </h2>
                  </div>
                  {hasRating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800">
                      <Star
                        className="h-4 w-4 text-amber-400"
                        fill="currentColor"
                      />
                      {mentor.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {isReviewsLoading ? (
                  <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    Loading verified reviews…
                  </div>
                ) : (
                  <div className="mt-6 space-y-5">
                    {reviews.map((review) => (
                      <article
                        key={review.id}
                        className="border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-extrabold text-slate-900">
                              {review.name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {review.date}
                            </p>
                          </div>
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className="h-4 w-4"
                                fill={
                                  index < Math.round(review.rating)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-3 leading-7 text-slate-600">
                          {review.comment}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {similarMentors.length > 0 && (
              <section className="surface-card p-6 sm:p-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Keep exploring
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Similar mentors
                  </h2>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {similarMentors.slice(0, 4).map((similar) => (
                    <button
                      type="button"
                      key={similar.id}
                      onClick={() => onSimilarMentorSelect(similar)}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      {similar.image ? (
                        <img
                          src={similar.image}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                          {initialsFor(similar.name)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-extrabold text-slate-900">
                          {similar.name}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-slate-500">
                          {similar.title}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="surface-card overflow-hidden">
              <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">
                    Book a focused session
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Available
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    Session fee
                  </p>
                  <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    {mentor.charge
                      ? `${mentor.currency ?? "LKR"} ${mentor.charge.toLocaleString()}`
                      : "Confirm with mentor"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    One 60-minute session
                  </p>
                </div>

                <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-4 w-4 text-blue-600" />
                    <span className="text-slate-500">Duration</span>
                    <span className="ml-auto font-bold text-slate-800">
                      60 minutes
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe2 className="h-4 w-4 text-blue-600" />
                    <span className="text-slate-500">Timezone</span>
                    <span className="ml-auto max-w-32 truncate font-bold text-slate-800">
                      {isAvailabilityLoading ? "Loading…" : timezone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarCheck2 className="h-4 w-4 text-blue-600" />
                    <span className="text-slate-500">Schedule</span>
                    <span className="ml-auto font-bold text-slate-800">
                      Live slots
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openBookingModal}
                  className="btn-primary mt-5 w-full"
                >
                  View times & book
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>

                <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  Your slot is only reserved after you review and submit your
                  details.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {showBookingModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeBookingModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-dialog-title"
            className="flex max-h-[95dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
          >
            {confirmation ? (
              <div className="overflow-y-auto p-6 sm:p-10">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Close booking confirmation"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mx-auto max-w-lg text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <CalendarCheck2 className="h-8 w-8" />
                  </span>
                  <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                    Session reserved
                  </p>
                  <h2 className="mt-2 text-balance text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    You’re booked with {mentor.name}
                  </h2>
                  <p className="mt-3 leading-7 text-slate-600">
                    Keep this summary for your records. Booking communication
                    will be sent to the email you provided.
                  </p>

                  <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
                    <dl className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-5 w-5 text-blue-600" />
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Date
                          </dt>
                          <dd className="mt-1 font-extrabold text-slate-900">
                            {formatBookingDate(confirmation.date)}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock3 className="mt-0.5 h-5 w-5 text-blue-600" />
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Time
                          </dt>
                          <dd className="mt-1 font-extrabold text-slate-900">
                            {confirmation.time} · {timezone}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <BadgeCheck className="mt-0.5 h-5 w-5 text-blue-600" />
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Booking reference
                          </dt>
                          <dd className="mt-1 font-extrabold text-slate-900">
                            #{confirmation.response.bookingId}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  <button
                    type="button"
                    onClick={closeBookingModal}
                    className="btn-primary mt-7 w-full"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={submitBooking}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-white to-violet-50/80 px-5 py-5 sm:px-7">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                      Reserve a 60-minute session
                    </p>
                    <h2
                      id="booking-dialog-title"
                      className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
                    >
                      Book with {mentor.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Times shown in {timezone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeBookingModal}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Close booking form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
                  {bookingError && (
                    <div
                      role="alert"
                      className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {bookingError}
                    </div>
                  )}

                  <div className="grid gap-7 md:grid-cols-2">
                    <fieldset>
                      <legend className="text-base font-black text-slate-950">
                        Your details
                      </legend>
                      <p className="mt-1 text-sm text-slate-500">
                        We’ll use these details for this booking.
                      </p>

                      <div className="mt-5 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                          <div>
                            <label htmlFor="first-name" className="field-label">
                              First name
                            </label>
                            <input
                              ref={firstInputRef}
                              id="first-name"
                              type="text"
                              autoComplete="given-name"
                              required
                              value={bookingForm.firstName}
                              onChange={(event) =>
                                updateBookingForm(
                                  "firstName",
                                  event.target.value
                                )
                              }
                              className="field-control"
                            />
                          </div>
                          <div>
                            <label htmlFor="last-name" className="field-label">
                              Last name
                            </label>
                            <input
                              id="last-name"
                              type="text"
                              autoComplete="family-name"
                              required
                              value={bookingForm.lastName}
                              onChange={(event) =>
                                updateBookingForm(
                                  "lastName",
                                  event.target.value
                                )
                              }
                              className="field-control"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="booking-email" className="field-label">
                            Email
                          </label>
                          <input
                            id="booking-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={bookingForm.email}
                            onChange={(event) =>
                              updateBookingForm("email", event.target.value)
                            }
                            className="field-control"
                            placeholder="you@example.com"
                          />
                        </div>

                        <div>
                          <label htmlFor="booking-city" className="field-label">
                            City
                          </label>
                          <input
                            id="booking-city"
                            type="text"
                            autoComplete="address-level2"
                            required
                            value={bookingForm.city}
                            onChange={(event) =>
                              updateBookingForm("city", event.target.value)
                            }
                            className="field-control"
                            placeholder="e.g. Colombo"
                          />
                        </div>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend className="text-base font-black text-slate-950">
                        Session time
                      </legend>
                      <p className="mt-1 text-sm text-slate-500">
                        Choose from the mentor’s live availability.
                      </p>

                      <div className="mt-5 space-y-4">
                        <div>
                          <label htmlFor="booking-date" className="field-label">
                            Date
                          </label>
                          <input
                            id="booking-date"
                            type="date"
                            required
                            min={minDate}
                            max={maxDate}
                            value={bookingForm.selectedDate}
                            onChange={(event) =>
                              updateBookingForm(
                                "selectedDate",
                                event.target.value
                              )
                            }
                            disabled={
                              isAvailabilityLoading ||
                              availabilityError !== null
                            }
                            className="field-control"
                          />
                          {isAvailabilityLoading && (
                            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                              Loading live availability…
                            </p>
                          )}
                          {availabilityError && (
                            <p className="mt-2 text-xs leading-5 text-red-600">
                              {availabilityError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="booking-time" className="field-label">
                            Time
                          </label>
                          <select
                            id="booking-time"
                            required
                            value={bookingForm.selectedTime}
                            onChange={(event) =>
                              updateBookingForm(
                                "selectedTime",
                                event.target.value
                              )
                            }
                            disabled={
                              !bookingForm.selectedDate ||
                              isAvailabilityLoading ||
                              availabilityError !== null
                            }
                            className="field-control"
                          >
                            <option value="">Select a time</option>
                            {getAvailableTimes(bookingForm.selectedDate).map(
                              (time) => (
                                <option key={time} value={time}>
                                  {time} –{" "}
                                  {`${String((Number(time.slice(0, 2)) + 1) % 24).padStart(2, "0")}:${time.slice(3)}`}
                                </option>
                              )
                            )}
                          </select>
                          {bookingForm.selectedDate &&
                            !isAvailabilityLoading &&
                            getAvailableTimes(bookingForm.selectedDate).length ===
                              0 && (
                              <p className="mt-2 text-xs leading-5 text-amber-700">
                                No open times on this date. Try another day.
                              </p>
                            )}
                        </div>

                        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-blue-900">
                          <p className="flex items-center gap-2 font-bold">
                            <Globe2 className="h-4 w-4 text-blue-600" />
                            {timezone}
                          </p>
                          <p className="mt-1 text-xs text-blue-700">
                            Confirm the timezone before reserving your session.
                          </p>
                        </div>
                      </div>
                    </fieldset>
                  </div>

                  <div className="mt-7 border-t border-slate-100 pt-6">
                    <label htmlFor="session-focus" className="field-label">
                      What would you like to focus on?{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="session-focus"
                      value={bookingForm.sessionExpectations}
                      onChange={(event) =>
                        updateBookingForm(
                          "sessionExpectations",
                          event.target.value
                        )
                      }
                      rows={4}
                      maxLength={1200}
                      className="field-control min-h-28 resize-y py-3"
                      placeholder="Share your context, goal, or a few questions so the mentor can prepare."
                    />
                    <p className="mt-2 text-right text-xs text-slate-400">
                      {bookingForm.sessionExpectations.length}/1200
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <label htmlFor="booking-cv" className="field-label">
                          Attach your CV{" "}
                          <span className="font-normal text-slate-400">
                            (optional)
                          </span>
                        </label>
                        <p className="text-sm leading-6 text-slate-500">
                          Share relevant experience so your mentor can prepare
                          more useful feedback.
                        </p>
                      </div>
                      <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:flex">
                        <Paperclip className="h-4 w-4" />
                      </span>
                    </div>

                    {bookingForm.cv ? (
                      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                          <Paperclip className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold text-slate-900">
                            {bookingForm.cv.name}
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-700">
                            {(bookingForm.cv.size / (1024 * 1024)).toFixed(1)} MB
                            · Ready to share
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeCV}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-red-600"
                          aria-label={`Remove ${bookingForm.cv.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="booking-cv"
                        className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-violet-300 bg-violet-50/60 p-4 transition hover:border-violet-400 hover:bg-violet-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
                          <Paperclip className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-extrabold text-violet-900">
                            Choose a CV or résumé
                          </span>
                          <span className="mt-0.5 block text-xs text-violet-700">
                            PDF, DOC, or DOCX · maximum 5 MB
                          </span>
                        </span>
                      </label>
                    )}
                    <input
                      ref={cvInputRef}
                      id="booking-cv"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleCVUpload}
                      className="sr-only"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-7">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-500">
                      By booking, you agree to share these details with the
                      selected mentor.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closeBookingModal}
                        className="btn-secondary flex-1 sm:flex-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isBookingLoading}
                        className="btn-primary flex-1 whitespace-nowrap sm:flex-none"
                      >
                        {isBookingLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Reserving…
                          </>
                        ) : (
                          <>
                            Reserve session
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

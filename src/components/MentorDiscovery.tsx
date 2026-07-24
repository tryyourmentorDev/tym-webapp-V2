import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  ChevronDown,
  Clock3,
  Filter,
  Globe2,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import type { Mentee, Mentor } from "../App";
import { useMentors } from "../hooks/useMentors";
import { BrandLogo } from "./BrandLogo";

interface MentorDiscoveryProps {
  menteeProfile: Mentee;
  onMentorSelect: (mentor: Mentor, similarMentors: Mentor[]) => void;
  onBackToHome: () => void;
}

const initialsFor = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const MentorAvatar = ({ mentor }: { mentor: Mentor }) =>
  mentor.image ? (
    <img
      src={mentor.image}
      alt=""
      className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200"
    />
  ) : (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-black text-white">
      {initialsFor(mentor.name)}
    </div>
  );

export const MentorDiscovery: React.FC<MentorDiscoveryProps> = ({
  menteeProfile,
  onMentorSelect,
  onBackToHome,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const {
    mentors,
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

  const activeFiltersCount =
    selectedExpertise.length +
    selectedExperience.length +
    selectedAvailability.length;

  const clearAllFilters = () => {
    setSelectedExpertise([]);
    setSelectedExperience([]);
    setSelectedAvailability([]);
    setSearchTerm("");
  };

  const toggleFilter = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const resultMessage = useMemo(() => {
    if (isLoading) return "Finding relevant mentors";
    if (mentors.length === 1) return "1 mentor matches your profile";
    return `${mentors.length} mentors match your profile`;
  }, [isLoading, mentors.length]);

  const selectMentor = (mentor: Mentor) => {
    onMentorSelect(
      mentor,
      mentors.filter((item) => item.id !== mentor.id)
    );
  };

  const handleStartOver = () => {
    if (
      window.confirm(
        "Start a new mentor search? Your current match profile will be cleared."
      )
    ) {
      onBackToHome();
    }
  };

  return (
    <div className="page-shell flow-canvas">
      <header className="app-header">
        <div className="container-shell flex h-[72px] items-center justify-between">
          <button
            type="button"
            onClick={handleStartOver}
            className="flex items-center gap-3"
            aria-label="Try Your Mentor home"
          >
            <BrandLogo />
          </button>
          <button
            type="button"
            onClick={handleStartOver}
            className="btn-secondary min-h-10 px-3.5 text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start over
          </button>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-gradient-to-br from-blue-50 via-white to-violet-50/80">
          <div className="container-shell py-9 sm:py-12">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <span className="eyebrow">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your mentor shortlist
                </span>
                <h1 className="mt-4 text-balance text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Mentors for your next step
                </h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  Prioritised for{" "}
                  <strong className="font-bold text-slate-800">
                    {menteeProfile.jobRole}
                  </strong>{" "}
                  in {menteeProfile.interests.join(", ")}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                    Experience
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {menteeProfile.experienceLevel}
                  </p>
                </div>
                <div className="rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                    Goals
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {menteeProfile.goals.length} selected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container-shell py-8 sm:py-10">
          <div className="grid items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="surface-card overflow-hidden lg:sticky lg:top-24">
              <button
                type="button"
                onClick={() => setShowFilters((visible) => !visible)}
                className="flex w-full items-center justify-between px-5 py-4 text-left lg:cursor-default"
                aria-expanded={showFilters}
              >
                <span className="flex items-center gap-2 font-extrabold text-slate-900">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  Refine results
                  {activeFiltersCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition lg:hidden ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`border-t border-slate-100 px-5 pb-5 pt-4 ${
                  showFilters ? "block" : "hidden lg:block"
                }`}
              >
                {[
                  {
                    title: "Expertise",
                    options: expertiseOptions,
                    selected: selectedExpertise,
                    setter: setSelectedExpertise,
                  },
                  {
                    title: "Experience",
                    options: experienceOptions,
                    selected: selectedExperience,
                    setter: setSelectedExperience,
                  },
                  {
                    title: "Availability",
                    options: availabilityOptions,
                    selected: selectedAvailability,
                    setter: setSelectedAvailability,
                  },
                ].map((group, groupIndex) => (
                  <fieldset
                    key={group.title}
                    className={groupIndex > 0 ? "mt-6" : ""}
                  >
                    <legend className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500">
                      {group.title}
                    </legend>
                    <div className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1">
                      {group.options.length > 0 ? (
                        group.options.map((option) => (
                          <label
                            key={option}
                            className="flex cursor-pointer items-start gap-2.5 rounded-lg py-1 text-sm text-slate-600"
                          >
                            <input
                              type="checkbox"
                              checked={group.selected.includes(option)}
                              onChange={() =>
                                toggleFilter(
                                  option,
                                  group.selected,
                                  group.setter
                                )
                              }
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{option}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">No options yet</p>
                      )}
                    </div>
                  </fieldset>
                ))}

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-6 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800"
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Clear filters
                  </button>
                )}
              </div>
            </aside>

            <section>
              <div className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <label htmlFor="mentor-search" className="sr-only">
                    Search mentors
                  </label>
                  <input
                    id="mentor-search"
                    type="search"
                    placeholder="Search by name, company, or expertise"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="field-control pl-11 pr-10"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Clear mentor search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters((visible) => !visible)}
                  className="btn-secondary lg:hidden"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
                </button>
              </div>

              <div className="mb-5 mt-7 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Recommended mentors
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{resultMessage}</p>
                </div>
                {!isLoading && mentors.length > 0 && (
                  <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:inline-flex">
                    <Check className="h-3.5 w-3.5" />
                    Profile matched
                  </span>
                )}
              </div>

              {isLoading && (
                <div className="surface-card flex min-h-72 items-center justify-center p-8">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />
                    <p className="mt-4 font-bold text-slate-900">
                      Building your shortlist
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Comparing your profile with mentor experience…
                    </p>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="surface-card flex min-h-72 items-center justify-center p-8">
                  <div className="max-w-md text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                      <AlertCircle className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-extrabold text-slate-950">
                      We couldn’t load your matches
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={refetch}
                      className="btn-primary mt-5"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {!isLoading && !error && mentors.length === 0 && (
                <div className="surface-card flex min-h-80 items-center justify-center p-8">
                  <div className="max-w-md text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Search className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-extrabold text-slate-950">
                      No exact matches yet
                    </h3>
                    <p className="mt-2 leading-7 text-slate-500">
                      Clear a filter or broaden your search. Your original match
                      profile will stay intact.
                    </p>
                    {(searchTerm || activeFiltersCount > 0) && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="btn-primary mt-5"
                      >
                        Clear search and filters
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!isLoading && !error && mentors.length > 0 && (
                <div className="space-y-4">
                  {mentors.map((mentor, index) => {
                    const hasRating = mentor.rating > 0;
                    const firstLanguage = mentor.languages?.[0];
                    return (
                      <article
                        key={mentor.id}
                        className="surface-card group overflow-hidden border-l-[3px] border-l-blue-500 p-5 transition hover:border-blue-200 hover:border-l-indigo-500 hover:shadow-xl hover:shadow-blue-950/5 sm:p-6"
                      >
                        <div className="flex flex-col gap-5 sm:flex-row">
                          <MentorAvatar mentor={mentor} />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-xl font-black text-slate-950">
                                    {mentor.name}
                                  </h3>
                                  {index === 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                                      <Sparkles className="h-3 w-3" />
                                      Best match
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 font-semibold text-slate-700">
                                  {mentor.title}
                                  {mentor.company && (
                                    <span className="font-normal text-slate-400">
                                      {" "}
                                      at{" "}
                                    </span>
                                  )}
                                  {mentor.company}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 lg:flex-col lg:items-end lg:gap-1">
                                {hasRating && (
                                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                    <Star
                                      className="h-4 w-4 text-amber-400"
                                      fill="currentColor"
                                    />
                                    {mentor.rating.toFixed(1)}
                                    <span className="font-normal text-slate-400">
                                      ({mentor.reviewCount})
                                    </span>
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                  Accepting sessions
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                              {mentor.location && (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  {mentor.location}
                                </span>
                              )}
                              {mentor.experience && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Briefcase className="h-4 w-4" />
                                  {mentor.experience}
                                </span>
                              )}
                              {firstLanguage && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Globe2 className="h-4 w-4" />
                                  {firstLanguage}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="h-4 w-4" />
                                60-minute session
                              </span>
                            </div>

                            {mentor.bio && (
                              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                                {mentor.bio}
                              </p>
                            )}

                            {mentor.expertise.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {mentor.expertise.slice(0, 5).map((expertise) => (
                                  <span key={expertise} className="tag">
                                    {expertise}
                                  </span>
                                ))}
                                {mentor.expertise.length > 5 && (
                                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    +{mentor.expertise.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                              Session fee
                            </p>
                            <p className="mt-1 font-extrabold text-slate-900">
                              {mentor.charge
                                ? `${mentor.currency ?? "LKR"} ${mentor.charge.toLocaleString()}`
                                : "Confirm with mentor"}
                              <span className="ml-1 text-sm font-normal text-slate-400">
                                / 60 min
                              </span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => selectMentor(mentor)}
                            className="btn-primary w-full sm:w-auto"
                          >
                            View profile
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

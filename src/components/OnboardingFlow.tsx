import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Briefcase,
  Check,
  ChevronRight,
  Code2,
  GraduationCap,
  LineChart,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import type { Mentee } from "../App";
import { BrandLogo } from "./BrandLogo";
import {
  taxonomyService,
  type TaxonomyOption,
} from "../services/taxonomyService";

interface OnboardingFlowProps {
  onComplete: (profile: Mentee) => void;
  onBackToHome: () => void;
}

const experienceLevels = [
  {
    label: "Student / Entry level",
    value: "Student/Entry Level",
    helper: "Starting out or preparing for your first role",
  },
  {
    label: "Junior",
    value: "Junior (1-2 years)",
    helper: "1–2 years of professional experience",
  },
  {
    label: "Mid-level",
    value: "Mid-level (3-5 years)",
    helper: "3–5 years of professional experience",
  },
  {
    label: "Senior",
    value: "Senior (6-8 years)",
    helper: "6–8 years of professional experience",
  },
  {
    label: "Lead / Staff",
    value: "Mid Senior (8-10 years)",
    helper: "8–10 years or a technical leadership role",
  },
  {
    label: "Executive",
    value: "Executive (11+ years)",
    helper: "11+ years or organisational leadership",
  },
];

const industryVisuals = {
  1: {
    icon: Code2,
    description: "Engineering, cloud, architecture, and growth",
    surface: "bg-blue-50/50 hover:border-blue-300",
    iconTone: "bg-blue-100 text-blue-700",
  },
  2: {
    icon: ShieldCheck,
    description: "Quality strategy, automation, and leadership",
    surface: "bg-emerald-50/50 hover:border-emerald-300",
    iconTone: "bg-emerald-100 text-emerald-700",
  },
  3: {
    icon: LineChart,
    description: "Discovery, stakeholders, delivery, and progression",
    surface: "bg-violet-50/50 hover:border-violet-300",
    iconTone: "bg-violet-100 text-violet-700",
  },
} as const;

const emptyProfile: Partial<Mentee> = {
  interests: [],
  goals: [],
  experienceLevel: "",
  educationLevel: "",
  jobRole: "",
};

const readDraft = (): Partial<Mentee> => {
  try {
    const saved = sessionStorage.getItem("onboardingDraft");
    return saved ? { ...emptyProfile, ...JSON.parse(saved) } : emptyProfile;
  } catch {
    return emptyProfile;
  }
};

const qualificationLabel = (option: TaxonomyOption) => {
  if (option.id === 1) return "Engineering degree (BSc)";
  if (option.id === 2) return "Postgraduate degree";
  if (option.id === 3) return "Bachelor’s degree";
  if (option.id === 4) return "Master’s degree";
  return option.name;
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onBackToHome,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Mentee>>(readDraft);
  const [industries, setIndustries] = useState<TaxonomyOption[]>([]);
  const [goals, setGoals] = useState<TaxonomyOption[]>([]);
  const [qualifications, setQualifications] = useState<TaxonomyOption[]>([]);
  const [jobRoles, setJobRoles] = useState<TaxonomyOption[]>([]);
  const [isTaxonomyLoading, setIsTaxonomyLoading] = useState(true);
  const [isDependentLoading, setIsDependentLoading] = useState(false);

  useEffect(() => {
    let active = true;

    void Promise.all([
      taxonomyService.getIndustries(),
      taxonomyService.getQualifications(),
    ]).then(([industryData, qualificationData]) => {
      if (!active) return;
      setIndustries(industryData);
      setQualifications(qualificationData);
      setIsTaxonomyLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem("onboardingDraft", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (!formData.industryId) {
      setGoals([]);
      setJobRoles([]);
      return;
    }

    let active = true;
    setIsDependentLoading(true);
    void Promise.all([
      taxonomyService.getGoals(formData.industryId),
      taxonomyService.getJobRoles(formData.industryId),
    ]).then(([goalData, roleData]) => {
      if (!active) return;
      setGoals(goalData);
      setJobRoles(roleData);
      setIsDependentLoading(false);
    });

    return () => {
      active = false;
    };
  }, [formData.industryId]);

  const selectedIndustry = industries.find(
    (industry) => industry.id === formData.industryId
  );

  const selectedQualification = qualifications.find(
    (qualification) => qualification.id === formData.educationLevelId
  );

  const canProceed = useMemo(() => {
    if (currentStep === 1) return Boolean(formData.industryId);
    if (currentStep === 2) return Boolean(formData.goals?.length);
    return Boolean(
      formData.experienceLevel &&
        formData.educationLevelId &&
        formData.jobRoleId
    );
  }, [currentStep, formData]);

  const selectIndustry = (industry: TaxonomyOption) => {
    setFormData((current) => ({
      ...current,
      interests: [industry.name],
      industryId: industry.id,
      goals: current.industryId === industry.id ? current.goals : [],
      jobRole: "",
      jobRoleId: undefined,
    }));
  };

  const toggleGoal = (goal: TaxonomyOption) => {
    const selected = formData.goals ?? [];
    setFormData((current) => ({
      ...current,
      goals: selected.includes(goal.name)
        ? selected.filter((item) => item !== goal.name)
        : [...selected, goal.name],
    }));
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (currentStep < 3) {
      setCurrentStep((step) => step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    onComplete(formData as Mentee);
  };

  const handleExit = () => {
    const hasProgress =
      Boolean(formData.industryId) ||
      Boolean(formData.goals?.length) ||
      Boolean(formData.experienceLevel);

    if (
      hasProgress &&
      !window.confirm("Leave mentor matching? Your current answers will be cleared.")
    ) {
      return;
    }

    onBackToHome();
  };

  return (
    <div className="page-shell flow-canvas">
      <header className="app-header">
        <div className="container-shell flex h-[72px] items-center justify-between">
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-3"
            aria-label="Exit mentor matching"
          >
            <BrandLogo />
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-500 sm:inline">
              Your match profile
            </span>
            <button
              type="button"
              onClick={handleExit}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Close mentor matching"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container-shell py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="surface-card p-4 sm:p-5">
                <div className="mb-5 flex items-center justify-between lg:block">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                      Step {currentStep} of 3
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      About 2 minutes
                    </p>
                  </div>
                  <div className="text-right lg:hidden">
                    <span className="text-sm font-bold text-slate-900">
                      {Math.round((currentStep / 3) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 lg:hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 transition-all"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>

                <ol className="mt-5 hidden space-y-2 lg:block">
                  {[
                    { step: 1, title: "Your field", icon: Briefcase },
                    { step: 2, title: "Your goals", icon: Target },
                    { step: 3, title: "Your background", icon: GraduationCap },
                  ].map(({ step, title, icon: Icon }) => {
                    const isActive = currentStep === step;
                    const isComplete = currentStep > step;
                    return (
                      <li key={step}>
                        <button
                          type="button"
                          onClick={() => isComplete && setCurrentStep(step)}
                          disabled={!isComplete}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : isComplete
                                ? "text-slate-700 hover:bg-slate-50"
                                : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                              isActive
                                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                                : isComplete
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100"
                            }`}
                          >
                            {isComplete ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </span>
                          <span className="text-sm font-bold">{title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>

                {(selectedIndustry ||
                  formData.goals?.length ||
                  formData.experienceLevel) && (
                  <div className="mt-5 hidden border-t border-slate-100 pt-5 lg:block">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Your profile
                    </p>
                    <dl className="mt-3 space-y-3 text-sm">
                      {selectedIndustry && (
                        <div>
                          <dt className="text-slate-400">Field</dt>
                          <dd className="mt-0.5 font-semibold text-slate-700">
                            {selectedIndustry.name}
                          </dd>
                        </div>
                      )}
                      {Boolean(formData.goals?.length) && (
                        <div>
                          <dt className="text-slate-400">Goals</dt>
                          <dd className="mt-0.5 font-semibold text-slate-700">
                            {formData.goals?.length} selected
                          </dd>
                        </div>
                      )}
                      {formData.experienceLevel && (
                        <div>
                          <dt className="text-slate-400">Experience</dt>
                          <dd className="mt-0.5 font-semibold text-slate-700">
                            {formData.experienceLevel}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            </aside>

            <section>
              {isTaxonomyLoading ? (
                <div className="surface-card flex min-h-[460px] items-center justify-center p-8">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-600" />
                    <p className="mt-4 font-bold text-slate-900">
                      Preparing your match profile
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Loading the latest career options…
                    </p>
                  </div>
                </div>
              ) : (
                <div className="surface-card overflow-hidden">
                  <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-violet-50/70 px-6 py-7 sm:px-8">
                    <span className="eyebrow">
                      <Sparkles className="h-3.5 w-3.5" />
                      Personalised matching
                    </span>
                    <h1 className="mt-4 text-balance text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      {currentStep === 1 && "Which field are you growing in?"}
                      {currentStep === 2 && "What would make this session useful?"}
                      {currentStep === 3 && "Add a little career context"}
                    </h1>
                    <p className="mt-2 max-w-2xl leading-7 text-slate-600">
                      {currentStep === 1 &&
                        "Choose the track that best reflects the work you do or want to do next."}
                      {currentStep === 2 &&
                        "Select one or more outcomes. We’ll use these to make the mentor list more relevant."}
                      {currentStep === 3 &&
                        "Your background helps us prioritise mentors who can meet you at the right level."}
                    </p>
                  </div>

                  <div className="px-6 py-7 sm:px-8 sm:py-8">
                    {currentStep === 1 && (
                      <div className="grid gap-4 sm:grid-cols-3">
                        {industries.map((industry) => {
                          const visual =
                            industryVisuals[
                              industry.id as keyof typeof industryVisuals
                            ];
                          const Icon = visual?.icon ?? Briefcase;
                          const isSelected =
                            formData.industryId === industry.id;
                          return (
                            <button
                              key={industry.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => selectIndustry(industry)}
                              className={`relative min-h-48 rounded-2xl border p-5 text-left transition ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100"
                                  : `border-slate-200 ${visual?.surface ?? "bg-slate-50/60 hover:border-blue-200"} hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-950/5`
                              }`}
                            >
                              <span
                                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : visual?.iconTone ??
                                      "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              {isSelected && (
                                <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                                  <Check className="h-4 w-4" />
                                </span>
                              )}
                              <h2 className="mt-6 font-extrabold text-slate-950">
                                {industry.name}
                              </h2>
                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {visual?.description ??
                                  "Career guidance from experienced professionals"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div>
                        {isDependentLoading ? (
                          <div className="flex min-h-56 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          </div>
                        ) : (
                          <>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {goals.map((goal) => {
                                const isSelected = formData.goals?.includes(
                                  goal.name
                                );
                                return (
                                  <button
                                    key={goal.id}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => toggleGoal(goal)}
                                    className={`flex min-h-16 items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${
                                      isSelected
                                        ? "border-blue-500 bg-blue-50 text-blue-900"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="font-semibold">
                                      {goal.name}
                                    </span>
                                    <span
                                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                                        isSelected
                                          ? "border-blue-600 bg-blue-600 text-white"
                                          : "border-slate-300 bg-white text-transparent"
                                      }`}
                                    >
                                      <Check className="h-4 w-4" />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            <p className="mt-5 text-sm text-slate-500">
                              {formData.goals?.length
                                ? `${formData.goals.length} goal${formData.goals.length === 1 ? "" : "s"} selected`
                                : "Choose at least one goal to continue."}
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-8">
                        <fieldset>
                          <legend className="text-sm font-extrabold text-slate-900">
                            Highest qualification
                          </legend>
                          <p className="mt-1 text-sm text-slate-500">
                            Choose the closest option.
                          </p>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {qualifications.map((qualification) => {
                              const isSelected =
                                formData.educationLevelId === qualification.id;
                              return (
                                <button
                                  key={qualification.id}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() =>
                                    setFormData((current) => ({
                                      ...current,
                                      educationLevel: qualification.name,
                                      educationLevelId: qualification.id,
                                    }))
                                  }
                                  className={`flex min-h-14 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-50 text-blue-900"
                                      : "border-slate-200 text-slate-700 hover:border-blue-200"
                                  }`}
                                >
                                  {qualificationLabel(qualification)}
                                  {isSelected && (
                                    <Check className="h-4 w-4 shrink-0 text-blue-600" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>

                        <fieldset>
                          <legend className="text-sm font-extrabold text-slate-900">
                            Experience level
                          </legend>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {experienceLevels.map((level) => {
                              const isSelected =
                                formData.experienceLevel === level.value;
                              return (
                                <button
                                  key={level.value}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() =>
                                    setFormData((current) => ({
                                      ...current,
                                      experienceLevel: level.value,
                                    }))
                                  }
                                  className={`rounded-xl border px-4 py-3 text-left transition ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-slate-200 hover:border-blue-200"
                                  }`}
                                >
                                  <span className="flex items-center justify-between gap-3">
                                    <span className="font-bold text-slate-900">
                                      {level.label}
                                    </span>
                                    {isSelected && (
                                      <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                  </span>
                                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                                    {level.helper}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>

                        <div>
                          <label
                            htmlFor="job-role"
                            className="text-sm font-extrabold text-slate-900"
                          >
                            Current or target role
                          </label>
                          <p className="mt-1 text-sm text-slate-500">
                            This determines the seniority of mentors shown first.
                          </p>
                          <div className="relative mt-4">
                            <select
                              id="job-role"
                              value={formData.jobRoleId ?? ""}
                              onChange={(event) => {
                                const role = jobRoles.find(
                                  (item) => item.id === Number(event.target.value)
                                );
                                setFormData((current) => ({
                                  ...current,
                                  jobRole: role?.name ?? "",
                                  jobRoleId: role?.id,
                                }));
                              }}
                              className="field-control appearance-none pr-10"
                              disabled={isDependentLoading}
                            >
                              <option value="">Select a role</option>
                              {jobRoles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                            <ChevronRight className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
                          </div>
                        </div>

                        {selectedQualification && (
                          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-blue-900">
                            <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                            <p>
                              We’ll use{" "}
                              <strong>
                                {qualificationLabel(selectedQualification)}
                              </strong>
                              , your role, and experience level to prioritise
                              relevant mentors—not to limit who you can browse.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 bg-gradient-to-r from-blue-50/60 via-white to-violet-50/60 px-6 py-5 sm:px-8">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep === 1) {
                          handleExit();
                        } else {
                          setCurrentStep((step) => step - 1);
                        }
                      }}
                      className="btn-secondary"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {currentStep === 1 ? "Back home" : "Back"}
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={
                        !canProceed ||
                        (currentStep > 1 && isDependentLoading)
                      }
                      className="btn-primary"
                    >
                      {currentStep === 3 ? "See mentor matches" : "Continue"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

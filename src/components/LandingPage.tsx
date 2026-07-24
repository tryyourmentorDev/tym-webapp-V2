import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarCheck2,
  Check,
  Code2,
  LineChart,
  MessageSquareText,
  MousePointerClick,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface LandingPageProps {
  onGetStarted: () => void;
}

const journeySteps = [
  {
    number: "01",
    title: "Tell us where you’re headed",
    description:
      "Share your field, experience, and the outcome you want from mentorship.",
  },
  {
    number: "02",
    title: "Meet relevant professionals",
    description:
      "Explore mentors selected for your role, goals, and level of experience.",
  },
  {
    number: "03",
    title: "Book a focused session",
    description:
      "Choose a live time slot and arrive with a clear agenda for your session.",
  },
];

const platformBenefits = [
  {
    icon: BadgeCheck,
    title: "Practitioner-led guidance",
    description:
      "Learn from professionals with hands-on experience in the work you want to do.",
  },
  {
    icon: CalendarCheck2,
    title: "Availability you can act on",
    description:
      "See open time slots and reserve a one-to-one session without back-and-forth.",
  },
  {
    icon: MessageSquareText,
    title: "Sessions built around you",
    description:
      "Bring an interview, career decision, technical challenge, or growth plan.",
  },
];

const tracks = [
  {
    icon: Code2,
    title: "Software Engineering",
    description: "Architecture, backend, cloud, leadership, and career growth.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Engineering",
    description: "Automation, testing strategy, CI/CD, and quality leadership.",
  },
  {
    icon: LineChart,
    title: "Business Analysis",
    description: "Discovery, stakeholder management, delivery, and progression.",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const tourVideoRef = useRef<HTMLVideoElement>(null);
  const [isTourPlaying, setIsTourPlaying] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      tourVideoRef.current?.pause();
      setIsTourPlaying(false);
    }
  }, []);

  const toggleTourPlayback = () => {
    const video = tourVideoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      setIsTourPlaying(true);
    } else {
      video.pause();
      setIsTourPlaying(false);
    }
  };

  return (
    <div className="page-shell overflow-hidden bg-white">
      <header className="app-header">
        <div className="container-shell flex h-[72px] items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3"
            aria-label="Try Your Mentor home"
          >
            <BrandLogo />
          </button>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#how-it-works" className="transition hover:text-slate-950">
              How it works
            </a>
            <a href="#mentor-network" className="transition hover:text-slate-950">
              Mentor network
            </a>
            <a href="#why-tym" className="transition hover:text-slate-950">
              Why TYM
            </a>
          </nav>

          <button
            type="button"
            onClick={onGetStarted}
            className="btn-primary min-h-10 px-4 text-sm"
          >
            Find a mentor
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </header>

      <main>
        <section className="relative isolate border-b border-slate-100 bg-gradient-to-br from-blue-50 via-white to-violet-50/70 py-16 sm:py-20 lg:py-24">
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-dot-grid opacity-60 lg:block" />
          <div className="container-shell grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <div className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Practical one-to-one mentorship
              </div>
              <h1 className="mt-6 text-balance text-4xl font-black leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                Get unstuck with guidance from someone who’s{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  done the work.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Find experienced professionals, choose a time that works, and
                turn one focused conversation into your next clear step.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="btn-primary px-6 py-3"
                >
                  Find my mentor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <a href="#how-it-works" className="btn-secondary px-6 py-3">
                  See how it works
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
                {[
                  "Focused career tracks",
                  "Live mentor availability",
                  "No long-term commitment",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-cyan-200/50 blur-3xl" />
              <div className="absolute -right-8 bottom-4 h-52 w-52 rounded-full bg-violet-200/60 blur-3xl" />
              <figure className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-[0_28px_80px_-32px_rgba(30,64,175,0.45)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <MousePointerClick className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-900">
                        See how TYM works
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Real product walkthrough · no audio
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTourPlayback}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    aria-label={
                      isTourPlaying
                        ? "Pause product walkthrough"
                        : "Play product walkthrough"
                    }
                  >
                    {isTourPlaying ? (
                      <Pause className="h-4 w-4" fill="currentColor" />
                    ) : (
                      <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                    )}
                  </button>
                </div>

                <div className="relative overflow-hidden bg-slate-100">
                  <video
                    ref={tourVideoRef}
                    className="aspect-[4/3] w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/images/product-tour-poster.webp"
                    aria-label="A silent walkthrough showing mentor matching, discovery, profile review, and booking"
                    onPlay={() => setIsTourPlaying(true)}
                    onPause={() => setIsTourPlaying(false)}
                  >
                    <source
                      src="/videos/tym-product-tour.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div>

                <figcaption className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-white px-2 py-3 text-center">
                  {[
                    "Set your direction",
                    "Compare mentors",
                    "Choose a time",
                  ].map((step, index) => (
                    <span
                      key={step}
                      className="px-1 text-[10px] font-bold text-slate-600 sm:text-[11px]"
                    >
                      <strong className="mr-1 text-blue-600">
                        {index + 1}.
                      </strong>
                      {step}
                    </span>
                  ))}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-100 bg-white py-8">
          <div className="container-shell grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { value: "Personalised", label: "Matched to your direction" },
              { value: "Live", label: "Mentor availability" },
              { value: "1:1", label: "Advice shaped around your goal" },
            ].map((metric) => (
              <div key={metric.label} className="px-6 py-5 text-center">
                <p className="text-2xl font-black tracking-tight text-slate-950">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-[#f7f9fc] py-20 sm:py-24">
          <div className="container-shell">
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">A clearer way forward</span>
              <h2 className="mt-5 text-balance text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                From question to useful conversation in three steps
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                The experience is designed to reduce browsing and help you book
                with context and confidence.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {journeySteps.map((step) => (
                <article
                  key={step.number}
                  className="surface-card journey-card p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black tracking-[0.18em] text-blue-600">
                      {step.number}
                    </span>
                    <span className="h-px w-20 bg-gradient-to-r from-blue-200 to-transparent" />
                  </div>
                  <h3 className="mt-8 text-xl font-extrabold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="mentor-network" className="bg-white py-20 sm:py-24">
          <div className="container-shell">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <span className="eyebrow">Focused mentor network</span>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Expertise for the decisions that shape your career
                </h2>
              </div>
              <p className="max-w-lg leading-7 text-slate-600">
                Explore focused guidance across software engineering, quality
                engineering, and business analysis.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {tracks.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-extrabold text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why-tym" className="bg-slate-950 py-20 text-white sm:py-24">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                <BarChart3 className="h-3.5 w-3.5" />
                Designed for useful outcomes
              </span>
              <h2 className="mt-5 text-balance text-3xl font-black tracking-tight sm:text-4xl">
                Less generic advice. More direction you can use.
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">
                TYM helps you find the right perspective for a real decision,
                prepare the context, and make the conversation count.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {platformBenefits.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"
                >
                  <Icon className="h-5 w-5 text-blue-300" />
                  <h3 className="mt-5 font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="container-shell">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-12 text-center text-white shadow-2xl shadow-blue-900/20 sm:px-12 sm:py-16">
              <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full border border-white/10" />
              <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border border-white/10" />
              <Star className="mx-auto h-7 w-7 text-blue-100" />
              <h2 className="relative mt-4 text-balance text-3xl font-black tracking-tight sm:text-4xl">
                Your next step can start with one good conversation.
              </h2>
              <p className="relative mx-auto mt-4 max-w-2xl text-lg text-blue-100">
                Build a quick match profile and explore mentors aligned with
                your direction.
              </p>
              <button
                type="button"
                onClick={onGetStarted}
                className="relative mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
              >
                Find my mentor
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#f7f9fc] py-10">
        <div className="container-shell flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo />
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Try Your Mentor. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

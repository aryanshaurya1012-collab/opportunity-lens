"use client";

import { ArrowLeft, ArrowRight, Check, Plus, ShieldCheck, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SAMPLE_PROFILE } from "@/data/sample-profile";
import {
  CATEGORY_PLURAL_LABELS,
  DEGREE_LEVEL_LABELS,
  EXPERIENCE_KIND_LABELS,
  GRADE_SCALE_LABELS,
} from "@/lib/domain/labels";
import { emptyProfile, profileCompletion, validateProfile, type ProfileDraft, type ProfileErrors } from "@/lib/domain/profile";
import {
  DEGREE_LEVELS,
  EXPERIENCE_KINDS,
  FIELDS_OF_STUDY,
  GRADE_SCALES,
  OPPORTUNITY_CATEGORIES,
  type DegreeLevel,
  type Experience,
  type ExperienceKind,
  type FieldOfStudy,
  type GradeScale,
} from "@/lib/domain/types";
import { useUserData } from "@/lib/user-data/use-user-data";
import { cn } from "@/lib/utils";
import { TagInput } from "./tag-input";

type Mode = "wizard" | "edit";

interface Suggestions {
  skills: string[];
  interests: string[];
}

const STEPS = [
  { id: "personal", title: "1. Personal Information", description: "Who you are and where you study. Used for basic identity and location-restricted opportunities." },
  { id: "academics", title: "2. Education & Academic Details", description: "Used to check degree level, academic year and grade thresholds against opportunity criteria." },
  { id: "skills", title: "3. Skills & Interests", description: "Technical competencies and domain interests used for eligibility rules and match recommendations." },
  { id: "experience", title: "4. Projects & Experience", description: "Real-world projects, internships, leadership roles, and research experience used as proof for prerequisites." },
  { id: "preferences", title: "5. Opportunity Preferences", description: "Select which types of opportunities you are actively seeking. Used to prioritise your discover feed." },
  { id: "optional", title: "6. Optional Eligibility Information", description: "Only needed for citizenship- or age-restricted opportunities. Stored securely and strictly in this browser." },
  { id: "review", title: "7. Review & Save", description: "Verify your profile completeness and save to your local browser storage." },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const ERROR_STEP: Record<keyof ProfileErrors, StepId> = {
  fullName: "personal",
  institution: "personal",
  graduationYear: "academics",
  grade: "academics",
  dateOfBirth: "optional",
};

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-foreground text-sm font-medium">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-danger font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function parseOptionalInt(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function ExperienceEditor({
  experience,
  onChange,
  onRemove,
  skillSuggestions,
}: {
  experience: Experience;
  onChange: (next: Experience) => void;
  onRemove: () => void;
  skillSuggestions: string[];
}) {
  const id = useId();
  return (
    <li className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4 md:p-5">
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
        <Field label="Type" htmlFor={`${id}-kind`}>
          <Select value={experience.kind} onValueChange={(value) => onChange({ ...experience, kind: value as ExperienceKind })}>
            <SelectTrigger id={`${id}-kind`} className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {EXPERIENCE_KINDS.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {EXPERIENCE_KIND_LABELS[kind]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Title" htmlFor={`${id}-title`}>
          <Input
            id={`${id}-title`}
            value={experience.title}
            onChange={(event) => onChange({ ...experience, title: event.target.value })}
            placeholder="e.g. Campus events web app"
            className="h-9"
          />
        </Field>
      </div>
      <Field label="Organisation (optional)" htmlFor={`${id}-org`}>
        <Input
          id={`${id}-org`}
          value={experience.organization}
          onChange={(event) => onChange({ ...experience, organization: event.target.value })}
          placeholder="Company, lab, club or 'Personal project'"
          className="h-9"
        />
      </Field>
      <Field label="What did you do? (optional)" htmlFor={`${id}-desc`}>
        <Textarea
          id={`${id}-desc`}
          value={experience.description}
          onChange={(event) => onChange({ ...experience, description: event.target.value })}
          rows={2}
          maxLength={500}
        />
      </Field>
      <TagInput
        label="Skills used"
        values={experience.skills}
        onChange={(skills) => onChange({ ...experience, skills })}
        suggestions={skillSuggestions}
        placeholder="Type a skill and press Enter"
        max={12}
      />
      <div className="flex justify-end pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-danger hover:text-danger/90">
          <Trash2 data-icon="inline-start" /> Remove
        </Button>
      </div>
    </li>
  );
}

function ProfileForm({
  initial,
  mode,
  suggestions,
  currentYear,
}: {
  initial: ProfileDraft;
  mode: Mode;
  suggestions: Suggestions;
  currentYear: number;
}) {
  const router = useRouter();
  const { actions } = useUserData();
  const [draft, setDraft] = useState<ProfileDraft>(initial);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const id = useId();

  const set = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSavedAt(null);
    const errorKey = (key === "sensitive" ? "dateOfBirth" : key) as keyof ProfileErrors;
    setErrors((current) => {
      if (!(errorKey in current)) return current;
      const rest = { ...current };
      delete rest[errorKey];
      return rest;
    });
  };

  const completion = profileCompletion(draft);
  const visible = (step: StepId) => mode === "edit" || STEPS[stepIndex].id === step;

  const save = () => {
    const nextErrors = validateProfile(draft, currentYear);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0] as keyof ProfileErrors | undefined;
    if (firstError) {
      if (mode === "wizard") {
        setStepIndex(STEPS.findIndex((step) => step.id === ERROR_STEP[firstError]));
      } else {
        const targetElement = document.getElementById(`${id}-${firstError}`);
        targetElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    actions.saveProfile({
      ...draft,
      fullName: draft.fullName.trim(),
      institution: draft.institution.trim(),
      experiences: draft.experiences.filter((experience) => experience.title.trim()),
    });
    if (mode === "wizard") {
      router.push("/app?welcome=1");
    } else {
      setSavedAt(Date.now());
    }
  };

  const next = () => {
    if (STEPS[stepIndex].id === "personal") {
      const personalErrors = validateProfile(draft, currentYear);
      const blocking = { fullName: personalErrors.fullName, institution: personalErrors.institution };
      setErrors(blocking);
      if (blocking.fullName || blocking.institution) return;
    }
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  };

  const sectionClass =
    mode === "edit"
      ? "space-y-6 rounded-2xl border border-border/80 bg-card/85 p-6 md:p-8 backdrop-blur-sm shadow-xs transition-shadow"
      : "space-y-6";

  const sectionHeader = (step: (typeof STEPS)[number]) =>
    mode === "edit" ? (
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{step.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
      </div>
    ) : null;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (mode === "wizard" && stepIndex < STEPS.length - 1) next();
        else save();
      }}
      className={cn("space-y-8", mode === "edit" && "pb-32")}
    >
      {/* Wizard Progress or Edit Summary Header */}
      {mode === "wizard" ? (
        <div className="space-y-4 rounded-2xl border border-border/80 bg-card/85 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="text-muted-foreground font-medium">
              Step {stepIndex + 1} of {STEPS.length}
            </p>
            <p className="text-brand tabular-nums font-semibold">{completion.percent}% complete</p>
          </div>
          <Progress value={((stepIndex + 1) / STEPS.length) * 100} aria-label="Onboarding progress" />
          <div className="pt-2">
            <h2 className="text-xl font-bold text-foreground">{STEPS[stepIndex].title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{STEPS[stepIndex].description}</p>
          </div>
          {stepIndex === 0 && (
            <button
              type="button"
              onClick={() => {
                setDraft({ ...SAMPLE_PROFILE });
                setErrors({});
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline pt-2"
            >
              <Wand2 aria-hidden className="size-3.5" /> Fill with a fictional sample profile (for demos)
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/85 p-6 sm:flex-row sm:items-center sm:justify-between backdrop-blur-sm">
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Profile {completion.percent}% complete</p>
            <p className="text-xs text-muted-foreground">
              {completion.missing.length
                ? `Missing: ${completion.missing.join(", ")}`
                : "All fields used by the eligibility engine are complete."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={completion.percent} className="w-36 sm:w-48" aria-label="Profile completion" />
            <button
              type="button"
              onClick={() => {
                setDraft({ ...SAMPLE_PROFILE });
                setErrors({});
                setSavedAt(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline shrink-0"
            >
              <Wand2 aria-hidden className="size-3.5" /> Fill sample data
            </button>
          </div>
        </div>
      )}

      {/* 1. PERSONAL INFORMATION */}
      {visible("personal") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[0])}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor={`${id}-name`} error={errors.fullName}>
              <Input
                id={`${id}-name`}
                value={draft.fullName}
                onChange={(event) => set("fullName", event.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? `${id}-name-error` : undefined}
                className="h-9"
                placeholder="e.g. Alex Morgan"
                required
              />
            </Field>
            <Field label="College / university" htmlFor={`${id}-inst`} error={errors.institution}>
              <Input
                id={`${id}-inst`}
                value={draft.institution}
                onChange={(event) => set("institution", event.target.value)}
                autoComplete="organization"
                aria-invalid={Boolean(errors.institution)}
                aria-describedby={errors.institution ? `${id}-inst-error` : undefined}
                className="h-9"
                placeholder="e.g. Indian Institute of Technology"
                required
              />
            </Field>
            <Field label="Country" htmlFor={`${id}-country`} hint="Used for location-restricted listings.">
              <Input
                id={`${id}-country`}
                value={draft.country}
                onChange={(event) => set("country", event.target.value)}
                autoComplete="country-name"
                className="h-9"
                placeholder="e.g. India"
              />
            </Field>
            <Field label="City (optional)" htmlFor={`${id}-city`}>
              <Input
                id={`${id}-city`}
                value={draft.city}
                onChange={(event) => set("city", event.target.value)}
                autoComplete="address-level2"
                className="h-9"
                placeholder="e.g. Bangalore"
              />
            </Field>
          </div>
        </section>
      )}

      {/* 2. EDUCATION & ACADEMIC DETAILS */}
      {visible("academics") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[1])}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Level of study" htmlFor={`${id}-level`}>
              <Select value={draft.degreeLevel ?? undefined} onValueChange={(value) => set("degreeLevel", value as DegreeLevel)}>
                <SelectTrigger id={`${id}-level`} className="h-9 w-full">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {DEGREE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {DEGREE_LEVEL_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Degree / course" htmlFor={`${id}-degree`} hint="e.g. B.Tech, B.Sc, MBA">
              <Input id={`${id}-degree`} value={draft.degree} onChange={(event) => set("degree", event.target.value)} className="h-9" placeholder="e.g. B.Tech Computer Science" />
            </Field>
            <Field label="Field of study" htmlFor={`${id}-field`}>
              <Select value={draft.fieldOfStudy ?? undefined} onValueChange={(value) => set("fieldOfStudy", value as FieldOfStudy)}>
                <SelectTrigger id={`${id}-field`} className="h-9 w-full">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-72">
                  {FIELDS_OF_STUDY.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Current year of study" htmlFor={`${id}-year`}>
              <Select
                value={draft.academicYear ? String(draft.academicYear) : undefined}
                onValueChange={(value) => set("academicYear", Number(value))}
              >
                <SelectTrigger id={`${id}-year`} className="h-9 w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {[1, 2, 3, 4, 5, 6].map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Expected graduation year" htmlFor={`${id}-grad`} error={errors.graduationYear}>
              <Input
                id={`${id}-grad`}
                inputMode="numeric"
                value={draft.graduationYear ?? ""}
                onChange={(event) => set("graduationYear", parseOptionalInt(event.target.value.replace(/\D/g, "").slice(0, 4)))}
                placeholder={String(currentYear + 2)}
                aria-invalid={Boolean(errors.graduationYear)}
                className="h-9"
              />
            </Field>
            <Field label="CGPA / percentage" htmlFor={`${id}-grade`} error={errors.grade} hint="Leave blank if you prefer; grade requirements will show as missing info.">
              <div className="flex gap-2">
                <Input
                  id={`${id}-grade`}
                  inputMode="decimal"
                  value={draft.grade?.value ?? ""}
                  onChange={(event) => {
                    const raw = event.target.value.replace(/[^\d.]/g, "");
                    set("grade", raw ? { value: Number(raw), scale: draft.grade?.scale ?? "cgpa_10" } : null);
                  }}
                  aria-invalid={Boolean(errors.grade)}
                  className="h-9 w-24"
                  placeholder="8.5"
                />
                <Select
                  value={draft.grade?.scale ?? "cgpa_10"}
                  onValueChange={(value) => draft.grade && set("grade", { ...draft.grade, scale: value as GradeScale })}
                  disabled={!draft.grade}
                >
                  <SelectTrigger className="h-9 flex-1" aria-label="Grade scale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {GRADE_SCALES.map((scale) => (
                      <SelectItem key={scale} value={scale}>
                        {GRADE_SCALE_LABELS[scale]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Field>
          </div>
        </section>
      )}

      {/* 3. SKILLS & INTERESTS */}
      {visible("skills") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[2])}
          <TagInput
            label="Technical skills & tools"
            description="Languages, frameworks and tools you know. Skills added to your projects are also included automatically."
            values={draft.skills}
            onChange={(skills) => set("skills", skills)}
            suggestions={suggestions.skills}
            placeholder="Type a skill and press Enter"
          />
          <TagInput
            label="Areas of interest & domains"
            description="Topics and industries you are passionate about, such as AI, climate, fintech, healthcare, robotics, or design."
            values={draft.interests}
            onChange={(interests) => set("interests", interests)}
            suggestions={suggestions.interests}
            placeholder="e.g. climate, fintech, ai, robotics"
          />
        </section>
      )}

      {/* 4. PROJECTS & EXPERIENCE */}
      {visible("experience") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[3])}
          {draft.experiences.length === 0 && (
            <p className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-4 border border-border/50">
              No entries yet. Without any project or internship entries, experience requirements will show as missing information rather than failing.
            </p>
          )}
          <ul className="space-y-4">
            {draft.experiences.map((experience, index) => (
              <ExperienceEditor
                key={experience.id}
                experience={experience}
                skillSuggestions={suggestions.skills}
                onChange={(nextExperience) =>
                  set(
                    "experiences",
                    draft.experiences.map((item, itemIndex) => (itemIndex === index ? nextExperience : item)),
                  )
                }
                onRemove={() => set("experiences", draft.experiences.filter((_, itemIndex) => itemIndex !== index))}
              />
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              set("experiences", [
                ...draft.experiences,
                { id: crypto.randomUUID(), kind: "project", title: "", organization: "", description: "", skills: [] },
              ])
            }
            disabled={draft.experiences.length >= 15}
            className="w-full sm:w-auto"
          >
            <Plus data-icon="inline-start" /> Add project or experience
          </Button>
        </section>
      )}

      {/* 5. OPPORTUNITY PREFERENCES */}
      {visible("preferences") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[4])}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">Preferred opportunity categories</legend>
            <p className="text-xs text-muted-foreground">
              Select which categories you are looking for. Opportunities in your preferred categories receive an eligibility score boost on the Discover page.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {OPPORTUNITY_CATEGORIES.map((category) => {
                const checkboxId = `${id}-pref-${category}`;
                const checked = draft.preferredCategories.includes(category);
                return (
                  <div
                    key={category}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3.5 transition-colors cursor-pointer",
                      checked ? "border-brand/40 bg-brand/5" : "border-border/60 bg-muted/20 hover:bg-muted/40",
                    )}
                    onClick={() =>
                      set(
                        "preferredCategories",
                        checked
                          ? draft.preferredCategories.filter((item) => item !== category)
                          : [...draft.preferredCategories, category],
                      )
                    }
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      onCheckedChange={() => {}} // Handled by container
                    />
                    <Label htmlFor={checkboxId} className="font-medium text-foreground cursor-pointer text-sm">
                      {CATEGORY_PLURAL_LABELS[category]}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </section>
      )}

      {/* 6. OPTIONAL ELIGIBILITY INFORMATION */}
      {visible("optional") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[5])}
          <div className="flex gap-3.5 rounded-xl border border-border/80 bg-muted/30 p-4 text-sm leading-relaxed">
            <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
            <p className="text-muted-foreground">
              Certain prestigious opportunities require specific citizenship or age criteria. These details are completely optional,
              used strictly for deterministic rule verification, and stored solely on your device.
            </p>
          </div>
          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id={`${id}-consent`}
              checked={draft.sensitive !== null}
              onCheckedChange={(checked) =>
                set(
                  "sensitive",
                  checked ? { consentGivenAt: new Date().toISOString(), citizenship: null, dateOfBirth: null } : null,
                )
              }
            />
            <Label htmlFor={`${id}-consent`} className="leading-snug font-normal text-foreground/90 text-sm cursor-pointer">
              I consent to OpportunityLens storing my citizenship and date of birth for eligibility checks in this browser.
            </Label>
          </div>
          {draft.sensitive && (
            <div className="grid gap-5 sm:grid-cols-2 pt-2 animate-in fade-in-50 duration-200">
              <Field label="Citizenship" htmlFor={`${id}-citizenship`}>
                <Input
                  id={`${id}-citizenship`}
                  value={draft.sensitive.citizenship ?? ""}
                  onChange={(event) =>
                    draft.sensitive && set("sensitive", { ...draft.sensitive, citizenship: event.target.value || null })
                  }
                  className="h-9"
                  placeholder="e.g. Indian"
                />
              </Field>
              <Field label="Date of birth" htmlFor={`${id}-dob`} error={errors.dateOfBirth}>
                <Input
                  id={`${id}-dob`}
                  type="date"
                  value={draft.sensitive.dateOfBirth ?? ""}
                  onChange={(event) =>
                    draft.sensitive && set("sensitive", { ...draft.sensitive, dateOfBirth: event.target.value || null })
                  }
                  aria-invalid={Boolean(errors.dateOfBirth)}
                  className="h-9"
                />
              </Field>
            </div>
          )}
        </section>
      )}

      {/* 7. REVIEW & SAVE (In natural document flow) */}
      {visible("review") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[6])}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Eligibility Evidence Readiness</span>
              <span className="font-bold text-brand">{completion.percent}%</span>
            </div>
            <Progress value={completion.percent} aria-label="Evidence readiness" />

            {completion.missing.length > 0 ? (
              <div className="rounded-xl border border-warning/30 bg-warning-soft p-4 text-xs text-muted-foreground space-y-1.5">
                <p className="font-semibold text-warning">Recommended details to add for complete match coverage:</p>
                <p>{completion.missing.join(" · ")}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft p-4 text-xs text-success font-medium">
                <Check className="size-4" /> All essential eligibility fields are filled! Your profile is ready for maximum matching.
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {savedAt ? (
                  <span className="text-success font-medium flex items-center gap-1.5">
                    <Check className="size-4" /> Profile saved successfully to local storage.
                  </span>
                ) : Object.keys(errors).length ? (
                  <span className="text-danger font-medium">
                    Please correct the highlighted fields above.
                  </span>
                ) : (
                  "Changes are stored in your browser's private local storage."
                )}
              </p>
              <Button type="button" onClick={save} size="lg" className="h-10 px-6 font-semibold w-full sm:w-auto">
                <Sparkles className="size-4 mr-2" /> Save profile
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Wizard Footer or Edit Sticky Footer */}
      {mode === "wizard" ? (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            disabled={stepIndex === 0}
          >
            <ArrowLeft data-icon="inline-start" /> Back
          </Button>
          <div className="flex items-center gap-2">
            {stepIndex >= 2 && stepIndex < STEPS.length - 1 && (
              <Button type="button" variant="ghost" onClick={save}>
                Finish later
              </Button>
            )}
            <Button type="submit" size="lg" className="h-10 px-5">
              {stepIndex === STEPS.length - 1 ? (
                <>
                  Save and see matches <Check data-icon="inline-end" />
                </>
              ) : (
                <>
                  Continue <ArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="sticky bottom-0 -mx-4 z-30 flex items-center justify-between gap-4 border-t border-border/80 bg-background/95 px-6 py-4 backdrop-blur-md shadow-lg md:-mx-8 md:px-8">
          <p className="text-xs text-muted-foreground truncate" aria-live="polite">
            {savedAt ? (
              <span className="text-success font-medium flex items-center gap-1.5">
                <Check className="size-3.5" /> Profile saved.
              </span>
            ) : Object.keys(errors).length ? (
              <span className="text-danger font-medium">Fix the highlighted fields.</span>
            ) : (
              `${completion.percent}% complete · Auto-persisted in local storage`
            )}
          </p>
          <Button type="submit" size="lg" className="h-10 px-6 shrink-0 font-medium">
            Save profile
          </Button>
        </div>
      )}
    </form>
  );
}

export function ProfileEditor({ mode, suggestions }: { mode: Mode; suggestions: Suggestions }) {
  const { ready, data } = useUserData();
  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-muted/60" aria-busy="true" aria-label="Loading profile" />;
  }
  return (
    <ProfileForm
      initial={data.profile ? { ...data.profile } : emptyProfile()}
      mode={mode}
      suggestions={suggestions}
      currentYear={new Date().getFullYear()}
    />
  );
}

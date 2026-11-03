"use client";

import { ArrowLeft, ArrowRight, Check, Plus, ShieldCheck, Trash2, Wand2 } from "lucide-react";
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
  { id: "about", title: "About you", description: "Who you are and where you study." },
  { id: "academics", title: "Academics", description: "Used to check level, year and grade requirements." },
  { id: "skills", title: "Skills & interests", description: "Used for skill requirements and recommendations." },
  { id: "experience", title: "Projects & experience", description: "Evidence for experience requirements." },
  { id: "optional", title: "Optional eligibility details", description: "Only needed for citizenship- or age-restricted listings." },
] as const;
type StepId = (typeof STEPS)[number]["id"];

const ERROR_STEP: Record<keyof ProfileErrors, StepId> = {
  fullName: "about",
  institution: "about",
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
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-danger" role="alert">
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
    <li className="space-y-4 rounded-lg border border-border p-4">
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
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-danger">
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
      if (mode === "wizard") setStepIndex(STEPS.findIndex((step) => step.id === ERROR_STEP[firstError]));
      return;
    }
    actions.saveProfile({
      ...draft,
      fullName: draft.fullName.trim(),
      institution: draft.institution.trim(),
      experiences: draft.experiences.filter((experience) => experience.title.trim()),
    });
    if (mode === "wizard") router.push("/app?welcome=1");
    else setSavedAt(Date.now());
  };

  const next = () => {
    if (STEPS[stepIndex].id === "about") {
      const aboutErrors = validateProfile(draft, currentYear);
      const blocking = { fullName: aboutErrors.fullName, institution: aboutErrors.institution };
      setErrors(blocking);
      if (blocking.fullName || blocking.institution) return;
    }
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  };

  const sectionClass = mode === "edit" ? "space-y-5 rounded-lg border border-border bg-card p-5 md:p-6" : "space-y-5";

  const sectionHeader = (step: (typeof STEPS)[number]) =>
    mode === "edit" ? (
      <div>
        <h2 className="font-semibold">{step.title}</h2>
        <p className="text-sm text-muted-foreground">{step.description}</p>
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
      className="space-y-6"
    >
      {mode === "wizard" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="text-muted-foreground">
              Step {stepIndex + 1} of {STEPS.length}
            </p>
            <p className="text-muted-foreground tabular-nums">{completion.percent}% complete</p>
          </div>
          <Progress value={((stepIndex + 1) / STEPS.length) * 100} aria-label="Onboarding progress" />
          <div>
            <h2 className="text-xl font-semibold">{STEPS[stepIndex].title}</h2>
            <p className="text-sm text-muted-foreground">{STEPS[stepIndex].description}</p>
          </div>
          {stepIndex === 0 && (
            <button
              type="button"
              onClick={() => {
                setDraft({ ...SAMPLE_PROFILE });
                setErrors({});
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
            >
              <Wand2 aria-hidden className="size-3.5" /> Fill with a fictional sample profile (for demos)
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Profile {completion.percent}% complete</p>
            <p className="text-xs text-muted-foreground">
              {completion.missing.length ? `Missing: ${completion.missing.join(", ")}` : "Everything the eligibility engine uses is filled in."}
            </p>
          </div>
          <Progress value={completion.percent} className="sm:w-48" aria-label="Profile completion" />
        </div>
      )}

      {visible("about") && (
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
              />
            </Field>
            <Field label="City (optional)" htmlFor={`${id}-city`}>
              <Input
                id={`${id}-city`}
                value={draft.city}
                onChange={(event) => set("city", event.target.value)}
                autoComplete="address-level2"
                className="h-9"
              />
            </Field>
          </div>
        </section>
      )}

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
              <Input id={`${id}-degree`} value={draft.degree} onChange={(event) => set("degree", event.target.value)} className="h-9" />
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
            <Field label="CGPA / percentage" htmlFor={`${id}-grade`} error={errors.grade} hint="Leave blank if you prefer; grade requirements will show as missing information.">
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

      {visible("skills") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[2])}
          <TagInput
            label="Skills"
            description="Languages, tools and abilities. Skills from your projects are counted automatically."
            values={draft.skills}
            onChange={(skills) => set("skills", skills)}
            suggestions={suggestions.skills}
            placeholder="Type a skill and press Enter"
          />
          <TagInput
            label="Areas of interest"
            values={draft.interests}
            onChange={(interests) => set("interests", interests)}
            suggestions={suggestions.interests}
            placeholder="e.g. climate, fintech, ai"
          />
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Preferred opportunity types</legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {OPPORTUNITY_CATEGORIES.map((category) => {
                const checkboxId = `${id}-pref-${category}`;
                const checked = draft.preferredCategories.includes(category);
                return (
                  <div key={category} className="flex items-center gap-2.5">
                    <Checkbox
                      id={checkboxId}
                      checked={checked}
                      onCheckedChange={() =>
                        set(
                          "preferredCategories",
                          checked
                            ? draft.preferredCategories.filter((item) => item !== category)
                            : [...draft.preferredCategories, category],
                        )
                      }
                    />
                    <Label htmlFor={checkboxId} className="font-normal">
                      {CATEGORY_PLURAL_LABELS[category]}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </section>
      )}

      {visible("experience") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[3])}
          {draft.experiences.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No entries yet. Without any, experience requirements show as missing information rather than failing.
            </p>
          )}
          <ul className="space-y-3">
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
          >
            <Plus data-icon="inline-start" /> Add project or experience
          </Button>
        </section>
      )}

      {visible("optional") && (
        <section className={sectionClass}>
          {sectionHeader(STEPS[4])}
          <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
            <p className="text-muted-foreground">
              Some opportunities are restricted by citizenship or age. These details are optional, are only used to
              check those requirements, and in demo mode never leave this browser. You can remove them at any time.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
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
            <Label htmlFor={`${id}-consent`} className="leading-snug font-normal">
              I consent to OpportunityLens storing my citizenship and date of birth for eligibility checks.
            </Label>
          </div>
          {draft.sensitive && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Citizenship" htmlFor={`${id}-citizenship`}>
                <Input
                  id={`${id}-citizenship`}
                  value={draft.sensitive.citizenship ?? ""}
                  onChange={(event) =>
                    draft.sensitive && set("sensitive", { ...draft.sensitive, citizenship: event.target.value || null })
                  }
                  className="h-9"
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
        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur md:-mx-8 md:px-8">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {savedAt ? "Profile saved." : Object.keys(errors).length ? "Fix the highlighted fields." : ""}
          </p>
          <Button type="submit" size="lg" className="h-10 px-5">
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
    return <div className="h-96 animate-pulse rounded-lg bg-muted" aria-busy="true" aria-label="Loading profile" />;
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

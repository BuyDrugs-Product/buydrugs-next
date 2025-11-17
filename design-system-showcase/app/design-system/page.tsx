"use client";

import { useState } from "react";
import { Avatar, AvatarGroup } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Calendar } from "@/components/Calendar";
import { Card } from "@/components/Card";
import { Checkbox } from "@/components/Checkbox";
import { Chip } from "@/components/Chip";
import { ListItem } from "@/components/ListItem";
import { NotificationItem } from "@/components/NotificationItem";
import { ProgressRing } from "@/components/ProgressRing";
import { RadioGroup } from "@/components/RadioGroup";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SelectField } from "@/components/SelectField";
import { TextAreaField } from "@/components/TextAreaField";
import { TextField } from "@/components/TextField";
import { Toggle } from "@/components/Toggle";
import { cn } from "@/lib/cn";

const viewSegments = [
  { value: "overview", label: "Overview" },
  { value: "tasks", label: "Tasks" },
  { value: "files", label: "Files" },
];

const planOptions = [
  { value: "starter", label: "Starter", description: "Up to 5 collaborators" },
  { value: "growth", label: "Growth", description: "Unlimited teammates" },
  { value: "enterprise", label: "Enterprise", description: "SAML + support" },
];

type Notification = {
  id: string;
  avatar: { initials?: string; src?: string; alt?: string };
  name: string;
  message: string;
  time: string;
};

const initialNotifications: Notification[] = [
  { id: "1", avatar: { initials: "JD" }, name: "John Doe", message: "wants to join your project", time: "2m" },
  { id: "2", avatar: { initials: "SK" }, name: "Sarah Kim", message: "invited you to collaborate", time: "1h" },
];

export default function DesignSystemShowcase() {
  const [activeView, setActiveView] = useState("overview");
  const [selectedRange, setSelectedRange] = useState<{
    start?: Date;
    end?: Date;
  }>({
    start: new Date(2025, 10, 11),
    end: new Date(2025, 10, 17),
  });
  const [plan, setPlan] = useState("starter");
  const [industry, setIndustry] = useState("design");
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const handleAcceptNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDenyNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Sprint goals state (drives GoalRow interactivity and progress ring)
  type Goal = { id: string; label: string; status: "done" | "pending" };
  const [goals, setGoals] = useState<Goal[]>([
    { id: "g1", label: "Design system implementation", status: "done" },
    { id: "g2", label: "Component library setup", status: "done" },
    { id: "g3", label: "Dashboard integration", status: "pending" },
  ]);

  const completedGoalsCount = goals.filter((g) => g.status === "done").length;
  const goalsProgress = Math.round((completedGoalsCount / goals.length) * 100);

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, status: g.status === "done" ? "pending" : "done" } : g
      )
    );
  };

  return (
    <main className="min-h-screen bg-(--surface-app) px-6 py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-(--text-tertiary)">
            buy-drugs Dashboard
          </span>
          <h1 className="mt-3 text-4xl font-semibold text-(--text-primary)">
            Design System Showcase
          </h1>
          <p className="mt-2 text-sm text-(--text-secondary)">
            Tokens, patterns, and polished UI primitives crafted for a modern,
            friendly product experience.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 xl:gap-8">
          <Card className="col-span-12 md:col-span-6 lg:col-span-4" interactive>
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar size="lg" initials="AM" tone="brand" />
                <div>
                  <h3 className="text-xl font-semibold text-(--text-primary)">
                    Alex Morgan
                  </h3>
                  <p className="text-sm text-(--text-secondary)">
                    Product Designer
                  </p>
                </div>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-sm transition hover:bg-(--surface-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)">
                <KebabIcon />
              </button>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              <Chip label="Design" variant="brand" />
              <Chip label="UI/UX" variant="tag" />
              <Chip label="Figma" variant="outline" />
            </div>
            <Button variant="primary" fullWidth>
              View Profile
            </Button>
          </Card>

          <Card className="col-span-12 md:col-span-6 lg:col-span-4" interactive>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-(--text-primary)">
                Notifications
              </h3>
              <Badge count={notifications.length} variant="brand" />
            </div>
            <div className="space-y-2.5">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  avatar={n.avatar}
                  name={n.name}
                  message={n.message}
                  time={n.time}
                  onAccept={() => handleAcceptNotification(n.id)}
                  onDeny={() => handleDenyNotification(n.id)}
                  onMenuAction={(action) => {
                    if (action === "delete") {
                      handleDenyNotification(n.id);
                    }
                  }}
                />
              ))}
              {notifications.length === 0 && (
                <div className="rounded-md bg-(--surface-muted) px-5 py-6 text-sm text-(--text-secondary)">
                  You're all caught up.
                </div>
              )}
            </div>
          </Card>

          <Card className="col-span-12 md:col-span-6 lg:col-span-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-(--text-tertiary)">
                  Schedule
                </span>
                <h3 className="mt-2 text-lg font-semibold text-(--text-primary)">
                  November 2025
                </h3>
              </div>
              <Badge
                count={
                  selectedRange.start && selectedRange.end
                    ? `${selectedRange.start.getDate()}−${selectedRange.end.getDate()}`
                    : "Select"
                }
                variant="neutral"
              />
            </div>
            <Calendar
              selectionMode="range"
              selectedRange={selectedRange}
              onRangeSelect={setSelectedRange}
              highlightedDates={[new Date(2025, 10, 13), new Date(2025, 10, 24)]}
            />
          </Card>

          <Card className="col-span-12 md:col-span-6 lg:col-span-4" interactive>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-(--text-tertiary)">
                  Product
                </span>
                <h3 className="mt-1 text-lg font-semibold text-(--text-primary)">
                  Mobile App
                </h3>
                <p className="text-sm text-(--text-secondary)">
                  Development · Due Dec 15, 2024
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip label="iOS" variant="neutral" />
                  <Chip label="Android" variant="outline" />
                  <Chip label="On track" variant="brand" />
                </div>
              </div>
              <ProgressRing progress={75} size={56} thickness={7} status="brand" />
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg bg-(--surface-muted) p-4">
              <div>
                <span className="text-xs text-(--text-secondary)">Tasks completed</span>
                <div className="mt-1 text-base font-semibold text-(--text-primary)">24 / 32</div>
              </div>
              <div>
                <span className="text-xs text-(--text-secondary)">Design QA</span>
                <div className="mt-1 text-base font-semibold text-(--text-primary)">85%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AvatarGroup
                  avatars={[
                    { initials: "AM" },
                    { initials: "JD" },
                    { initials: "SK" },
                    { initials: "TL" },
                    { initials: "HS" },
                  ]}
                  size="sm"
                  maxVisible={4}
                />
                <span className="text-sm text-(--text-secondary)">
                  +12 contributors
                </span>
              </div>
              <Button variant="primary" size="sm">
                View Brief
              </Button>
            </div>
          </Card>

          <Card className="col-span-12 md:col-span-6 lg:col-span-4" interactive>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-(--text-tertiary)">
                  Sprint Goals
                </span>
                <h3 className="mt-1 text-lg font-semibold text-(--text-primary)">
                  Q4 Implementation
                </h3>
              </div>
              <ProgressRing progress={goalsProgress} size={56} thickness={7} status="success" />
            </div>
            <div className="space-y-3">
              {goals.map((g) => (
                <GoalRow
                  key={g.id}
                  icon={g.status === "done" ? <CheckIcon /> : <CircleIcon />}
                  label={g.label}
                  status={g.status}
                  onToggle={() => toggleGoal(g.id)}
                />
              ))}
            </div>
            <Button variant="secondary" fullWidth className="mt-6">
              View All Tasks
            </Button>
          </Card>

          <Card className="col-span-12 md:col-span-6 lg:col-span-4">
            <h3 className="mb-5 text-lg font-semibold text-(--text-primary)">
              Integrations
            </h3>
            <div className="space-y-3">
              <ListItem
                leading={
                  <BrandGlyph label="S" className="bg-[rgba(89,71,255,0.1)] text-(--text-brand)" />
                }
                title="Slack"
                subtitle="Team communication"
                trailing={<Toggle defaultChecked label="Slack" />}
              />
              <ListItem
                leading={
                  <BrandGlyph label="G" className="bg-(--surface-muted) text-(--text-secondary)" />
                }
                title="GitHub"
                subtitle="Code repository"
                trailing={<Toggle defaultChecked label="GitHub" />}
              />
              <ListItem
                leading={
                  <BrandGlyph label="F" className="bg-[rgba(18,183,106,0.1)] text-(--text-success)" />
                }
                title="Figma"
                subtitle="Design tool"
                trailing={<Toggle label="Figma" />}
              />
            </div>
          </Card>

          <Card className="col-span-12" surface="elevated" elevation="md">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-2xl font-semibold text-(--text-primary)">
                  Component Library
                </h3>
                <SegmentedControl
                  value={activeView}
                  onChange={setActiveView}
                  options={viewSegments}
                  ariaLabel="Component view filter"
                  size="sm"
                />
              </div>

              <section>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-(--text-tertiary)">
                  Buttons
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">
                    <CheckIcon />
                    Success
                  </Button>
                  <Button variant="primary" size="sm">
                    Small
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    icon={<SparkleIcon />}
                    aria-label="Create"
                  />
                </div>
              </section>

              <section>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-(--text-tertiary)">
                  Form Inputs
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Project name"
                    placeholder="buy-drugs Dashboard"
                    helperText="Visible to collaborators"
                  />
                  <TextField
                    label="Owner email"
                    placeholder="alex@buy-drugs.studio"
                    type="email"
                    trailingIcon={<MailIcon />}
                  />
                  <SelectField
                    label="Industry focus"
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                    options={[
                      { value: "design", label: "Design & Creative" },
                      { value: "product", label: "Product & UX" },
                      { value: "marketing", label: "Marketing & Growth" },
                    ]}
                  />
                  <TextField
                    label="Website"
                    placeholder="https://"
                    state="error"
                    errorText="Please provide a valid URL"
                  />
                  <TextAreaField
                    label="Success definition"
                    placeholder="Share context, goals, or constraints for the sprint..."
                    helperText="Keep it concise and actionable."
                    minRows={4}
                    className="md:col-span-2"
                  />
                </div>
              </section>

              <section>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-(--text-tertiary)">
                  Selection Controls
                </h4>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-3 rounded-lg bg-(--surface-muted) p-5">
                    <span className="text-sm font-semibold text-(--text-primary)">
                      Permissions
                    </span>
                    <Checkbox
                      label="Can edit components"
                      description="Full write access to the library"
                      defaultChecked
                    />
                    <Checkbox
                      label="Can manage tokens"
                      description="Allow updating design tokens"
                    />
                    <Toggle label="Notify via email" defaultChecked />
                  </div>
                  <div className="flex flex-col gap-4 rounded-lg bg-(--surface-muted) p-5">
                    <span className="text-sm font-semibold text-(--text-primary)">
                      Billing plan
                    </span>
                    <RadioGroup
                      name="billing-plan"
                      options={planOptions}
                      value={plan}
                      onChange={(val) => setPlan(val)}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-(--text-tertiary)">
                  Data & Status
                </h4>
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-(--surface-muted) p-5">
                    <ProgressRing progress={25} status="brand" />
                    <span className="text-sm text-(--text-secondary)">
                      Design
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-(--surface-muted) p-5">
                    <ProgressRing progress={50} status="info" />
                    <span className="text-sm text-(--text-secondary)">
                      Research
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-(--surface-muted) p-5">
                    <ProgressRing progress={75} status="success" />
                    <span className="text-sm text-(--text-secondary)">
                      Development
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-(--surface-muted) p-5">
                    <ProgressRing progress={100} status="danger" />
                    <span className="text-sm text-(--text-secondary)">
                      QA
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Badge count="New" variant="brand" />
                  <Badge count="12" variant="success" />
                  <Badge count="99+" variant="danger" />
                  <Chip label="Design" variant="brand" />
                  <Chip label="Support" variant="neutral" />
                  <Chip label="Marketing" variant="tag" />
                </div>
              </section>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

const KebabIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SparkleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
    <path d="M5 18l.9 2.3L8 21l-2.1.7L5 24l-.9-2.3L2 21l2.1-.7L5 18z" />
  </svg>
);

const CircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
  </svg>
);

const MailIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16v16H4z" />
    <polyline points="4 4 12 12 20 4" />
  </svg>
);

const BrandGlyph = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}) => (
  <span
    className={cn(
      "flex h-10 w-10 items-center justify-center rounded-md font-semibold",
      className
    )}
  >
    {label}
  </span>
);

const GoalRow = ({
  icon,
  label,
  status,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  status: "done" | "pending";
  onToggle?: () => void;
}) => (
  <div
    className="flex items-center gap-3 rounded-md bg-(--surface-muted) px-4 py-3 cursor-pointer select-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-elevated)"
    role="checkbox"
    aria-checked={status === "done"}
    tabIndex={0}
    onClick={onToggle}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle?.();
      }
    }}
  >
    <span
      className={
        status === "done"
          ? "text-(--text-success)"
          : "text-(--text-tertiary)"
      }
    >
      {icon}
    </span>
    <span
      className={
        status === "done"
          ? "text-sm font-semibold text-(--text-primary)"
          : "text-sm text-(--text-secondary)"
      }
    >
      {label}
    </span>
  </div>
);

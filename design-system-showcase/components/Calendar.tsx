import React, { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

type SelectionMode = "single" | "range";

interface DateRange {
  start?: Date;
  end?: Date;
}

interface CalendarProps {
  selectionMode?: SelectionMode;
  selectedDate?: Date;
  selectedRange?: DateRange;
  onDateSelect?: (date: Date) => void;
  onRangeSelect?: (range: DateRange) => void;
  highlightedDates?: Date[];
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const isSameDay = (a?: Date | null, b?: Date | null) => {
  if (!a || !b) return false;
  return startOfDay(a).getTime() === startOfDay(b).getTime();
};

const isDayBetween = (day: Date, start?: Date, end?: Date) => {
  if (!start || !end) return false;
  const target = startOfDay(day).getTime();
  const from = startOfDay(start).getTime();
  const to = startOfDay(end).getTime();
  return target > Math.min(from, to) && target < Math.max(from, to);
};

const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const generateCalendarMatrix = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDayOfMonth.getDay(); i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
};

export const Calendar: React.FC<CalendarProps> = ({
  selectionMode = "single",
  selectedDate,
  selectedRange,
  onDateSelect,
  onRangeSelect,
  highlightedDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    startOfDay(selectedDate ?? selectedRange?.start ?? new Date())
  );
  const [internalSelected, setInternalSelected] = useState<Date | undefined>(
    selectedDate
  );
  const [range, setRange] = useState<DateRange>(selectedRange ?? {});

  const today = useMemo(() => startOfDay(new Date()), []);
  const days = useMemo(() => generateCalendarMatrix(currentMonth), [currentMonth]);

  const highlighted = highlightedDates.map(startOfDay);

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const toggleRange = (day: Date) => {
    if (!range.start || (range.start && range.end)) {
      const nextRange = { start: day, end: undefined };
      setRange(nextRange);
      onRangeSelect?.(nextRange);
    } else {
      const startTime = startOfDay(range.start).getTime();
      const endTime = startOfDay(day).getTime();
      const nextRange = {
        start: new Date(Math.min(startTime, endTime)),
        end: new Date(Math.max(startTime, endTime)),
      };
      setRange(nextRange);
      onRangeSelect?.(nextRange);
    }
  };

  const handleDayClick = (day: Date) => {
    if (selectionMode === "range") {
      toggleRange(day);
      return;
    }

    setInternalSelected(day);
    onDateSelect?.(day);
  };

  const isRangeStart = (day: Date) => isSameDay(day, range.start);
  const isRangeEnd = (day: Date) =>
    range.end ? isSameDay(day, range.end) : false;

  const isHighlighted = (day: Date) =>
    highlighted.some((highlight) => isSameDay(highlight, day));

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="xs"
          icon={<ChevronLeft />}
          onClick={handlePreviousMonth}
          aria-label="Previous month"
        />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            {selectionMode === "range"
              ? range.start && range.end
                ? `${formatDate(range.start)} – ${formatDate(range.end)}`
                : "Select a date range"
              : internalSelected
              ? formatDate(internalSelected)
              : "Select a date"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="xs"
          icon={<ChevronRight />}
          onClick={handleNextMonth}
          aria-label="Next month"
        />
      </div>

      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
        {dayNames.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} className="h-10" />;
          }

          const isToday = isSameDay(day, today);
          const selected =
            selectionMode === "range"
              ? isRangeStart(day) || isRangeEnd(day)
              : isSameDay(day, internalSelected);
          const inRange =
            selectionMode === "range"
              ? isDayBetween(day, range.start, range.end)
              : false;
          const weekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-[12px] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-elevated)]",
                selected
                  ? "bg-[var(--surface-app-strong)] text-[var(--text-primary)] border border-[var(--border-strong)]"
                  : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
                inRange
                  ? "bg-[rgba(89,71,255,0.12)] text-[var(--text-brand)]"
                  : "",
                weekend && !selected ? "text-[var(--text-secondary)]" : ""
              )}
              aria-pressed={selected}
              aria-current={isToday ? "date" : undefined}
            >
              {isRangeStart(day) && (
                <span className="absolute left-0 top-0 h-full w-1 rounded-l-full bg-[rgba(89,71,255,0.24)]" />
              )}
              {isRangeEnd(day) && (
                <span className="absolute right-0 top-0 h-full w-1 rounded-r-full bg-[rgba(89,71,255,0.24)]" />
              )}
              <span
                className={cn(
                  "relative z-10",
                  isHighlighted(day) ? "font-bold text-[var(--text-brand)]" : ""
                )}
              >
                {day.getDate()}
              </span>
              {isToday && !selected && (
                <span className="absolute inset-0 rounded-[12px] border border-dashed border-[var(--action-primary)] opacity-60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ChevronLeft = () => (
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
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
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
    <polyline points="9 18 15 12 9 6" />
  </svg>
);


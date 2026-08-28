"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { MONTH_LABELS, WEEKDAY_LABELS } from "../../lib/constants";
import {
  autoFormatDateInput,
  formatFrenchDate,
  parseFrenchDate,
  toISODate,
  todayISO,
} from "../../lib/format";
import { CalendarIcon } from "./icons";

/** Builds a 6-week grid (Monday-first) covering the given month. */
function buildCalendarDays(viewYear: number, viewMonth: number) {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(viewYear, viewMonth, 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i,
    );
    return { date, inMonth: date.getMonth() === viewMonth };
  });
}

/**
 * JJ/MM/AAAA text input backed by a calendar popover.
 * Out-of-range dates are reported through native constraint validation rather
 * than silently rewritten, so the user sees why the value was refused.
 */
export function DatePicker({
  value,
  min,
  max,
  minMessage,
  maxMessage,
  label,
  onValueChange,
}: {
  value: string;
  min?: string;
  max?: string;
  minMessage?: string;
  maxMessage?: string;
  label: string;
  onValueChange: (value: string) => void;
}) {
  const [text, setText] = useState(formatFrenchDate(value));
  const [open, setOpen] = useState(false);
  const initialView = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  /** Returns "" when `parsed` satisfies min/max, otherwise the message to show. */
  const validityMessage = (parsed: string) => {
    if (!parsed) return "Date invalide.";
    if (min && parsed < min) return minMessage ?? "Cette date est trop ancienne.";
    if (max && parsed > max) return maxMessage ?? "Cette date est trop récente.";
    return "";
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.setCustomValidity("");
    const formatted = autoFormatDateInput(event.target.value);
    setText(formatted);
    if (formatted.length === 10) {
      const parsed = parseFrenchDate(formatted);
      const message = validityMessage(parsed);
      event.currentTarget.setCustomValidity(message);
      if (!message) onValueChange(parsed);
    } else if (formatted.length === 0) {
      onValueChange("");
    }
  };

  const commit = (event: FocusEvent<HTMLInputElement>) => {
    if (!text) {
      event.currentTarget.setCustomValidity("");
      return;
    }
    const parsed = parseFrenchDate(text);
    const message = parsed
      ? validityMessage(parsed)
      : "Utilisez le format JJ/MM/AAAA.";
    event.currentTarget.setCustomValidity(message);
    if (!message) onValueChange(parsed);
  };

  const toggleCalendar = () => {
    const base = value ? new Date(`${value}T00:00:00`) : new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpen((current) => !current);
  };

  const changeMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const pickDate = (date: Date) => {
    const iso = toISODate(date);
    setText(formatFrenchDate(iso));
    // Clears any stale validity left over from an earlier invalid keystroke.
    inputRef.current?.setCustomValidity("");
    onValueChange(iso);
    setOpen(false);
    inputRef.current?.focus();
  };

  const days = buildCalendarDays(viewYear, viewMonth);
  const todayIso = todayISO();

  return (
    <div className="date-picker" ref={containerRef}>
      <div className="date-picker-input-row">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="JJ/MM/AAAA"
          maxLength={10}
          aria-label={label}
          value={text}
          onChange={handleChange}
          onBlur={commit}
        />
        <button
          type="button"
          className="date-picker-toggle"
          onClick={toggleCalendar}
          aria-expanded={open}
          aria-label={`Ouvrir le calendrier — ${label}`}
        >
          <CalendarIcon />
        </button>
      </div>
      {open ? (
        <div
          className="date-picker-popover"
          role="dialog"
          aria-label={`Calendrier — ${label}`}
        >
          <div className="date-picker-header">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Mois précédent"
            >
              ‹
            </button>
            <span>
              {MONTH_LABELS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Mois suivant"
            >
              ›
            </button>
          </div>
          <div className="date-picker-weekdays">
            {WEEKDAY_LABELS.map((day, i) => (
              <span key={i}>{day}</span>
            ))}
          </div>
          <div className="date-picker-days">
            {days.map(({ date, inMonth }) => {
              const iso = toISODate(date);
              const disabled = Boolean((min && iso < min) || (max && iso > max));
              const classNames = [
                !inMonth && "outside",
                iso === value && "selected",
                iso === todayIso && "today",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  type="button"
                  key={iso}
                  className={classNames}
                  disabled={disabled}
                  aria-current={iso === todayIso ? "date" : undefined}
                  aria-pressed={iso === value}
                  aria-label={date.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  onClick={() => pickDate(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

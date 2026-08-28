const pad2 = (n: number) => String(n).padStart(2, "0");

/** "1990-05-24" -> "24/05/1990" (empty string passes through). */
export const formatFrenchDate = (value: string) =>
  value ? value.split("-").reverse().join("/") : "";

/** "14:30" -> "14h30" (empty string passes through). */
export const formatFrenchTime = (value: string) =>
  value ? value.replace(":", "h") : "";

export const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const todayISO = () => toISODate(new Date());

export const todayFR = () => formatFrenchDate(todayISO());

/** "24/05/1990" -> "1990-05-24", or "" when the date does not exist. */
export function parseFrenchDate(value: string) {
  const parts = value.split("/");
  if (
    parts.length !== 3 ||
    parts.some((part) => !part || !Number.isInteger(Number(part)))
  )
    return "";
  const [day, month, year] = parts;
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return "";
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
    ? [year, month, day].join("-")
    : "";
}

/** Inserts the "/" separators while the user types a DD/MM/YYYY date. */
export function autoFormatDateInput(rawValue: string) {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 8);
  let formatted = "";
  for (let i = 0; i < digitsOnly.length; i++) {
    if (i === 2 || i === 4) formatted += "/";
    formatted += digitsOnly[i];
  }
  return formatted;
}

/** Inserts the ":" separator while the user types an HH:MM time. */
export function autoFormatTimeInput(rawValue: string) {
  const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 4);
  let formatted = "";
  for (let i = 0; i < digitsOnly.length; i++) {
    if (i === 2) formatted += ":";
    formatted += digitsOnly[i];
  }
  return formatted;
}

export const isValidFrenchTime = (value: string) => {
  const parts = value.split(":");
  return (
    parts.length === 2 &&
    parts[0].length === 2 &&
    parts[1].length === 2 &&
    Number(parts[0]) >= 0 &&
    Number(parts[0]) <= 23 &&
    Number(parts[1]) >= 0 &&
    Number(parts[1]) <= 59
  );
};

export const sanitizeFileNamePart = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, "_") || "devis";

export const formatEuros = (value: number) =>
  value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

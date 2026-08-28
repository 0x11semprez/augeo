"use client";

import { useState, type ChangeEvent, type FocusEvent } from "react";
import { autoFormatTimeInput, isValidFrenchTime } from "../../lib/format";

/**
 * HH:MM text input that inserts the separator as you type.
 * The parent is only notified once the value is complete and valid, so a
 * half-typed time never lands in the form state.
 */
export function FrenchTimeInput({
  value,
  min,
  onValueChange,
}: {
  value: string;
  min?: string;
  onValueChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);

  const validityMessage = (candidate: string) => {
    if (!isValidFrenchTime(candidate)) return "Heure invalide.";
    if (min && candidate < min)
      return "L’heure de départ ne peut pas précéder l’admission.";
    return "";
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.setCustomValidity("");
    const formatted = autoFormatTimeInput(event.target.value);
    setText(formatted);
    if (formatted.length === 5) {
      const message = validityMessage(formatted);
      event.currentTarget.setCustomValidity(message);
      if (!message) onValueChange(formatted);
    } else if (formatted.length === 0) {
      onValueChange("");
    }
  };

  const commit = (event: FocusEvent<HTMLInputElement>) => {
    if (!text) {
      event.currentTarget.setCustomValidity("");
      onValueChange("");
      return;
    }
    const message = isValidFrenchTime(text)
      ? validityMessage(text)
      : "Utilisez le format HH:MM.";
    event.currentTarget.setCustomValidity(message);
    if (!message) onValueChange(text);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder="HH:MM"
      maxLength={5}
      value={text}
      onChange={handleChange}
      onBlur={commit}
    />
  );
}

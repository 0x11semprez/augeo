"use client";

import { useCallback, useState } from "react";
import { initialData } from "../lib/constants";
import type { FormData, SelectedPrestations } from "../lib/types";

/**
 * Owns the devis form state.
 *
 * `updateField` also keeps the chronology coherent: a date or time that would
 * end up before the one it must follow is pushed forward instead of accepted.
 */
export function useDevisForm() {
  const [data, setData] = useState<FormData>(initialData);
  const [selectedPrestations, setSelectedPrestations] =
    useState<SelectedPrestations>({});
  // Remounts the form to clear native validity state and uncontrolled inputs.
  const [formKey, setFormKey] = useState(0);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setData((current) => {
      const next = { ...current, [field]: value };
      if (
        field === "dateNaissance" &&
        next.dateNaissance &&
        next.dateDeces &&
        next.dateDeces < next.dateNaissance
      )
        next.dateDeces = next.dateNaissance;
      if (
        (field === "dateAdmission" || field === "heureAdmission") &&
        next.dateAdmission &&
        next.dateDepart &&
        next.dateDepart < next.dateAdmission
      )
        next.dateDepart = next.dateAdmission;
      if (
        next.dateAdmission === next.dateDepart &&
        next.heureAdmission &&
        next.heureDepart &&
        next.heureDepart < next.heureAdmission
      )
        next.heureDepart = next.heureAdmission;
      return next;
    });
  }, []);

  const toggleMention = useCallback(
    (field: "paiementChequeDepart" | "tresGrand" | "arriveeNuit", on: boolean) =>
      setData((current) => ({ ...current, [field]: on })),
    [],
  );

  const setVilleDeces = useCallback(
    (ville: string) => setData((current) => ({ ...current, villeDeces: ville })),
    [],
  );

  const togglePrestation = useCallback(
    (code: string) =>
      setSelectedPrestations((current) => ({
        ...current,
        [code]: !current[code],
      })),
    [],
  );

  const reset = useCallback(() => {
    setData(initialData);
    setSelectedPrestations({});
    setFormKey((current) => current + 1);
  }, []);

  const selectedCount =
    Object.values(selectedPrestations).filter(Boolean).length;

  return {
    data,
    selectedPrestations,
    selectedCount,
    formKey,
    updateField,
    toggleMention,
    setVilleDeces,
    togglePrestation,
    reset,
  };
}

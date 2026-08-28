"use client";

import { useCallback, useRef, useState } from "react";
import { fetchDevisPdf } from "../lib/api";
import { downloadBlob } from "../lib/download";
import { sanitizeFileNamePart } from "../lib/format";
import type { FormData, SelectedPrestations, Status } from "../lib/types";
import { validateDevis } from "../lib/validation";

/** Generates the devis PDF and hands it to the browser exactly once. */
export function useDevisGeneration() {
  const [status, setStatus] = useState<Status | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State updates are async, so a second submit can slip through before
  // `isSubmitting` re-renders the disabled button. The ref closes that window
  // and guarantees a single fetch — and a single download — per click.
  const inFlight = useRef(false);

  const generateDevis = useCallback(
    async (data: FormData, selectedPrestations: SelectedPrestations) => {
      if (inFlight.current) return false;

      const error = validateDevis(data, selectedPrestations);
      if (error) {
        setStatus({ type: "error", message: error });
        return false;
      }

      const prestations = Object.fromEntries(
        Object.entries(selectedPrestations)
          .filter(([, isSelected]) => isSelected)
          .map(([code]) => [code, 1]),
      );

      inFlight.current = true;
      setIsSubmitting(true);
      setStatus(null);
      try {
        const blob = await fetchDevisPdf(data, prestations);
        const fileName = `devis_${sanitizeFileNamePart(data.nom)}_${sanitizeFileNamePart(data.prenom)}.pdf`;
        downloadBlob(blob, fileName, "application/pdf");
        setStatus({
          type: "success",
          message: "Le devis a été généré et téléchargé.",
        });
        return true;
      } catch (err) {
        setStatus({
          type: "error",
          message:
            err instanceof Error ? err.message : "Une erreur est survenue.",
        });
        return false;
      } finally {
        inFlight.current = false;
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { status, setStatus, isSubmitting, generateDevis };
}

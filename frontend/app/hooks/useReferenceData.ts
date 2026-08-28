"use client";

import { useEffect, useState } from "react";
import { fetchOperateurs, fetchPrestations, fetchVilles } from "../lib/api";
import type { Operateur, Prestation } from "../lib/types";

const EMPTY_VILLES: string[] = [];

/**
 * Loads the catalogues the form depends on.
 *
 * `codePostal` drives the city suggestions, refreshed on every valid 5-digit
 * code; `onSingleVille` fires when a code resolves to exactly one city so the
 * form can fill the field for the user — it must be referentially stable.
 */
export function useReferenceData(
  codePostal: string,
  onSingleVille: (ville: string) => void,
) {
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [operateurs, setOperateurs] = useState<Operateur[]>([]);
  const [isLoadingPrestations, setIsLoadingPrestations] = useState(true);
  const [prestationsError, setPrestationsError] = useState<string | null>(null);
  // Keyed by the code that produced them, so suggestions for a stale code are
  // discarded by derivation instead of by an extra state update.
  const [villesForCode, setVillesForCode] = useState<{
    code: string;
    villes: string[];
  }>({ code: "", villes: EMPTY_VILLES });

  useEffect(() => {
    let cancelled = false;
    fetchPrestations()
      .then((list) => {
        if (!cancelled) setPrestations(list);
      })
      .catch(() => {
        if (!cancelled)
          setPrestationsError(
            "Impossible de charger les prestations. Vérifiez que l’API est démarrée.",
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingPrestations(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Non-blocking: the field stays usable as free text if the list fails to load.
    fetchOperateurs()
      .then((list) => {
        if (!cancelled) setOperateurs(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!/^\d{5}$/.test(codePostal)) return;
    let cancelled = false;
    fetchVilles(codePostal)
      .then((villes) => {
        if (cancelled) return;
        setVillesForCode({ code: codePostal, villes });
        if (villes.length === 1) onSingleVille(villes[0]);
      })
      .catch(() => {
        if (!cancelled)
          setVillesForCode({ code: codePostal, villes: EMPTY_VILLES });
      });
    return () => {
      cancelled = true;
    };
  }, [codePostal, onSingleVille]);

  return {
    prestations,
    operateurs,
    villeSuggestions:
      villesForCode.code === codePostal ? villesForCode.villes : EMPTY_VILLES,
    isLoadingPrestations,
    prestationsError,
  };
}

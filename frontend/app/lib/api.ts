import { apiUrl } from "./constants";
import {
  formatFrenchDate,
  formatFrenchTime,
  todayFR,
} from "./format";
import type { FormData, Operateur, Prestation } from "./types";

export async function fetchPrestations(): Promise<Prestation[]> {
  const response = await fetch(`${apiUrl}/api/prestations`);
  if (!response.ok) throw new Error("prestations");
  return response.json();
}

export async function fetchOperateurs(): Promise<Operateur[]> {
  const response = await fetch(`${apiUrl}/api/operateurs`);
  if (!response.ok) throw new Error("operateurs");
  return response.json();
}

export async function fetchVilles(codePostal: string): Promise<string[]> {
  const response = await fetch(
    `${apiUrl}/api/villes?codePostal=${codePostal}`,
  );
  return response.ok ? response.json() : [];
}

/**
 * Posts the form and returns the devis PDF.
 * Dates and times are converted to the French formats the API expects.
 */
export async function fetchDevisPdf(
  data: FormData,
  prestations: Record<string, number>,
): Promise<Blob> {
  const response = await fetch(`${apiUrl}/api/devis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      dateCommande: todayFR(),
      dateNaissance: formatFrenchDate(data.dateNaissance),
      dateDeces: formatFrenchDate(data.dateDeces),
      heureDeces: formatFrenchTime(data.heureDeces),
      dateAdmission: formatFrenchDate(data.dateAdmission),
      heureAdmission: formatFrenchTime(data.heureAdmission),
      dateDepart: formatFrenchDate(data.dateDepart),
      heureDepart: formatFrenchTime(data.heureDepart),
      prestations,
    }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "La génération du devis a échoué.");
  }
  return response.blob();
}

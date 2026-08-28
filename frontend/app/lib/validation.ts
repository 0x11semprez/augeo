import type { FormData, SelectedPrestations } from "./types";

/** Returns the first blocking error, or null when the devis can be generated. */
export function validateDevis(
  data: FormData,
  selected: SelectedPrestations,
): string | null {
  if (!data.nom.trim() || !data.prenom.trim())
    return "Renseignez au minimum le nom et le prénom du défunt.";

  if (
    data.dateAdmission &&
    data.dateDepart &&
    data.dateDepart < data.dateAdmission
  )
    return "La date de départ ne peut pas être antérieure à la date d’admission.";

  if (
    data.dateAdmission === data.dateDepart &&
    data.heureAdmission &&
    data.heureDepart &&
    data.heureDepart < data.heureAdmission
  )
    return "L’heure de départ ne peut pas être antérieure à l’heure d’admission.";

  if (!Object.values(selected).some(Boolean))
    return "Sélectionnez au moins une prestation.";

  return null;
}

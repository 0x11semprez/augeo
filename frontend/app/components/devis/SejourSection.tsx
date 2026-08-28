"use client";

import { DatePicker } from "../ui/DatePicker";
import { Field } from "../ui/Field";
import { FrenchTimeInput } from "../ui/FrenchTimeInput";
import { Heading } from "../ui/Heading";
import type { FormData, Operateur } from "../../lib/types";

type MentionField = "paiementChequeDepart" | "tresGrand" | "arriveeNuit";

const MENTIONS: { field: MentionField; label: string }[] = [
  { field: "paiementChequeDepart", label: "Paiement par chèque au départ" },
  { field: "tresGrand", label: "Très grand" },
  { field: "arriveeNuit", label: "Arrivée de nuit/ Dimanche/ Jours fériés" },
];

export function SejourSection({
  data,
  operateurs,
  updateField,
  toggleMention,
}: {
  data: FormData;
  operateurs: Operateur[];
  updateField: (field: keyof FormData, value: string) => void;
  toggleMention: (field: MentionField, on: boolean) => void;
}) {
  // A departure on the admission day cannot start before the admission time.
  const departureTimeMin =
    data.dateAdmission && data.dateAdmission === data.dateDepart
      ? data.heureAdmission
      : undefined;

  return (
    <section className="form-card">
      <Heading
        title="Séjour & opérateur"
        subtitle="Dates de prise en charge et coordonnées"
      />
      <div className="form-grid">
        <Field label="Date d’admission" as="div">
          <DatePicker
            label="Date d’admission"
            value={data.dateAdmission}
            onValueChange={(value) => updateField("dateAdmission", value)}
          />
        </Field>
        <Field label="Heure d’admission">
          <FrenchTimeInput
            value={data.heureAdmission}
            onValueChange={(value) => updateField("heureAdmission", value)}
          />
        </Field>
        <Field label="Date de départ" as="div">
          {/* Remounted when the value is corrected upstream, to resync the text. */}
          <DatePicker
            key={data.dateDepart}
            label="Date de départ"
            value={data.dateDepart}
            min={data.dateAdmission}
            minMessage="La date de départ ne peut pas précéder l’admission."
            onValueChange={(value) => updateField("dateDepart", value)}
          />
        </Field>
        <Field label="Heure de départ">
          <FrenchTimeInput
            key={data.heureDepart}
            value={data.heureDepart}
            min={departureTimeMin}
            onValueChange={(value) => updateField("heureDepart", value)}
          />
        </Field>
        <Field label="Opérateur funéraire" className="span-2">
          <input
            list="operateurs-options"
            value={data.operateur}
            onChange={(e) => updateField("operateur", e.target.value)}
            placeholder="Pompes Funèbres Martin"
          />
          <datalist id="operateurs-options">
            {operateurs.map((operateur, index) => (
              // Names are not guaranteed unique in the catalogue.
              <option key={`${operateur.nom}-${index}`} value={operateur.nom} />
            ))}
          </datalist>
        </Field>
        <Field label="Information en plus" as="div" className="span-4">
          <div className="mentions-list">
            {MENTIONS.map(({ field, label }) => (
              <label className="mention-item" key={field}>
                <input
                  className="prestation-checkbox"
                  type="checkbox"
                  checked={data[field]}
                  onChange={(e) => toggleMention(field, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </Field>
      </div>
    </section>
  );
}

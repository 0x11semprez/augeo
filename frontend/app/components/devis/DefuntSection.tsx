"use client";

import { DatePicker } from "../ui/DatePicker";
import { Field } from "../ui/Field";
import { FrenchTimeInput } from "../ui/FrenchTimeInput";
import { Heading } from "../ui/Heading";
import { todayISO } from "../../lib/format";
import type { FormData } from "../../lib/types";

const MEASUREMENTS: { field: keyof FormData; label: string }[] = [
  { field: "tailleDefunt", label: "Taille (cm)" },
  { field: "epaulement", label: "Épaulement (cm)" },
  { field: "coudeACoude", label: "Coude à coude (cm)" },
  { field: "epaisseur", label: "Épaisseur (cm)" },
];

export function DefuntSection({
  data,
  villeSuggestions,
  updateField,
}: {
  data: FormData;
  villeSuggestions: string[];
  updateField: (field: keyof FormData, value: string) => void;
}) {
  const today = todayISO();

  return (
    <section className="form-card">
      <Heading
        title="Informations du défunt"
        subtitle="Identité, décès et mensurations"
      />
      <div className="form-grid">
        <Field label="Civilité">
          <select
            value={data.civilite}
            onChange={(e) => updateField("civilite", e.target.value)}
          >
            <option>M</option>
            <option>Mme</option>
          </select>
        </Field>
        <Field label="Nom" required>
          <input
            value={data.nom}
            onChange={(e) => updateField("nom", e.target.value.toUpperCase())}
            placeholder="DUPONT"
            required
          />
        </Field>
        <Field label="Prénom" required>
          <input
            value={data.prenom}
            onChange={(e) => updateField("prenom", e.target.value)}
            placeholder="Jean"
            required
          />
        </Field>
        <Field label="Nom de naissance">
          <input
            value={data.nomNaissance}
            onChange={(e) => updateField("nomNaissance", e.target.value)}
            placeholder="Facultatif"
          />
        </Field>
        <Field label="Date de naissance" as="div">
          <DatePicker
            label="Date de naissance"
            value={data.dateNaissance}
            max={today}
            onValueChange={(value) => updateField("dateNaissance", value)}
          />
        </Field>
        <Field label="Date de décès" as="div">
          {/* Remounted when the value is corrected upstream, to resync the text. */}
          <DatePicker
            key={data.dateDeces}
            label="Date de décès"
            value={data.dateDeces}
            min={data.dateNaissance}
            minMessage="La date de décès ne peut pas précéder la naissance."
            max={today}
            maxMessage="La date de décès ne peut pas être dans le futur."
            onValueChange={(value) => updateField("dateDeces", value)}
          />
        </Field>
        <Field label="Heure de décès">
          <FrenchTimeInput
            value={data.heureDeces}
            onValueChange={(value) => updateField("heureDeces", value)}
          />
        </Field>
        <Field label="Code postal">
          <input
            inputMode="numeric"
            value={data.codePostal}
            onChange={(e) => updateField("codePostal", e.target.value)}
          />
        </Field>
        <Field label="Ville du décès" className="span-2">
          <input
            list="villes-options"
            value={data.villeDeces}
            onChange={(e) => updateField("villeDeces", e.target.value)}
          />
          <datalist id="villes-options">
            {villeSuggestions.map((ville) => (
              <option key={ville} value={ville} />
            ))}
          </datalist>
        </Field>
      </div>
      <div className="subsection-label">
        Mensurations <span>Ces informations sont facultatives.</span>
      </div>
      <div className="form-grid measurement-grid">
        {MEASUREMENTS.map(({ field, label }) => (
          <Field key={field} label={label}>
            <input
              inputMode="numeric"
              value={String(data[field])}
              onChange={(e) => updateField(field, e.target.value)}
            />
          </Field>
        ))}
      </div>
    </section>
  );
}

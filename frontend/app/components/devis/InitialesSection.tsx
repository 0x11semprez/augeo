"use client";

import { Field } from "../ui/Field";
import { Heading } from "../ui/Heading";

export function InitialesSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="form-card">
      <Heading title="Initiales" subtitle="Personne qui remplit le devis" />
      <div className="form-grid">
        <Field label="Initiales">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder="JD"
            maxLength={5}
          />
        </Field>
      </div>
    </section>
  );
}

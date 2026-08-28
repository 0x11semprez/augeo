"use client";

import { formatEuros } from "../../lib/format";
import type { Prestation, SelectedPrestations } from "../../lib/types";

export function PrestationsSection({
  prestations,
  selectedPrestations,
  selectedCount,
  isLoading,
  onToggle,
}: {
  prestations: Prestation[];
  selectedPrestations: SelectedPrestations;
  selectedCount: number;
  isLoading: boolean;
  onToggle: (code: string) => void;
}) {
  return (
    <section className="form-card" id="prestations">
      <div className="card-heading">
        <div>
          <h2>Prestations</h2>
          <p>Choisissez les prestations à intégrer au devis</p>
        </div>
        <div className="selection-count">
          {selectedCount} sélectionnée{selectedCount > 1 ? "s" : ""}
        </div>
      </div>
      {isLoading ? (
        <div className="loading">Chargement des prestations…</div>
      ) : prestations.length ? (
        <div className="prestations-list">
          {prestations.map((prestation) => (
            <label className="prestation-row" key={prestation.Code}>
              <input
                className="prestation-checkbox"
                type="checkbox"
                checked={Boolean(selectedPrestations[prestation.Code])}
                onChange={() => onToggle(prestation.Code)}
                aria-label={`Sélectionner ${prestation.Libelle}`}
              />
              <div className="prestation-info">
                <strong>{prestation.Libelle}</strong>
                <small>{prestation.Code}</small>
              </div>
              <div className="prestation-price">
                {formatEuros(prestation.PrixTTC)} <span>TTC</span>
              </div>
            </label>
          ))}
        </div>
      ) : (
        <div className="empty-state">Aucune prestation disponible.</div>
      )}
    </section>
  );
}

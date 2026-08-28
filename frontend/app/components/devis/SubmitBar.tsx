"use client";

import { ArrowRightIcon } from "../ui/icons";

export function SubmitBar({
  isSubmitting,
  canStartOver,
  onNouveauDevis,
  onOuvrirOutlook,
}: {
  isSubmitting: boolean;
  canStartOver: boolean;
  onNouveauDevis: () => void;
  onOuvrirOutlook: () => void;
}) {
  return (
    <div className="submit-bar">
      <div className="form-actions">
        {canStartOver ? (
          <button
            className="secondary-button"
            type="button"
            onClick={onNouveauDevis}
          >
            Nouveau devis
          </button>
        ) : null}
        <button
          className="secondary-button"
          type="button"
          onClick={onOuvrirOutlook}
        >
          Ouvrir Outlook
        </button>
        <button className="generate-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Génération en cours…" : "Générer le devis"}
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

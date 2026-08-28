"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { DefuntSection } from "./components/devis/DefuntSection";
import { InitialesSection } from "./components/devis/InitialesSection";
import { PrestationsSection } from "./components/devis/PrestationsSection";
import { RubriqueTabs } from "./components/devis/RubriqueTabs";
import { SejourSection } from "./components/devis/SejourSection";
import { StatusBanner } from "./components/devis/StatusBanner";
import { SubmitBar } from "./components/devis/SubmitBar";
import { useDevisForm } from "./hooks/useDevisForm";
import { useDevisGeneration } from "./hooks/useDevisGeneration";
import { useReferenceData } from "./hooks/useReferenceData";
import { formatFrenchDate } from "./lib/format";
import { buildOutlookComposeUrl } from "./lib/outlook";

export default function Home() {
  const {
    data,
    selectedPrestations,
    selectedCount,
    formKey,
    updateField,
    toggleMention,
    setVilleDeces,
    togglePrestation,
    reset,
  } = useDevisForm();

  const {
    prestations,
    operateurs,
    villeSuggestions,
    isLoadingPrestations,
    prestationsError,
  } = useReferenceData(data.codePostal, setVilleDeces);

  const { status, setStatus, isSubmitting, generateDevis } =
    useDevisGeneration();

  const [christopheMode, setChristopheMode] = useState(false);
  const [activeRubrique, setActiveRubrique] = useState(0);

  useEffect(() => {
    if (prestationsError) setStatus({ type: "error", message: prestationsError });
  }, [prestationsError, setStatus]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await generateDevis(data, selectedPrestations);
  }

  function handleNouveauDevis() {
    reset();
    setStatus(null);
  }

  function handleOuvrirOutlook() {
    const nomPrenom = [data.nom, data.prenom].filter(Boolean).join(", ");
    const depart = data.dateDepart
      ? `, départ le ${formatFrenchDate(data.dateDepart)}`
      : "";
    const subject = `Devis ${nomPrenom}${depart}`;

    const normalized = data.operateur.trim().toLowerCase();
    const email =
      operateurs.find((o) => o.nom.trim().toLowerCase() === normalized)?.email ??
      "";

    window.open(buildOutlookComposeUrl(subject, email), "_blank");
    setStatus({
      type: "success",
      message: email
        ? `Outlook Web s’est ouvert avec un nouveau message adressé à ${email}.`
        : "Outlook Web s’est ouvert avec un nouveau message. Sélectionnez une pompe funèbre pour pré-remplir le destinataire.",
    });
  }

  return (
    <main className={`app-shell ${christopheMode ? "christophe-mode" : ""}`}>
      <header className="site-header">
        <Image
          src="/ogf-logo-black.png"
          alt="OGF"
          width={120}
          height={62}
          priority
        />
      </header>
      <section className="workspace" id="nouveau-devis">
        <div className="content">
          <div className="page-intro">
            <div>
              <h1>Créer un nouveau devis</h1>
              <p>
                Renseignez les informations nécessaires, puis générez le
                document PDF.
              </p>
            </div>
            <button
              type="button"
              className={`christophe-toggle ${christopheMode ? "active" : ""}`}
              aria-pressed={christopheMode}
              onClick={() => setChristopheMode((current) => !current)}
            >
              👁 Mode Christophe
            </button>
          </div>

          <form onSubmit={handleSubmit} key={formKey}>
            <InitialesSection
              value={data.initiales}
              onChange={(value) => updateField("initiales", value)}
            />

            <RubriqueTabs active={activeRubrique} onSelect={setActiveRubrique} />

            <div className="rubrique-viewport">
              <div
                className="rubrique-track"
                style={{ transform: `translateX(-${activeRubrique * 100}%)` }}
              >
                <div className="rubrique-panel">
                  <DefuntSection
                    data={data}
                    villeSuggestions={villeSuggestions}
                    updateField={updateField}
                  />
                </div>
                <div className="rubrique-panel">
                  <SejourSection
                    data={data}
                    operateurs={operateurs}
                    updateField={updateField}
                    toggleMention={toggleMention}
                  />
                </div>
                <div className="rubrique-panel">
                  <PrestationsSection
                    prestations={prestations}
                    selectedPrestations={selectedPrestations}
                    selectedCount={selectedCount}
                    isLoading={isLoadingPrestations}
                    onToggle={togglePrestation}
                  />
                </div>
              </div>
            </div>

            <StatusBanner status={status} />

            <SubmitBar
              isSubmitting={isSubmitting}
              canStartOver={status?.type === "success"}
              onNouveauDevis={handleNouveauDevis}
              onOuvrirOutlook={handleOuvrirOutlook}
            />
          </form>
        </div>
      </section>
    </main>
  );
}

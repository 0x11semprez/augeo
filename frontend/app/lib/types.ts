export type Prestation = { Code: string; Libelle: string; PrixTTC: number };

export type Operateur = { nom: string; email: string; telephone: string };

export type FormData = {
  initiales: string;
  civilite: string;
  nom: string;
  nomNaissance: string;
  prenom: string;
  dateNaissance: string;
  dateDeces: string;
  heureDeces: string;
  villeDeces: string;
  codePostal: string;
  tailleDefunt: string;
  epaulement: string;
  coudeACoude: string;
  epaisseur: string;
  dateAdmission: string;
  heureAdmission: string;
  dateDepart: string;
  heureDepart: string;
  operateur: string;
  paiementChequeDepart: boolean;
  tresGrand: boolean;
  arriveeNuit: boolean;
};

export type Status = { type: "error" | "success"; message: string };

export type SelectedPrestations = Record<string, boolean>;

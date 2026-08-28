import type { FormData } from "./types";

export const apiUrl =
  process.env.NEXT_PUBLIC_DEVIS_API_URL ?? "http://localhost:8080";

export const initialData: FormData = {
  initiales: "",
  civilite: "M",
  nom: "",
  nomNaissance: "",
  prenom: "",
  dateNaissance: "",
  dateDeces: "",
  heureDeces: "",
  villeDeces: "Nanterre",
  codePostal: "92000",
  tailleDefunt: "",
  epaulement: "",
  coudeACoude: "",
  epaisseur: "",
  dateAdmission: "",
  heureAdmission: "",
  dateDepart: "",
  heureDepart: "",
  operateur: "",
  paiementChequeDepart: false,
  tresGrand: false,
  arriveeNuit: false,
};

export const RUBRIQUE_LABELS = [
  "Informations du défunt",
  "Séjour & opérateur",
  "Prestations",
];

export const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export const OUTLOOK_BODY =
  " Bonjour,\n\nCi-joint le bon de commande pour le convoi.\n\nMerci de nous le renvoyer avec votre signature et votre tampon lisible.\n\nAinsi que le numéro hommage Agence (zone sous le tampon)\n\nRappel :\n\nTout convoi dont nous n’aurons pas le bon de commande signé et tamponné à l’heure du départ sera bloqué dans l'attente du document validé.\n\nCordialement,";

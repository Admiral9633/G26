// Basistyp für Zeitstempel
export interface TimeStamped {
  created_at: string;
  updated_at: string;
}

// Feuerwehr-Typen
export interface Feuerwehr extends TimeStamped {
  id: number;
  name: string;
  kostentraeger: number | null;
}

// Patienten-Typen
export interface Patient extends TimeStamped {
  id: number;
  feuerwehr: number;
  nachname: string;
  vorname: string;
  geburtsdatum: string;
  geschlecht: "M" | "W" | "D";
  strasse: string;
  plz: string;
  ort: string;
}

export interface PatientFormData {
  nachname: string;
  vorname: string;
  geburtsdatum: string;
  geschlecht: "M" | "W" | "D";
  strasse: string;
  plz: string;
  ort: string;
}

// Untersuchungs-Typen
export interface Untersuchung extends TimeStamped {
  id: number;
  patient: number;
  untersuchungsdatum: string;
  naechste_untersuchung: string | null;
  erstuntersuchung: boolean;
  nachuntersuchung: boolean;
  bewertung: "JA" | "NEIN" | "BEDINGT";
  bemerkungen: string | null;
}

export interface UntersuchungFormData {
  untersuchungsdatum: string;
  naechste_untersuchung?: string;
  erstuntersuchung: boolean;
  nachuntersuchung: boolean;
  bewertung: "JA" | "NEIN" | "BEDINGT";
  bemerkungen?: string;
}

// Kostenträger-Typen
export interface Kostentraeger extends TimeStamped {
  id: number;
  firma: string;
  strasse: string;
  plz: string;
  ort: string;
  standard_kontakt: number | null;
  kontaktpersonen?: Kontaktperson[];
}

// Kontaktperson-Typen
export interface Kontaktperson extends TimeStamped {
  id: number;
  kostentraeger: number;
  nachname: string;
  vorname: string;
  position?: string;
  telefon?: string;
  email?: string;
}

// API-Antwort-Typen
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

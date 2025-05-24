import axios from "axios";
import type {
  ApiResponse,
  Feuerwehr,
  Patient,
  Kostentraeger,
  Kontaktperson,
  Untersuchung,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Feuerwehr API
export const getFeuerwehren = async (): Promise<Feuerwehr[]> => {
  const response = await api.get<ApiResponse<Feuerwehr>>("/feuerwehren/");
  return response.data.results;
};

export const getFeuerwehr = async (id: string): Promise<Feuerwehr> => {
  const response = await api.get<Feuerwehr>(`/feuerwehren/${id}/`);
  return response.data;
};

export const createFeuerwehr = async (
  data: Partial<Feuerwehr>
): Promise<Feuerwehr> => {
  const response = await api.post<Feuerwehr>("/feuerwehren/", data);
  return response.data;
};

export const updateFeuerwehr = async (
  id: string,
  data: Partial<Feuerwehr>
): Promise<Feuerwehr> => {
  const response = await api.put<Feuerwehr>(`/feuerwehren/${id}/`, data);
  return response.data;
};

export const deleteFeuerwehr = async (id: string): Promise<void> => {
  await api.delete(`/feuerwehren/${id}/`);
};

// Patienten API
export const getPatienten = async (
  feuerwehrId?: string
): Promise<Patient[]> => {
  const url = feuerwehrId
    ? `/patienten/?feuerwehr=${feuerwehrId}`
    : "/patienten/";
  const response = await api.get<ApiResponse<Patient>>(url);
  return response.data.results;
};

export const getPatientenByFeuerwehr = async (
  feuerwehrId: string
): Promise<Patient[]> => {
  return getPatienten(feuerwehrId);
};

export const getPatient = async (id: string): Promise<Patient> => {
  const response = await api.get<Patient>(`/patienten/${id}/`);
  return response.data;
};

export const createPatient = async (
  data: Partial<Patient>
): Promise<Patient> => {
  const response = await api.post<Patient>("/patienten/", data);
  return response.data;
};

export const updatePatient = async (
  id: string,
  data: Partial<Patient>
): Promise<Patient> => {
  const response = await api.put<Patient>(`/patienten/${id}/`, data);
  return response.data;
};

export const deletePatient = async (id: string): Promise<void> => {
  await api.delete(`/patienten/${id}/`);
};

// Untersuchungen API
export const getUntersuchungen = async (
  patientId?: string
): Promise<Untersuchung[]> => {
  const url = patientId
    ? `/untersuchungen/?patient=${patientId}`
    : "/untersuchungen/";
  const response = await api.get<ApiResponse<Untersuchung>>(url);
  return response.data.results;
};

export const getUntersuchung = async (id: string): Promise<Untersuchung> => {
  const response = await api.get<Untersuchung>(`/untersuchungen/${id}/`);
  return response.data;
};

export const createUntersuchung = async (
  data: Partial<Untersuchung>
): Promise<Untersuchung> => {
  const response = await api.post<Untersuchung>("/untersuchungen/", data);
  return response.data;
};

export const updateUntersuchung = async (
  id: string,
  data: Partial<Untersuchung>
): Promise<Untersuchung> => {
  const response = await api.put<Untersuchung>(`/untersuchungen/${id}/`, data);
  return response.data;
};

export const deleteUntersuchung = async (id: string): Promise<void> => {
  await api.delete(`/untersuchungen/${id}/`);
};

export const importUntersuchungenJSON = async (data: any): Promise<void> => {
  await api.post("/untersuchungen/import_json/", data);
};

// Diese Funktion fehlte - für den JSON-Import
export const importPatientJson = async (
  feuerwehrId: string,
  jsonData: any
): Promise<void> => {
  try {
    const response = await api.post(
      `/feuerwehr/${feuerwehrId}/import-patienten/`,
      jsonData
    );

    if (response.status !== 200 && response.status !== 201) {
      throw new Error("Fehler beim Importieren der Patienten");
    }

    return response.data;
  } catch (error) {
    console.error("Fehler beim Importieren der Patienten:", error);
    throw error;
  }
};

// PDF-Generierung
export const generatePDF = async (untersuchungId: string): Promise<Blob> => {
  const response = await api.get(`/untersuchungen/${untersuchungId}/pdf/`, {
    responseType: "blob",
  });
  return response.data;
};

// Kostenträger API
export const getKostentraeger = async (): Promise<Kostentraeger[]> => {
  const response = await api.get<ApiResponse<Kostentraeger>>("/kostentraeger/");
  return response.data.results;
};

export const getKostentraegerById = async (
  id: string
): Promise<Kostentraeger> => {
  const response = await api.get<Kostentraeger>(`/kostentraeger/${id}/`);
  return response.data;
};

export const createKostentraeger = async (
  data: Partial<Kostentraeger>
): Promise<Kostentraeger> => {
  const response = await api.post<Kostentraeger>("/kostentraeger/", data);
  return response.data;
};

export const updateKostentraeger = async (
  id: string,
  data: Partial<Kostentraeger>
): Promise<Kostentraeger> => {
  const response = await api.put<Kostentraeger>(`/kostentraeger/${id}/`, data);
  return response.data;
};

export const deleteKostentraeger = async (id: string): Promise<void> => {
  await api.delete(`/kostentraeger/${id}/`);
};

// Kontaktpersonen API
export const getKontaktpersonen = async (
  kostentraegerId?: string
): Promise<Kontaktperson[]> => {
  const url = kostentraegerId
    ? `/kontaktpersonen/?kostentraeger=${kostentraegerId}`
    : "/kontaktpersonen/";
  const response = await api.get<ApiResponse<Kontaktperson>>(url);
  return response.data.results;
};

export const getKontaktperson = async (id: string): Promise<Kontaktperson> => {
  const response = await api.get<Kontaktperson>(`/kontaktpersonen/${id}/`);
  return response.data;
};

export const createKontaktperson = async (
  data: Partial<Kontaktperson>
): Promise<Kontaktperson> => {
  const response = await api.post<Kontaktperson>("/kontaktpersonen/", data);
  return response.data;
};

export const updateKontaktperson = async (
  id: string,
  data: Partial<Kontaktperson>
): Promise<Kontaktperson> => {
  const response = await api.put<Kontaktperson>(
    `/kontaktpersonen/${id}/`,
    data
  );
  return response.data;
};

export const deleteKontaktperson = async (id: string): Promise<void> => {
  await api.delete(`/kontaktpersonen/${id}/`);
};

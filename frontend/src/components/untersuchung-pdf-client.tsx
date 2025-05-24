"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getPatient,
  getUntersuchung,
  getFeuerwehr,
  generatePDF,
} from "@/lib/api";
import type { Patient, Untersuchung, Feuerwehr } from "@/types";

export function UntersuchungPdfClient({
  feuerwehrId,
  patientId,
  untersuchungId,
}: {
  feuerwehrId: string;
  patientId: string;
  untersuchungId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [untersuchung, setUntersuchung] = useState<Untersuchung | null>(null);
  const [feuerwehr, setFeuerwehr] = useState<Feuerwehr | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientData, untersuchungData, feuerwehrData] =
          await Promise.all([
            getPatient(patientId),
            getUntersuchung(untersuchungId),
            getFeuerwehr(feuerwehrId),
          ]);

        setPatient(patientData);
        setUntersuchung(untersuchungData);
        setFeuerwehr(feuerwehrData);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        toast.error("Die Daten konnten nicht geladen werden.");
        router.push(`/feuerwehr/${feuerwehrId}/patient/${patientId}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [feuerwehrId, patientId, untersuchungId, router]);

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const pdfBlob = await generatePDF(untersuchungId);

      // PDF herunterladen
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Untersuchung_${patient?.nachname}_${patient?.vorname}_${untersuchung?.untersuchungsdatum}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF wurde erfolgreich generiert.");
    } catch (error) {
      console.error("Fehler beim Generieren des PDFs:", error);
      toast.error("Das PDF konnte nicht generiert werden.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Wird geladen...</p>
      </div>
    );
  }

  if (!patient || !untersuchung || !feuerwehr) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Daten nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>PDF-Formular generieren</CardTitle>
          <CardDescription>
            Generieren Sie ein PDF-Formular für die Untersuchung vom{" "}
            {new Date(untersuchung.untersuchungsdatum).toLocaleDateString(
              "de-DE"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Patient</h3>
              <p>
                {patient.nachname}, {patient.vorname}
              </p>
              <p>
                Geburtsdatum:{" "}
                {new Date(patient.geburtsdatum).toLocaleDateString("de-DE")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Feuerwehr</h3>
              <p>{feuerwehr.name}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Untersuchung</h3>
            <p>
              Datum:{" "}
              {new Date(untersuchung.untersuchungsdatum).toLocaleDateString(
                "de-DE"
              )}
            </p>
            <p>
              Typ:{" "}
              {untersuchung.erstuntersuchung
                ? "Erstuntersuchung"
                : "Nachuntersuchung"}
            </p>
            <p>
              Bewertung:{" "}
              {untersuchung.bewertung === "JA"
                ? "Geeignet"
                : untersuchung.bewertung === "NEIN"
                ? "Nicht geeignet"
                : "Bedingt geeignet"}
            </p>
            <p>Gerätegruppe: {untersuchung.geraetegruppe}</p>
            {untersuchung.taucher && <p>Für Tätigkeiten als Taucher</p>}
            {untersuchung.voraussetzungen && (
              <div>
                <p className="font-semibold">Voraussetzungen:</p>
                <p>{untersuchung.voraussetzungen}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => router.back()}>
            Zurück
          </Button>
          <Button onClick={handleGeneratePDF} disabled={generating}>
            {generating ? "Wird generiert..." : "PDF generieren"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

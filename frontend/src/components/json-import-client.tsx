"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFeuerwehren, importPatientJson } from "@/lib/api";
import type { Feuerwehr } from "@/types";

export function JsonImportClient() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState("");
  const [selectedFeuerwehr, setSelectedFeuerwehr] = useState("");
  const [feuerwehren, setFeuerwehren] = useState<Feuerwehr[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadFeuerwehren = async () => {
      setLoading(true);
      try {
        const data = await getFeuerwehren();
        setFeuerwehren(data);
      } catch (error) {
        console.error("Fehler beim Laden der Feuerwehren:", error);
        toast.error("Die Feuerwehren konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadFeuerwehren();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setJsonText(content);
        // Versuche, die JSON zu parsen, um zu prüfen, ob sie gültig ist
        JSON.parse(content);
        toast.success("JSON-Datei erfolgreich geladen");
      } catch (error) {
        toast.error("Die Datei enthält kein gültiges JSON-Format");
        setJsonText("");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFeuerwehr) {
      toast.error("Bitte wählen Sie eine Feuerwehr aus.");
      return;
    }

    if (!jsonText.trim()) {
      toast.error(
        "Bitte geben Sie JSON-Daten ein oder laden Sie eine JSON-Datei hoch."
      );
      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(jsonText);

      // Konvertiere das JSON-Format in das erwartete Format
      const convertedData = convertJsonFormat(jsonData);
      jsonData = convertedData;
    } catch (error) {
      toast.error("Ungültiges JSON-Format.");
      return;
    }

    setSubmitting(true);
    try {
      await importPatientJson(selectedFeuerwehr, jsonData);
      toast.success("Patienten wurden erfolgreich importiert.");
      router.push(`/feuerwehr/${selectedFeuerwehr}`);
    } catch (error) {
      console.error("Fehler beim Importieren der Patienten:", error);
      toast.error("Die Patienten konnten nicht importiert werden.");
    } finally {
      setSubmitting(false);
    }
  };

  // Konvertiert das bereitgestellte JSON-Format in das vom Backend erwartete Format
  const convertJsonFormat = (data: any) => {
    // Wenn es sich um ein einzelnes Objekt handelt, konvertiere es in ein Array
    if (!Array.isArray(data)) {
      data = [data];
    }

    return data.map((item: any) => {
      // Extrahiere die Daten aus dem bereitgestellten Format
      const personenDaten = item.PersonenDaten || {};
      const untersuchungsDaten = item.UntersuchungsDaten || {};
      const arbeitgeberDaten = item.ArbeitgeberDaten || {};

      // Konvertiere das Datum von DD.MM.YYYY zu YYYY-MM-DD
      const convertDate = (dateStr: string) => {
        if (!dateStr) return "";
        const parts = dateStr.split(".");
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      };

      // Konvertiere Geschlecht von m/w zu M/W
      const convertGender = (gender: string) => {
        if (gender === "m") return "M";
        if (gender === "w") return "W";
        return gender;
      };

      // Bestimme die Bewertung basierend auf den Bedenken-Flags
      let bewertung = "JA";
      if (untersuchungsDaten.BedenkenNein) bewertung = "NEIN";
      else if (untersuchungsDaten.BedenkenBedingt) bewertung = "BEDINGT";

      // Erstelle das konvertierte Objekt im erwarteten Format
      return {
        patient: {
          nachname: personenDaten.NachName || "",
          vorname: personenDaten.VorName || "",
          geburtsdatum: convertDate(personenDaten.GebDat || ""),
          geschlecht: convertGender(personenDaten.Geschlecht || ""),
          strasse: personenDaten.Strasse || "",
          plz: personenDaten.PLZ || "",
          ort: personenDaten.Ort || "",
          feuerwehr: Number.parseInt(selectedFeuerwehr),
        },
        untersuchungen: [
          {
            untersuchungsdatum: convertDate(untersuchungsDaten.UntDat || ""),
            naechste_untersuchung: convertDate(
              untersuchungsDaten.NextDat || ""
            ),
            erstuntersuchung: untersuchungsDaten.ErstUnt || false,
            nachuntersuchung: untersuchungsDaten.NachUnt || false,
            bewertung: bewertung,
            bemerkungen: "",
          },
        ],
      };
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>JSON-Import</CardTitle>
            <CardDescription>
              Importieren Sie Patienten aus einer JSON-Datei. Die JSON-Datei
              sollte ein Array von Patienten enthalten.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feuerwehr">Feuerwehr</Label>
                <Select
                  value={selectedFeuerwehr}
                  onValueChange={setSelectedFeuerwehr}
                  disabled={loading}
                >
                  <SelectTrigger id="feuerwehr">
                    <SelectValue placeholder="Feuerwehr auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {feuerwehren.map((fw) => (
                      <SelectItem key={fw.id} value={fw.id.toString()}>
                        {fw.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>JSON-Datei hochladen</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 mb-2"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    JSON-Datei auswählen
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {fileInputRef.current?.files?.[0]?.name ||
                      "Keine Datei ausgewählt"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="json">JSON-Daten</Label>
                <Textarea
                  id="json"
                  placeholder="Fügen Sie hier Ihre JSON-Daten ein oder laden Sie eine Datei hoch"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={10}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="mt-6 mb-6"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={submitting || loading}
                className="mt-6 mb-6"
              >
                {submitting ? "Wird importiert..." : "Importieren"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

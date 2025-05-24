"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPatient,
  getUntersuchungen,
  deleteUntersuchung,
  generatePDF,
} from "@/lib/api";
import type { Patient, Untersuchung } from "@/types";

export function PatientDetailClient({
  feuerwehrId,
  patientId,
}: {
  feuerwehrId: string;
  patientId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [untersuchungen, setUntersuchungen] = useState<Untersuchung[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [untersuchungToDelete, setUntersuchungToDelete] = useState<
    string | null
  >(null);
  const [selectedUntersuchung, setSelectedUntersuchung] =
    useState<Untersuchung | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientData, untersuchungenData] = await Promise.all([
          getPatient(patientId),
          getUntersuchungen(patientId),
        ]);
        setPatient(patientData);
        setUntersuchungen(untersuchungenData);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        toast.error("Die Daten konnten nicht geladen werden.");
        router.push(`/feuerwehr/${feuerwehrId}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId, feuerwehrId, router]);

  const handleDeleteUntersuchung = (id: string) => {
    setUntersuchungToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUntersuchung = async () => {
    if (!untersuchungToDelete) return;

    try {
      await deleteUntersuchung(untersuchungToDelete);
      setUntersuchungen(
        untersuchungen.filter((u) => u.id.toString() !== untersuchungToDelete)
      );
      toast.success("Die Untersuchung wurde erfolgreich gelöscht.");
    } catch (error) {
      console.error("Fehler beim Löschen der Untersuchung:", error);
      toast.error("Die Untersuchung konnte nicht gelöscht werden.");
    } finally {
      setDeleteDialogOpen(false);
      setUntersuchungToDelete(null);
    }
  };

  const handleSelectUntersuchung = (untersuchung: Untersuchung) => {
    setSelectedUntersuchung(untersuchung);
  };

  const handleGeneratePDF = async (untersuchungId: string) => {
    try {
      const pdfBlob = await generatePDF(untersuchungId);
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Fehler beim Generieren des PDFs:", error);
      toast.error("Das PDF konnte nicht generiert werden.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Wird geladen...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Patient nicht gefunden</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {patient.vorname} {patient.nachname}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                router.push(
                  `/feuerwehr/${feuerwehrId}/patient/${patientId}/untersuchung/neu`
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Neue Untersuchung
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/feuerwehr/${feuerwehrId}/patient/${patientId}/edit`
                )
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Patient bearbeiten
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patientendaten</CardTitle>
            <CardDescription>
              Detaillierte Informationen zum Patienten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Persönliche Daten</h3>
                <p>
                  <span className="font-medium">Name:</span> {patient.vorname}{" "}
                  {patient.nachname}
                </p>
                <p>
                  <span className="font-medium">Geburtsdatum:</span>{" "}
                  {new Date(patient.geburtsdatum).toLocaleDateString("de-DE")}
                </p>
                <p>
                  <span className="font-medium">Geschlecht:</span>{" "}
                  {patient.geschlecht === "M"
                    ? "Männlich"
                    : patient.geschlecht === "W"
                    ? "Weiblich"
                    : "Divers"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Kontaktdaten</h3>
                <p>
                  <span className="font-medium">Adresse:</span>{" "}
                  {patient.strasse}, {patient.plz} {patient.ort}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Untersuchungen</CardTitle>
            <CardDescription>Alle Untersuchungen des Patienten</CardDescription>
          </CardHeader>
          <CardContent>
            {untersuchungen.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Keine Untersuchungen gefunden
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    router.push(
                      `/feuerwehr/${feuerwehrId}/patient/${patientId}/untersuchung/neu`
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Untersuchung anlegen
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Ergebnis</TableHead>
                    <TableHead>Nächste Untersuchung</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {untersuchungen.map((untersuchung) => (
                    <TableRow
                      key={untersuchung.id}
                      className={
                        selectedUntersuchung?.id === untersuchung.id
                          ? "bg-muted"
                          : ""
                      }
                      onClick={() => handleSelectUntersuchung(untersuchung)}
                    >
                      <TableCell>
                        {new Date(
                          untersuchung.untersuchungsdatum
                        ).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                        {untersuchung.erstuntersuchung
                          ? "Erstuntersuchung"
                          : "Nachuntersuchung"}
                      </TableCell>
                      <TableCell>
                        {untersuchung.bewertung === "JA"
                          ? "Geeignet"
                          : untersuchung.bewertung === "NEIN"
                          ? "Nicht geeignet"
                          : "Bedingt geeignet"}
                      </TableCell>
                      <TableCell>
                        {untersuchung.naechste_untersuchung
                          ? new Date(
                              untersuchung.naechste_untersuchung
                            ).toLocaleDateString("de-DE")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleGeneratePDF(untersuchung.id.toString())
                          }
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">PDF generieren</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(
                              `/feuerwehr/${feuerwehrId}/patient/${patientId}/untersuchung/${untersuchung.id}`
                            )
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUntersuchung(
                              untersuchung.id.toString()
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Löschen</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedUntersuchung && (
          <Card>
            <CardHeader>
              <CardTitle>Untersuchungsdetails</CardTitle>
              <CardDescription>
                Untersuchung vom{" "}
                {new Date(
                  selectedUntersuchung.untersuchungsdatum
                ).toLocaleDateString("de-DE")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Allgemeine Informationen</h3>
                  <p>
                    <span className="font-medium">Art:</span>{" "}
                    {selectedUntersuchung.erstuntersuchung
                      ? "Erstuntersuchung"
                      : "Nachuntersuchung"}
                  </p>
                  <p>
                    <span className="font-medium">Ergebnis:</span>{" "}
                    {selectedUntersuchung.bewertung === "JA"
                      ? "Geeignet"
                      : selectedUntersuchung.bewertung === "NEIN"
                      ? "Nicht geeignet"
                      : "Bedingt geeignet"}
                  </p>
                  <p>
                    <span className="font-medium">Nächste Untersuchung:</span>{" "}
                    {selectedUntersuchung.naechste_untersuchung
                      ? new Date(
                          selectedUntersuchung.naechste_untersuchung
                        ).toLocaleDateString("de-DE")
                      : "-"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Bemerkungen</h3>
                  <p>{selectedUntersuchung.bemerkungen || "-"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={() =>
                  handleGeneratePDF(selectedUntersuchung.id.toString())
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                PDF generieren
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Untersuchung löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diese Untersuchung löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUntersuchung}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { getFeuerwehr, getPatienten, deletePatient } from "@/lib/api";
import type { Feuerwehr, Patient } from "@/types";

export function FeuerwehrDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [feuerwehr, setFeuerwehr] = useState<Feuerwehr | null>(null);
  const [patienten, setPatienten] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [feuerwehrData, patientenData] = await Promise.all([
          getFeuerwehr(id),
          getPatienten(id),
        ]);
        setFeuerwehr(feuerwehrData);
        setPatienten(patientenData);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        toast.error("Die Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleDelete = async (patientId: string) => {
    if (confirm("Möchten Sie diesen Patienten wirklich löschen?")) {
      setDeleting(patientId);
      try {
        await deletePatient(patientId);
        setPatienten(patienten.filter((p) => p.id.toString() !== patientId));
        toast.success("Patient wurde erfolgreich gelöscht.");
      } catch (error) {
        console.error("Fehler beim Löschen des Patienten:", error);
        toast.error("Der Patient konnte nicht gelöscht werden.");
      } finally {
        setDeleting(null);
      }
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

  if (!feuerwehr) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Feuerwehr nicht gefunden.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{feuerwehr.name}</h1>
          <div className="space-x-4">
            <Button
              onClick={() => router.push(`/feuerwehr/${id}/edit`)}
              className="mt-6 mb-6"
            >
              Bearbeiten
            </Button>
            <Button
              onClick={() => router.push(`/feuerwehr/${id}/patient/neu`)}
              className="mt-6 mb-6"
            >
              Neuer Patient
            </Button>
          </div>
        </div>

        {feuerwehr.kostentraeger && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Kostenträger</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{feuerwehr.kostentraeger_name || "Kostenträger zugewiesen"}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Patienten</CardTitle>
            <CardDescription>
              Liste aller Patienten dieser Feuerwehr
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patienten.length === 0 ? (
              <p>Keine Patienten vorhanden.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Vorname</TableHead>
                    <TableHead>Geburtsdatum</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patienten.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.nachname}</TableCell>
                      <TableCell>{patient.vorname}</TableCell>
                      <TableCell>
                        {new Date(patient.geburtsdatum).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/feuerwehr/${id}/patient/${patient.id}`
                              )
                            }
                            className="mt-2 mb-2"
                          >
                            Details
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(patient.id.toString())}
                            disabled={deleting === patient.id.toString()}
                            className="mt-2 mb-2"
                          >
                            {deleting === patient.id.toString()
                              ? "Wird gelöscht..."
                              : "Löschen"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push(`/feuerwehr/${id}/patient/neu`)}
              className="mt-6 mb-6"
            >
              Neuer Patient
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}

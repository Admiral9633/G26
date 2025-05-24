"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  getKostentraegerById,
  getKontaktpersonen,
  deleteKontaktperson,
} from "@/lib/api";
import type { Kostentraeger, Kontaktperson } from "@/types";

export function KontaktpersonenClient({
  kostentraegerId,
}: {
  kostentraegerId: string;
}) {
  const router = useRouter();
  const [kostentraeger, setKostentraeger] = useState<Kostentraeger | null>(
    null
  );
  const [kontaktpersonen, setKontaktpersonen] = useState<Kontaktperson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kostentraegerData, kontaktpersonenData] = await Promise.all([
          getKostentraegerById(kostentraegerId),
          getKontaktpersonen(kostentraegerId),
        ]);
        setKostentraeger(kostentraegerData);
        setKontaktpersonen(kontaktpersonenData);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        toast.error("Die Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [kostentraegerId]);

  const handleDeleteKontaktperson = async (id: string) => {
    if (window.confirm("Möchten Sie diese Kontaktperson wirklich löschen?")) {
      try {
        await deleteKontaktperson(id);
        setKontaktpersonen(
          kontaktpersonen.filter((kp) => kp.id.toString() !== id)
        );
        toast.success("Die Kontaktperson wurde erfolgreich gelöscht.");
      } catch (error) {
        console.error("Fehler beim Löschen der Kontaktperson:", error);
        toast.error("Die Kontaktperson konnte nicht gelöscht werden.");
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

  if (!kostentraeger) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Kostenträger nicht gefunden</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Kontaktpersonen: {kostentraeger.firma}
          </h1>
          <Button
            onClick={() =>
              router.push(`/kostentraeger/${kostentraegerId}/kontakte/neu`)
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Neue Kontaktperson
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kontaktpersonen</CardTitle>
            <CardDescription>
              Alle Kontaktpersonen für {kostentraeger.firma}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {kontaktpersonen.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Keine Kontaktpersonen gefunden
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    router.push(
                      `/kostentraeger/${kostentraegerId}/kontakte/neu`
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Kontaktperson anlegen
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nachname</TableHead>
                    <TableHead>Vorname</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kontaktpersonen.map((kp) => (
                    <TableRow key={kp.id}>
                      <TableCell className="font-medium">
                        {kp.nachname}
                      </TableCell>
                      <TableCell>{kp.vorname}</TableCell>
                      <TableCell>{kp.position || "-"}</TableCell>
                      <TableCell>{kp.telefon || "-"}</TableCell>
                      <TableCell>{kp.email || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(
                              `/kostentraeger/${kostentraegerId}/kontakte/${kp.id}`
                            )
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteKontaktperson(kp.id.toString())
                          }
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
      </div>
    </DashboardLayout>
  );
}

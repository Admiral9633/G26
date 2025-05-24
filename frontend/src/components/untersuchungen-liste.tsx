"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";
import { getUntersuchungen, deleteUntersuchung } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Untersuchung } from "@/types";

export function UntersuchungenListe({
  patientId,
  feuerwehrId,
}: {
  patientId: string;
  feuerwehrId: string;
}) {
  const router = useRouter();
  const [untersuchungen, setUntersuchungen] = useState<Untersuchung[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUntersuchungen = async () => {
      try {
        const data = await getUntersuchungen(patientId);
        setUntersuchungen(data);
      } catch (error) {
        console.error("Fehler beim Laden der Untersuchungen:", error);
        toast.error("Die Untersuchungen konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadUntersuchungen();
  }, [patientId]);

  const handleDeleteUntersuchung = async (id: string) => {
    if (window.confirm("Möchten Sie diese Untersuchung wirklich löschen?")) {
      try {
        await deleteUntersuchung(id);
        setUntersuchungen(untersuchungen.filter((u) => u.id.toString() !== id));
        toast.success("Die Untersuchung wurde erfolgreich gelöscht.");
      } catch (error) {
        console.error("Fehler beim Löschen der Untersuchung:", error);
        toast.error("Die Untersuchung konnte nicht gelöscht werden.");
      }
    }
  };

  const getBewertungBadge = (bewertung: string) => {
    switch (bewertung) {
      case "JA":
        return <Badge className="bg-green-500">Ohne Bedenken</Badge>;
      case "NEIN":
        return <Badge className="bg-red-500">Mit Bedenken</Badge>;
      case "BEDINGT":
        return <Badge className="bg-yellow-500">Bedingt geeignet</Badge>;
      default:
        return <Badge>Unbekannt</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center">Untersuchungen werden geladen...</div>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Untersuchungen</CardTitle>
          <CardDescription>Alle Untersuchungen des Patienten</CardDescription>
        </div>
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
                <TableHead>Nächste Untersuchung</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Bewertung</TableHead>
                <TableHead>Bemerkungen</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {untersuchungen.map((untersuchung) => (
                <TableRow key={untersuchung.id}>
                  <TableCell className="font-medium">
                    {formatDate(untersuchung.untersuchungsdatum)}
                  </TableCell>
                  <TableCell>
                    {untersuchung.naechste_untersuchung
                      ? formatDate(untersuchung.naechste_untersuchung)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {untersuchung.erstuntersuchung ? "Erstuntersuchung" : ""}
                    {untersuchung.erstuntersuchung &&
                    untersuchung.nachuntersuchung
                      ? ", "
                      : ""}
                    {untersuchung.nachuntersuchung ? "Nachuntersuchung" : ""}
                  </TableCell>
                  <TableCell>
                    {getBewertungBadge(untersuchung.bewertung)}
                  </TableCell>
                  <TableCell>{untersuchung.bemerkungen || "-"}</TableCell>
                  <TableCell className="text-right">
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
                      onClick={() =>
                        handleDeleteUntersuchung(untersuchung.id.toString())
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
  );
}

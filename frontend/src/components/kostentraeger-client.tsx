"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
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
import { getKostentraeger, deleteKostentraeger } from "@/lib/api";
import type { Kostentraeger } from "@/types";

export function KostentraegerClient() {
  const router = useRouter();
  const [kostentraeger, setKostentraeger] = useState<Kostentraeger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getKostentraeger();
        setKostentraeger(data);
      } catch (error) {
        console.error("Fehler beim Laden der Kostenträger:", error);
        toast.error("Die Kostenträger konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteKostentraeger = async (id: string) => {
    if (window.confirm("Möchten Sie diesen Kostenträger wirklich löschen?")) {
      try {
        await deleteKostentraeger(id);
        setKostentraeger(kostentraeger.filter((kt) => kt.id.toString() !== id));
        toast.success("Der Kostenträger wurde erfolgreich gelöscht.");
      } catch (error) {
        console.error("Fehler beim Löschen des Kostenträgers:", error);
        toast.error("Der Kostenträger konnte nicht gelöscht werden.");
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Kostenträger</h1>
          <Button onClick={() => router.push("/kostentraeger/neu")}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Kostenträger
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kostenträger</CardTitle>
            <CardDescription>Alle verfügbaren Kostenträger</CardDescription>
          </CardHeader>
          <CardContent>
            {kostentraeger.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Keine Kostenträger gefunden
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/kostentraeger/neu")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Kostenträger anlegen
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Firma</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Kontaktpersonen</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kostentraeger.map((kt) => (
                    <TableRow key={kt.id}>
                      <TableCell className="font-medium">{kt.firma}</TableCell>
                      <TableCell>
                        {kt.strasse}, {kt.plz} {kt.ort}
                      </TableCell>
                      <TableCell>
                        {kt.kontaktpersonen?.length || 0} Kontakt(e)
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/kostentraeger/${kt.id}/kontakte`)
                          }
                          title="Kontaktpersonen"
                        >
                          <Users className="h-4 w-4" />
                          <span className="sr-only">Kontaktpersonen</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/kostentraeger/${kt.id}`)}
                          title="Bearbeiten"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Bearbeiten</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteKostentraeger(kt.id.toString())
                          }
                          title="Löschen"
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

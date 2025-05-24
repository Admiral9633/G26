"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getKostentraeger, deleteKostentraeger } from "@/lib/api";
import type { Kostentraeger } from "@/types";

export function KostentraegerListClient() {
  const router = useRouter();
  const [kostentraeger, setKostentraeger] = useState<Kostentraeger[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kostentraegerToDelete, setKostentraegerToDelete] = useState<
    string | null
  >(null);

  useEffect(() => {
    const loadKostentraeger = async () => {
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

    loadKostentraeger();
  }, []);

  const handleDeleteKostentraeger = (id: string) => {
    setKostentraegerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteKostentraeger = async () => {
    if (!kostentraegerToDelete) return;

    try {
      await deleteKostentraeger(kostentraegerToDelete);
      setKostentraeger(
        kostentraeger.filter((kt) => kt.id.toString() !== kostentraegerToDelete)
      );
      toast.success("Der Kostenträger wurde erfolgreich gelöscht.");
    } catch (error) {
      console.error("Fehler beim Löschen des Kostenträgers:", error);
      toast.error("Der Kostenträger konnte nicht gelöscht werden.");
    } finally {
      setDeleteDialogOpen(false);
      setKostentraegerToDelete(null);
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
            <CardTitle>Alle Kostenträger</CardTitle>
            <CardDescription>
              Verwalten Sie alle Kostenträger und deren Kontaktpersonen.
            </CardDescription>
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
                    <TableHead>Ort</TableHead>
                    <TableHead>Kontaktpersonen</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kostentraeger.map((kt) => (
                    <TableRow key={kt.id}>
                      <TableCell className="font-medium">{kt.firma}</TableCell>
                      <TableCell>
                        {kt.plz} {kt.ort}
                      </TableCell>
                      <TableCell>{kt.kontaktpersonen?.length || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/kostentraeger/${kt.id}`)}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kostenträger löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diesen Kostenträger löschen möchten?
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
            <Button variant="destructive" onClick={confirmDeleteKostentraeger}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

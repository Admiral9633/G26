"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  getKostentraegerById,
  updateKostentraeger,
  getKontaktpersonen,
  deleteKontaktperson,
} from "@/lib/api";
import type { Kostentraeger, Kontaktperson } from "@/types";

const formSchema = z.object({
  firma: z.string().min(2, {
    message: "Der Firmenname muss mindestens 2 Zeichen lang sein.",
  }),
  strasse: z.string().min(2, {
    message: "Die Straße muss mindestens 2 Zeichen lang sein.",
  }),
  plz: z.string().regex(/^\d{5}$/, {
    message: "Bitte geben Sie eine gültige Postleitzahl ein (5 Ziffern).",
  }),
  ort: z.string().min(2, {
    message: "Der Ort muss mindestens 2 Zeichen lang sein.",
  }),
  standard_kontakt: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function KostentraegerDetailClient({
  kostentraegerId,
}: {
  kostentraegerId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kostentraeger, setKostentraeger] = useState<Kostentraeger | null>(
    null
  );
  const [kontaktpersonen, setKontaktpersonen] = useState<Kontaktperson[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kontaktpersonToDelete, setKontaktpersonToDelete] = useState<
    string | null
  >(null);
  const [standardKontakt, setStandardKontakt] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firma: "",
      strasse: "",
      plz: "",
      ort: "",
      standard_kontakt: null,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const kostentraegerData = await getKostentraegerById(kostentraegerId);
        setKostentraeger(kostentraegerData);
        setStandardKontakt(
          kostentraegerData.standard_kontakt
            ? kostentraegerData.standard_kontakt.toString()
            : null
        );

        form.reset({
          firma: kostentraegerData.firma,
          strasse: kostentraegerData.strasse,
          plz: kostentraegerData.plz,
          ort: kostentraegerData.ort,
          standard_kontakt: kostentraegerData.standard_kontakt
            ? kostentraegerData.standard_kontakt.toString()
            : null,
        });

        // Kontaktpersonen laden
        const kontaktpersonenData = await getKontaktpersonen(kostentraegerId);
        setKontaktpersonen(kontaktpersonenData);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        toast.error("Die Daten konnten nicht geladen werden.");
        router.push("/kostentraeger");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [kostentraegerId, form, router]);

  async function onSubmit(values: FormData) {
    setSubmitting(true);
    try {
      const updatedData = {
        ...values,
        standard_kontakt: values.standard_kontakt
          ? Number.parseInt(values.standard_kontakt)
          : null,
      };

      await updateKostentraeger(kostentraegerId, updatedData);
      toast.success("Der Kostenträger wurde erfolgreich aktualisiert.");
      router.push("/kostentraeger");
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Kostenträgers:", error);
      toast.error("Der Kostenträger konnte nicht aktualisiert werden.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteKontaktperson = async (id: string) => {
    setKontaktpersonToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteKontaktperson = async () => {
    if (!kontaktpersonToDelete) return;

    try {
      await deleteKontaktperson(kontaktpersonToDelete);
      setKontaktpersonen(
        kontaktpersonen.filter(
          (person) => person.id.toString() !== kontaktpersonToDelete
        )
      );

      // Wenn die gelöschte Kontaktperson der Standardkontakt war, setzen wir den Standardkontakt auf null
      if (standardKontakt === kontaktpersonToDelete) {
        setStandardKontakt(null);
        form.setValue("standard_kontakt", null);
        if (kostentraeger) {
          await updateKostentraeger(kostentraegerId, {
            ...kostentraeger,
            standard_kontakt: null,
          });
        }
      }

      toast.success("Die Kontaktperson wurde erfolgreich gelöscht.");
    } catch (error) {
      console.error("Fehler beim Löschen der Kontaktperson:", error);
      toast.error("Die Kontaktperson konnte nicht gelöscht werden.");
    } finally {
      setDeleteDialogOpen(false);
      setKontaktpersonToDelete(null);
    }
  };

  const handleSetStandardKontakt = async (kontaktpersonId: string) => {
    try {
      setStandardKontakt(kontaktpersonId);
      form.setValue("standard_kontakt", kontaktpersonId);

      const updatedData = {
        ...form.getValues(),
        standard_kontakt: Number.parseInt(kontaktpersonId),
      };

      await updateKostentraeger(kostentraegerId, updatedData);
      toast.success("Standardkontakt wurde aktualisiert.");
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Standardkontakts:", error);
      toast.error("Der Standardkontakt konnte nicht aktualisiert werden.");
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
          <h1 className="text-3xl font-bold">{kostentraeger.firma}</h1>
          <Button
            onClick={() =>
              router.push(`/kostentraeger/${kostentraegerId}/kontaktperson/neu`)
            }
            className="mt-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Neue Kontaktperson
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kostenträgerdaten</CardTitle>
            <CardDescription>
              Bearbeiten Sie die Daten des Kostenträgers.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firma">Firma</Label>
                <Input
                  id="firma"
                  placeholder="Firmenname"
                  {...form.register("firma")}
                />
                {form.formState.errors.firma && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.firma.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="strasse">Straße</Label>
                <Input
                  id="strasse"
                  placeholder="Straße und Hausnummer"
                  {...form.register("strasse")}
                />
                {form.formState.errors.strasse && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.strasse.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plz">PLZ</Label>
                  <Input id="plz" placeholder="PLZ" {...form.register("plz")} />
                  {form.formState.errors.plz && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.plz.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ort">Ort</Label>
                  <Input id="ort" placeholder="Ort" {...form.register("ort")} />
                  {form.formState.errors.ort && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.ort.message}
                    </p>
                  )}
                </div>
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
              <Button type="submit" disabled={submitting} className="mt-6 mb-6">
                {submitting ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontaktpersonen</CardTitle>
            <CardDescription>
              Alle Kontaktpersonen des Kostenträgers
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
                  className="mt-6"
                  onClick={() =>
                    router.push(
                      `/kostentraeger/${kostentraegerId}/kontaktperson/neu`
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
                    <TableHead>Standard</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kontaktpersonen.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">
                        {person.nachname}
                      </TableCell>
                      <TableCell>{person.vorname}</TableCell>
                      <TableCell>{person.position || "-"}</TableCell>
                      <TableCell>{person.telefon || "-"}</TableCell>
                      <TableCell>{person.email || "-"}</TableCell>
                      <TableCell>
                        <RadioGroup
                          value={standardKontakt || ""}
                          onValueChange={handleSetStandardKontakt}
                        >
                          <RadioGroupItem
                            value={person.id.toString()}
                            id={`standard-${person.id}`}
                            checked={standardKontakt === person.id.toString()}
                          />
                        </RadioGroup>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(
                              `/kostentraeger/${kostentraegerId}/kontaktperson/${person.id}`
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
                            handleDeleteKontaktperson(person.id.toString())
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
            <DialogTitle>Kontaktperson löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diese Kontaktperson löschen möchten?
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
            <Button variant="destructive" onClick={confirmDeleteKontaktperson}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

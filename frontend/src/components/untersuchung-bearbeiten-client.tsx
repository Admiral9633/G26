"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { FileText } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getUntersuchung, updateUntersuchung, generatePDF } from "@/lib/api";
import type { Untersuchung } from "@/types";

const formSchema = z.object({
  datum: z.string(),
  art: z.string().min(1, {
    message: "Die Art der Untersuchung muss angegeben werden.",
  }),
  ergebnis: z.string().min(1, {
    message: "Das Ergebnis der Untersuchung muss angegeben werden.",
  }),
  naechste_untersuchung: z.string().optional(),
  bemerkungen: z.string().optional(),
  g26_1: z.boolean().optional(),
  g26_2: z.boolean().optional(),
  g26_3: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function UntersuchungBearbeitenClient({
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
  const [submitting, setSubmitting] = useState(false);
  const [untersuchung, setUntersuchung] = useState<Untersuchung | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datum: "",
      art: "",
      ergebnis: "",
      naechste_untersuchung: "",
      bemerkungen: "",
      g26_1: false,
      g26_2: false,
      g26_3: false,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const untersuchungData = await getUntersuchung(untersuchungId);
        setUntersuchung(untersuchungData);

        form.reset({
          datum: untersuchungData.datum.split("T")[0],
          art: untersuchungData.art,
          ergebnis: untersuchungData.ergebnis,
          naechste_untersuchung: untersuchungData.naechste_untersuchung
            ? untersuchungData.naechste_untersuchung.split("T")[0]
            : "",
          bemerkungen: untersuchungData.bemerkungen || "",
          g26_1: untersuchungData.g26_1,
          g26_2: untersuchungData.g26_2,
          g26_3: untersuchungData.g26_3,
        });
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        toast.error("Die Daten konnten nicht geladen werden.");
        router.push(`/feuerwehr/${feuerwehrId}/patient/${patientId}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [untersuchungId, form, router, feuerwehrId, patientId]);

  async function onSubmit(values: FormData) {
    setSubmitting(true);
    try {
      // Stellen Sie sicher, dass nur ein G26-Typ aktiv ist
      if (values.g26_1 && values.g26_2) values.g26_2 = false;
      if (values.g26_1 && values.g26_3) values.g26_3 = false;
      if (values.g26_2 && values.g26_3) values.g26_3 = false;

      await updateUntersuchung(untersuchungId, values);
      toast.success("Die Untersuchung wurde erfolgreich aktualisiert.");
      router.push(`/feuerwehr/${feuerwehrId}/patient/${patientId}`);
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Untersuchung:", error);
      toast.error("Die Untersuchung konnte nicht aktualisiert werden.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleGeneratePDF = async () => {
    try {
      const pdfBlob = await generatePDF(untersuchungId);
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Fehler beim Generieren des PDFs:", error);
      toast.error("Das PDF konnte nicht generiert werden.");
    }
  };

  // Stellen Sie sicher, dass nur ein G26-Typ aktiv ist
  const handleG26Change = (
    field: "g26_1" | "g26_2" | "g26_3",
    value: boolean
  ) => {
    if (value) {
      // Wenn ein Typ aktiviert wird, deaktivieren Sie die anderen
      if (field === "g26_1") {
        form.setValue("g26_2", false);
        form.setValue("g26_3", false);
      } else if (field === "g26_2") {
        form.setValue("g26_1", false);
        form.setValue("g26_3", false);
      } else if (field === "g26_3") {
        form.setValue("g26_1", false);
        form.setValue("g26_2", false);
      }
    }
    form.setValue(field, value);
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

  if (!untersuchung) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Untersuchung nicht gefunden</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Untersuchung bearbeiten</CardTitle>
            <CardDescription>
              Bearbeiten Sie die Daten der Untersuchung.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="datum">Datum</Label>
                <Input id="datum" type="date" {...form.register("datum")} />
                {form.formState.errors.datum && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.datum.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="art">Art der Untersuchung</Label>
                <Select
                  value={form.watch("art")}
                  onValueChange={(value) => form.setValue("art", value)}
                >
                  <SelectTrigger id="art">
                    <SelectValue placeholder="Art der Untersuchung auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G26">G26 Atemschutz</SelectItem>
                    <SelectItem value="G27">
                      G27 Atemschutzgeräteträger
                    </SelectItem>
                    <SelectItem value="G31">G31 Überdruck</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.art && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.art.message}
                  </p>
                )}
              </div>

              {form.watch("art") === "G26" && (
                <div className="space-y-2">
                  <Label>G26 Kategorie</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="g26_1"
                        checked={form.watch("g26_1")}
                        onCheckedChange={(checked) =>
                          handleG26Change("g26_1", checked as boolean)
                        }
                      />
                      <Label htmlFor="g26_1" className="font-normal">
                        G26.1 (leichte Atemschutzgeräte bis 5kg)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="g26_2"
                        checked={form.watch("g26_2")}
                        onCheckedChange={(checked) =>
                          handleG26Change("g26_2", checked as boolean)
                        }
                      />
                      <Label htmlFor="g26_2" className="font-normal">
                        G26.2 (mittelschwere Atemschutzgeräte 5-10kg)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="g26_3"
                        checked={form.watch("g26_3")}
                        onCheckedChange={(checked) =>
                          handleG26Change("g26_3", checked as boolean)
                        }
                      />
                      <Label htmlFor="g26_3" className="font-normal">
                        G26.3 (schwere Atemschutzgeräte über 10kg)
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ergebnis">Ergebnis</Label>
                <Select
                  value={form.watch("ergebnis")}
                  onValueChange={(value) => form.setValue("ergebnis", value)}
                >
                  <SelectTrigger id="ergebnis">
                    <SelectValue placeholder="Ergebnis auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Geeignet">Geeignet</SelectItem>
                    <SelectItem value="Nicht geeignet">
                      Nicht geeignet
                    </SelectItem>
                    <SelectItem value="Befristet geeignet">
                      Befristet geeignet
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.ergebnis && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.ergebnis.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="naechste_untersuchung">
                  Nächste Untersuchung
                </Label>
                <Input
                  id="naechste_untersuchung"
                  type="date"
                  {...form.register("naechste_untersuchung")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bemerkungen">Bemerkungen</Label>
                <Textarea id="bemerkungen" {...form.register("bemerkungen")} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="mt-6"
                >
                  Abbrechen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePDF}
                  className="mt-6"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF generieren
                </Button>
              </div>
              <Button type="submit" disabled={submitting} className="mt-6">
                {submitting ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

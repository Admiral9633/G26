"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getPatient, updatePatient } from "@/lib/api";

const formSchema = z.object({
  nachname: z.string().min(2, {
    message: "Der Nachname muss mindestens 2 Zeichen lang sein.",
  }),
  vorname: z.string().min(2, {
    message: "Der Vorname muss mindestens 2 Zeichen lang sein.",
  }),
  geburtsdatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Bitte geben Sie ein gültiges Datum im Format YYYY-MM-DD ein.",
  }),
  geschlecht: z.enum(["M", "W", "D"], {
    required_error: "Bitte wählen Sie ein Geschlecht aus.",
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
});

type FormData = z.infer<typeof formSchema>;

export function PatientBearbeitenClient({
  feuerwehrId,
  patientId,
}: {
  feuerwehrId: string;
  patientId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nachname: "",
      vorname: "",
      geburtsdatum: "",
      geschlecht: "M",
      strasse: "",
      plz: "",
      ort: "",
    },
  });

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const patient = await getPatient(patientId);

        // Format the date to YYYY-MM-DD for the input field
        const formattedDate = patient.geburtsdatum.split("T")[0];

        form.reset({
          nachname: patient.nachname,
          vorname: patient.vorname,
          geburtsdatum: formattedDate,
          geschlecht: patient.geschlecht,
          strasse: patient.strasse,
          plz: patient.plz,
          ort: patient.ort,
        });
      } catch (error) {
        console.error("Fehler beim Laden des Patienten:", error);
        toast.error("Der Patient konnte nicht geladen werden.");
        router.push(`/feuerwehr/${feuerwehrId}`);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [feuerwehrId, patientId, form, router]);

  async function onSubmit(values: FormData) {
    setSubmitting(true);
    try {
      const patientData = {
        ...values,
        feuerwehr: Number.parseInt(feuerwehrId, 10),
      };

      await updatePatient(patientId, patientData);
      toast.success("Der Patient wurde erfolgreich aktualisiert.");
      router.push(`/feuerwehr/${feuerwehrId}`);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Patienten:", error);
      toast.error("Der Patient konnte nicht aktualisiert werden.");
    } finally {
      setSubmitting(false);
    }
  }

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
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Patient bearbeiten</CardTitle>
            <CardDescription>
              Bearbeiten Sie die Daten des Patienten.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nachname">Nachname</Label>
                  <Input
                    id="nachname"
                    placeholder="Nachname"
                    {...form.register("nachname")}
                  />
                  {form.formState.errors.nachname && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.nachname.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vorname">Vorname</Label>
                  <Input
                    id="vorname"
                    placeholder="Vorname"
                    {...form.register("vorname")}
                  />
                  {form.formState.errors.vorname && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.vorname.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="geburtsdatum">Geburtsdatum</Label>
                  <Input
                    id="geburtsdatum"
                    type="date"
                    {...form.register("geburtsdatum")}
                  />
                  {form.formState.errors.geburtsdatum && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.geburtsdatum.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Geschlecht</Label>
                  <RadioGroup
                    defaultValue={form.getValues("geschlecht")}
                    onValueChange={(value) =>
                      form.setValue("geschlecht", value as "M" | "W" | "D")
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="M" id="geschlecht-m" />
                      <Label htmlFor="geschlecht-m">Männlich</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="W" id="geschlecht-w" />
                      <Label htmlFor="geschlecht-w">Weiblich</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D" id="geschlecht-d" />
                      <Label htmlFor="geschlecht-d">Divers</Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.geschlecht && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.geschlecht.message}
                    </p>
                  )}
                </div>
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
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

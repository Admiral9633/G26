"use client";

import { useState } from "react";
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
import { createPatient } from "@/lib/api";

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

export function NeuerPatientClient({ feuerwehrId }: { feuerwehrId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      const patientData = {
        ...values,
        feuerwehr: Number.parseInt(feuerwehrId, 10),
      };

      await createPatient(patientData);
      toast.success("Der Patient wurde erfolgreich erstellt.");
      router.push(`/feuerwehr/${feuerwehrId}`);
    } catch (error) {
      console.error("Fehler beim Erstellen des Patienten:", error);
      toast.error("Der Patient konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Neuen Patienten erstellen</CardTitle>
            <CardDescription>
              Erstellen Sie einen neuen Patienten für die ausgewählte Feuerwehr.
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
                    defaultValue="M"
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
              <Button type="submit" disabled={loading}>
                {loading ? "Wird erstellt..." : "Erstellen"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

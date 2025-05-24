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
import { createKostentraeger } from "@/lib/api";

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
});

type FormData = z.infer<typeof formSchema>;

export function NeuerKostentraegerClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firma: "",
      strasse: "",
      plz: "",
      ort: "",
    },
  });

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      const kostentraeger = await createKostentraeger(values);
      toast.success("Der Kostenträger wurde erfolgreich erstellt.");
      router.push(`/kostentraeger/${kostentraeger.id}`);
    } catch (error) {
      console.error("Fehler beim Erstellen des Kostenträgers:", error);
      toast.error("Der Kostenträger konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Neuen Kostenträger erstellen</CardTitle>
            <CardDescription>
              Erstellen Sie einen neuen Kostenträger für die Verwaltung.
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

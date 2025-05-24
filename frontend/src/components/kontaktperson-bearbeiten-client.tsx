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
import { getKontaktperson, updateKontaktperson } from "@/lib/api";

const formSchema = z.object({
  nachname: z.string().min(2, {
    message: "Der Nachname muss mindestens 2 Zeichen lang sein.",
  }),
  vorname: z.string().min(2, {
    message: "Der Vorname muss mindestens 2 Zeichen lang sein.",
  }),
  position: z.string().optional(),
  telefon: z.string().optional(),
  email: z
    .string()
    .email("Bitte geben Sie eine gültige E-Mail-Adresse ein.")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export function KontaktpersonBearbeitenClient({
  kostentraegerId,
  kontaktpersonId,
}: {
  kostentraegerId: string;
  kontaktpersonId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nachname: "",
      vorname: "",
      position: "",
      telefon: "",
      email: "",
    },
  });

  useEffect(() => {
    const loadKontaktperson = async () => {
      try {
        const kontaktperson = await getKontaktperson(kontaktpersonId);

        form.reset({
          nachname: kontaktperson.nachname,
          vorname: kontaktperson.vorname,
          position: kontaktperson.position || "",
          telefon: kontaktperson.telefon || "",
          email: kontaktperson.email || "",
        });
      } catch (error) {
        console.error("Fehler beim Laden der Kontaktperson:", error);
        toast.error("Die Kontaktperson konnte nicht geladen werden.");
        router.push(`/kostentraeger/${kostentraegerId}`);
      } finally {
        setLoading(false);
      }
    };

    loadKontaktperson();
  }, [kontaktpersonId, form, router, kostentraegerId]);

  async function onSubmit(values: FormData) {
    setSubmitting(true);
    try {
      const kontaktpersonData = {
        ...values,
        kostentraeger: Number.parseInt(kostentraegerId, 10),
      };

      await updateKontaktperson(kontaktpersonId, kontaktpersonData);
      toast.success("Die Kontaktperson wurde erfolgreich aktualisiert.");
      router.push(`/kostentraeger/${kostentraegerId}`);
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Kontaktperson:", error);
      toast.error("Die Kontaktperson konnte nicht aktualisiert werden.");
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
            <CardTitle>Kontaktperson bearbeiten</CardTitle>
            <CardDescription>
              Bearbeiten Sie die Daten der Kontaktperson.
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

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="Position"
                  {...form.register("position")}
                />
                {form.formState.errors.position && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.position.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefon">Telefon</Label>
                  <Input
                    id="telefon"
                    placeholder="Telefonnummer"
                    {...form.register("telefon")}
                  />
                  {form.formState.errors.telefon && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.telefon.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-Mail-Adresse"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
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

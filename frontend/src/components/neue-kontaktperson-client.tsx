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
import { createKontaktperson } from "@/lib/api";

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

export function NeueKontaktpersonClient({
  kostentraegerId,
}: {
  kostentraegerId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      const kontaktpersonData = {
        ...values,
        kostentraeger: Number.parseInt(kostentraegerId, 10),
      };

      await createKontaktperson(kontaktpersonData);
      toast.success("Die Kontaktperson wurde erfolgreich erstellt.");
      router.push(`/kostentraeger/${kostentraegerId}`);
    } catch (error) {
      console.error("Fehler beim Erstellen der Kontaktperson:", error);
      toast.error("Die Kontaktperson konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Neue Kontaktperson erstellen</CardTitle>
            <CardDescription>
              Erstellen Sie eine neue Kontaktperson für den Kostenträger.
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

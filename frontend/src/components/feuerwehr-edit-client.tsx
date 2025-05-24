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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFeuerwehr, updateFeuerwehr, getKostentraeger } from "@/lib/api";
import type { Kostentraeger } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Der Name muss mindestens 2 Zeichen lang sein.",
  }),
  kostentraeger_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function FeuerwehrEditClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kostentraeger, setKostentraeger] = useState<Kostentraeger[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      kostentraeger_id: "0", // Updated default value to be a non-empty string
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [feuerwehrData, kostentraegerData] = await Promise.all([
          getFeuerwehr(id),
          getKostentraeger(),
        ]);

        form.reset({
          name: feuerwehrData.name,
          kostentraeger_id: feuerwehrData.kostentraeger
            ? feuerwehrData.kostentraeger.toString()
            : "0", // Updated default value to be a non-empty string
        });

        setKostentraeger(kostentraegerData);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        toast.error("Die Daten konnten nicht geladen werden.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, form, router]);

  async function onSubmit(values: FormData) {
    setSubmitting(true);
    try {
      const feuerwehrData = {
        name: values.name,
        kostentraeger: values.kostentraeger_id
          ? Number.parseInt(values.kostentraeger_id)
          : null,
      };

      await updateFeuerwehr(id, feuerwehrData);
      toast.success("Die Feuerwehr wurde erfolgreich aktualisiert.");
      router.push(`/feuerwehr/${id}`);
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Feuerwehr:", error);
      toast.error("Die Feuerwehr konnte nicht aktualisiert werden.");
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
            <CardTitle>Feuerwehr bearbeiten</CardTitle>
            <CardDescription>
              Bearbeiten Sie die Daten der Feuerwehr.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Name der Feuerwehr"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kostentraeger">Kostenträger</Label>
                <Select
                  value={form.watch("kostentraeger_id")}
                  onValueChange={(value) =>
                    form.setValue("kostentraeger_id", value)
                  }
                >
                  <SelectTrigger id="kostentraeger">
                    <SelectValue placeholder="Kostenträger auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Kein Kostenträger</SelectItem>
                    {kostentraeger.map((kt) => (
                      <SelectItem key={kt.id} value={kt.id.toString()}>
                        {kt.firma}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
      </div>
    </DashboardLayout>
  );
}

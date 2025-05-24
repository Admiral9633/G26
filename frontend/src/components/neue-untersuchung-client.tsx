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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createUntersuchung } from "@/lib/api";

const formSchema = z
  .object({
    untersuchungsdatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Bitte geben Sie ein gültiges Datum im Format YYYY-MM-DD ein.",
    }),
    naechste_untersuchung: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Bitte geben Sie ein gültiges Datum im Format YYYY-MM-DD ein.",
      })
      .optional()
      .or(z.literal("")),
    erstuntersuchung: z.boolean().default(false),
    nachuntersuchung: z.boolean().default(false),
    bewertung: z.enum(["JA", "NEIN", "BEDINGT"], {
      required_error: "Bitte wählen Sie eine Bewertung aus.",
    }),
    bemerkungen: z.string().optional(),
  })
  .refine((data) => !(data.erstuntersuchung && data.nachuntersuchung), {
    message:
      "Es kann nur ein Untersuchungstyp (Erstuntersuchung oder Nachuntersuchung) ausgewählt werden.",
    path: ["erstuntersuchung"],
  })
  .refine((data) => data.erstuntersuchung || data.nachuntersuchung, {
    message:
      "Es muss ein Untersuchungstyp (Erstuntersuchung oder Nachuntersuchung) ausgewählt werden.",
    path: ["erstuntersuchung"],
  });

type FormData = z.infer<typeof formSchema>;

export function NeueUntersuchungClient({
  patientId,
  feuerwehrId,
}: {
  patientId: string;
  feuerwehrId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      untersuchungsdatum: new Date().toISOString().split("T")[0],
      naechste_untersuchung: "",
      erstuntersuchung: false,
      nachuntersuchung: false,
      bewertung: "JA",
      bemerkungen: "",
    },
  });

  async function onSubmit(values: FormData) {
    setLoading(true);
    try {
      const untersuchungData = {
        ...values,
        patient: Number.parseInt(patientId, 10),
        naechste_untersuchung: values.naechste_untersuchung || null,
      };

      await createUntersuchung(untersuchungData);
      toast.success("Die Untersuchung wurde erfolgreich erstellt.");
      router.push(`/feuerwehr/${feuerwehrId}/patient/${patientId}`);
    } catch (error) {
      console.error("Fehler beim Erstellen der Untersuchung:", error);
      toast.error("Die Untersuchung konnte nicht erstellt werden.");
    } finally {
      setLoading(false);
    }
  }

  const handleUntersuchungstypChange = (
    type: "erst" | "nach",
    checked: boolean
  ) => {
    if (type === "erst") {
      form.setValue("erstuntersuchung", checked);
      if (checked) form.setValue("nachuntersuchung", false);
    } else {
      form.setValue("nachuntersuchung", checked);
      if (checked) form.setValue("erstuntersuchung", false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Neue Untersuchung erstellen</CardTitle>
            <CardDescription>
              Erstellen Sie eine neue Untersuchung für den Patienten.
            </CardDescription>
          </CardHeader>
          <form onSubmit={form.handleSubmit(() => setShowConfirmDialog(true))}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="untersuchungsdatum">Untersuchungsdatum</Label>
                  <Input
                    id="untersuchungsdatum"
                    type="date"
                    {...form.register("untersuchungsdatum")}
                  />
                  {form.formState.errors.untersuchungsdatum && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.untersuchungsdatum.message}
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
                  {form.formState.errors.naechste_untersuchung && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.naechste_untersuchung.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Untersuchungstyp</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="erstuntersuchung"
                      checked={form.watch("erstuntersuchung")}
                      onCheckedChange={(checked) =>
                        handleUntersuchungstypChange("erst", checked as boolean)
                      }
                    />
                    <Label htmlFor="erstuntersuchung">Erstuntersuchung</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nachuntersuchung"
                      checked={form.watch("nachuntersuchung")}
                      onCheckedChange={(checked) =>
                        handleUntersuchungstypChange("nach", checked as boolean)
                      }
                    />
                    <Label htmlFor="nachuntersuchung">Nachuntersuchung</Label>
                  </div>
                </div>
                {form.formState.errors.erstuntersuchung && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.erstuntersuchung.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Bewertung</Label>
                <RadioGroup
                  defaultValue="JA"
                  onValueChange={(value) =>
                    form.setValue(
                      "bewertung",
                      value as "JA" | "NEIN" | "BEDINGT"
                    )
                  }
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="JA" id="bewertung-ja" />
                    <Label htmlFor="bewertung-ja">Geeignet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NEIN" id="bewertung-nein" />
                    <Label htmlFor="bewertung-nein">Nicht geeignet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BEDINGT" id="bewertung-bedingt" />
                    <Label htmlFor="bewertung-bedingt">Bedingt geeignet</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.bewertung && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.bewertung.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bemerkungen">Bemerkungen</Label>
                <Textarea id="bemerkungen" {...form.register("bemerkungen")} />
                {form.formState.errors.bemerkungen && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.bemerkungen.message}
                  </p>
                )}
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

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Untersuchung erstellen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diese Untersuchung erstellen möchten?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                setShowConfirmDialog(false);
                onSubmit(form.getValues());
              }}
            >
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

import { NeuerPatientClient } from "@/components/neuer-patient-client";

export default async function NeuerPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NeuerPatientClient feuerwehrId={id} />;
}

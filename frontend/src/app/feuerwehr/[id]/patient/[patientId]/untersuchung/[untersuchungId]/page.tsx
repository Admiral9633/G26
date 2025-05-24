import { UntersuchungBearbeitenClient } from "@/components/untersuchung-bearbeiten-client";

export default async function UntersuchungBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string; patientId: string; untersuchungId: string }>;
}) {
  const { id, patientId, untersuchungId } = await params;
  return (
    <UntersuchungBearbeitenClient
      feuerwehrId={id}
      patientId={patientId}
      untersuchungId={untersuchungId}
    />
  );
}

import { NeueUntersuchungClient } from "@/components/neue-untersuchung-client";

export default async function NeueUntersuchungPage({
  params,
}: {
  params: Promise<{ id: string; patientId: string }>;
}) {
  const { id, patientId } = await params;
  return <NeueUntersuchungClient feuerwehrId={id} patientId={patientId} />;
}

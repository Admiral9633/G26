import { NeueKontaktpersonClient } from "@/components/neue-kontaktperson-client";

export default async function NeueKontaktpersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NeueKontaktpersonClient kostentraegerId={id} />;
}

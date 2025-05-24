import { KontaktpersonenClient } from "@/components/kontaktpersonen-client";

export default async function KontaktpersonenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KontaktpersonenClient kostentraegerId={id} />;
}

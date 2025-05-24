import { KostentraegerDetailClient } from "@/components/kostentraeger-detail-client";

export default async function KostentraegerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KostentraegerDetailClient kostentraegerId={id} />;
}

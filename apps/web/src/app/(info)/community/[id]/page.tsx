import { CommunityBakedGoodDetail } from "@/components/community-baked-good-detail";

export default async function CommunityBakedGoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommunityBakedGoodDetail id={id} />;
}

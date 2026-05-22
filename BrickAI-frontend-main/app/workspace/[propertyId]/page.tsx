import { notFound } from "next/navigation";
import { PropertyWorkspacePage } from "@/src/components/PropertyWorkspacePage";
import { findProperty } from "@/src/data/property-feed";

type WorkspacePageProps = {
  params: Promise<{
    propertyId: string;
  }>;
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function WorkspacePage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const { propertyId } = await params;
  const { message } = await searchParams;
  const property = findProperty(propertyId);

  if (!property) {
    notFound();
  }

  return <PropertyWorkspacePage property={property} initialMessage={message} />;
}

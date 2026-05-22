import { notFound, redirect } from "next/navigation";
import { findProperty } from "@/src/data/property-feed";

type ReportPageProps = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { propertyId } = await params;
  const property = findProperty(propertyId);

  if (!property) {
    notFound();
  }

  redirect(`/workspace/${propertyId}#report-summary`);
}

import { notFound } from "next/navigation";
import { getAllParks, getParkBySlug, getNearbyResources, getReviews, getEmergencyVets, getAdCreatives } from "@/lib/queries";
import ParkScreen from "@/app/components/park-screen";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const parks = await getAllParks();
  return parks.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const park = await getParkBySlug(slug);
  if (!park) return { title: "Park not found" };
  return {
    title: `${park.name} · Sniff Denver`,
    description: park.blurb,
  };
}

export default async function ParkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [park, nearby, reviews, vets, ads] = await Promise.all([
    getParkBySlug(slug),
    getNearbyResources(slug),
    getReviews(slug),
    getEmergencyVets(),
    getAdCreatives(),
  ]);

  if (!park) notFound();

  return <ParkScreen park={park} nearby={nearby} reviews={reviews} vets={vets} ads={ads} />;
}

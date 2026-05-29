import { getAllParks, getAdCreatives } from "@/lib/queries";
import MapScreen from "@/app/components/map-screen";

export default async function MapPage() {
  const [parks, ads] = await Promise.all([getAllParks(), getAdCreatives()]);
  return <MapScreen parks={parks} ads={ads} />;
}

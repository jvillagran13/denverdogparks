import { getAllParks, getAdCreatives } from "@/lib/queries";
import SavedScreen from "@/app/components/saved-screen";

export default async function SavedPage() {
  const [parks, ads] = await Promise.all([getAllParks(), getAdCreatives()]);
  return <SavedScreen parks={parks} ads={ads} />;
}

import { getAllParks } from "@/lib/queries";
import CompareScreen from "@/app/components/compare-screen";

export default async function ComparePage() {
  const parks = await getAllParks();
  return <CompareScreen parks={parks} />;
}

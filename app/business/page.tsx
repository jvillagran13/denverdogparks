import { getAllParks } from "@/lib/queries";
import PromoteScreen from "@/app/components/promote-screen";

export default async function BusinessPage() {
  const parks = await getAllParks();
  return <PromoteScreen parks={parks} />;
}

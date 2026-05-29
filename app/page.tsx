import { getAllParks, getAdCreatives } from "@/lib/queries";
import HomeScreen from "./components/home-screen";

export default async function Page() {
  const [parks, ads] = await Promise.all([getAllParks(), getAdCreatives()]);
  return <HomeScreen parks={parks} ads={ads} />;
}

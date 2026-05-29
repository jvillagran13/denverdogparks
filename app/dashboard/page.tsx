import { getAllParks } from "@/lib/queries";
import { getDashboardData } from "@/lib/queries";
import DashboardScreen from "@/app/components/dashboard-screen";

export default async function DashboardPage() {
  const [parks, dashboard] = await Promise.all([getAllParks(), getDashboardData()]);
  return <DashboardScreen parks={parks} dashboard={dashboard} />;
}

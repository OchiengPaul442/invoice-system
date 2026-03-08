import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { auth } from "@/lib/auth";

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <DashboardClient />;
}


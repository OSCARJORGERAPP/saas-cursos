import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/courses");
  return <>{children}</>;
}

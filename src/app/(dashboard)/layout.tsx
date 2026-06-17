import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import ChatWidget from "@/components/chat/ChatWidget";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role={session.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={session} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <ChatWidget />
      </div>
    </div>
  );
}
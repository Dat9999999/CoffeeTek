import AppSidebar from "@/components/layouts/AppSidebar";
import Navbar from "@/components/layouts/Navbar";
import PublicFooter from "@/components/layouts/public-footer";
import PublicHeader from "@/components/layouts/public-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main className="w-full  max-w-full">
          <Navbar />
          <div className="px-4 ">{children}</div>
        </main>
      </SidebarProvider>
    </>

  )
}

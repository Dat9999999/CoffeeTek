import PublicFooter from "@/components/layouts/public-footer";
import PublicHeader from "@/components/layouts/public-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PublicHeader />
      <div className="min-h-screen flex">
        <aside className="w-64 border-r p-4">Dashboard Sidebar</aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
      <PublicFooter />
    </div>


  )
}

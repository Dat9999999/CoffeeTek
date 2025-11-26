import { SuspenseWrapper } from "@/components/commons";
import PublicFooter from "@/components/layouts/public-footer";
import PublicHeader from "@/components/layouts/public-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (

    <div className="min-h-screen flex flex-col">

      <PublicHeader />
      <SuspenseWrapper>

        <main className="flex-1">{children}</main>
      </SuspenseWrapper>

      <PublicFooter />

    </div>
  )
}

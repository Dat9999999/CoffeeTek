"use client";
import 'antd/dist/reset.css'; // CSS reset mới của Antd
import type { ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntConfigProvider, DarkModeProvider } from '@/components/providers';
import { AdminShell } from '@/components/layouts';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <DarkModeProvider>
        <AntConfigProvider>

          <AdminShell>{children}</AdminShell>

        </AntConfigProvider>
      </DarkModeProvider>
    </AntdRegistry>

  );
}

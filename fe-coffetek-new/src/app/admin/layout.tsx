"use client";
// @ts-ignore
import 'antd/dist/reset.css'; // CSS reset mới của Antd
import type { ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntConfigProvider, DarkModeProvider } from '@/components/providers';
import { AdminShell } from '@/components/layouts';
import { SuspenseWrapper } from '@/components/commons';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <DarkModeProvider>
        <AntConfigProvider>

          <AdminShell>
            <SuspenseWrapper>
              {children}
            </SuspenseWrapper>
          </AdminShell>

        </AntConfigProvider>
      </DarkModeProvider>
    </AntdRegistry>

  );
}

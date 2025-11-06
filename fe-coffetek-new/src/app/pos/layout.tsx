"use client";
// @ts-ignore
import 'antd/dist/reset.css'; // CSS reset mới của Antd
import type { ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntConfigProvider, DarkModeProvider } from '@/components/providers';
import { AdminShell, PosShell } from '@/components/layouts';
import { SuspenseWrapper } from '@/components/commons';
import { GlobalNotifiers } from '@/components/listeners';

export default function PosLayout({ children }: { children: ReactNode }) {
    return (
        <AntdRegistry>
            <DarkModeProvider>
                <AntConfigProvider>

                    <PosShell>
                        <SuspenseWrapper>
                            <GlobalNotifiers />
                            {children}
                        </SuspenseWrapper>
                    </PosShell>

                </AntConfigProvider>
            </DarkModeProvider>
        </AntdRegistry>

    );
}

"use client";
// @ts-ignore
import 'antd/dist/reset.css'; // CSS reset mới của Antd
import type { ReactNode } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntConfigProvider, DarkModeProvider } from '@/components/providers';
import { SuspenseWrapper } from '@/components/commons';

export default function PublicNoLayout({ children }: { children: ReactNode }) {
    return (
        <AntdRegistry>
            <DarkModeProvider>
                <AntConfigProvider>

                    <SuspenseWrapper>
                        {children}
                    </SuspenseWrapper>

                </AntConfigProvider>
            </DarkModeProvider>
        </AntdRegistry>

    );
}

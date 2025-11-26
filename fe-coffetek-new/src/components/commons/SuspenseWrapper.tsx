'use client';

import React, { Suspense } from 'react';
import { Spin, Flex } from 'antd';

interface SuspenseWrapperProps {
    children: React.ReactNode;
    size?: 'small' | 'default' | 'large';
    tip?: string;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
    children,
    size = 'default',
}) => {
    return (
        <Suspense
            fallback={
                <Flex
                    align="center"
                    justify="center"
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <Spin size={size}>
                    </Spin>
                </Flex>
            }
        >
            {children}
        </Suspense>
    );
};

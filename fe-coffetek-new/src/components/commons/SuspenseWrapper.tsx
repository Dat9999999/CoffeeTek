'use client';

import React, { Suspense } from 'react';
import { Spin, Flex } from 'antd';

interface SuspenseWrapperProps {
    children: React.ReactNode;
    size?: 'small' | 'default' | 'large';
    tip?: string;
}

/**
 * SuspenseWrapper - dùng chung cho toàn bộ app
 * Hiển thị loading Ant Design đẹp trong khi chờ lazy components hoặc dữ liệu tải.
 */
export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
    children,
    size = 'large',
    tip = 'Loading...',
}) => {
    return (
        <Suspense
            fallback={
                <Flex
                    align="center"
                    justify="center"
                    style={{
                        width: '100%',
                        height: '60vh',
                    }}
                >
                    <Spin size={size} tip={tip} />
                </Flex>
            }
        >
            {children}
        </Suspense>
    );
};

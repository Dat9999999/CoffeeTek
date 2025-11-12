import React from 'react'

import { Flex, Typography } from 'antd';

const { Title } = Typography;

interface PageHeaderProps {
    title?: string;
    style?: React.CSSProperties;
    icon?: React.ReactNode;
}

export const PageHeader = ({ title, style, icon }: PageHeaderProps) => {
    return (
        <>
            <Title level={3} style={{ marginBottom: 15, ...style }}>
                <Flex align="center">
                    {icon ? <span className='mr-2'>{icon}</span> : null}
                    {title ? title : 'Page Title'}
                </Flex>
            </Title>
        </>
    );

}


'use client';
import React, { useState } from 'react';
import {
    Button,
    message,
    Steps,
    theme,
    Card,
    Typography,
    Flex,
    Space,
    Row,
    Col,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { CreateRecipe } from '@/components/features/recipes';
import { CreateProductInfo } from '@/components/features/products';



const { Title } = Typography;

const steps = [
    {
        title: 'Product Information',
        content: 'CreateProductInfo',
    },
    {
        title: 'Recipe',
        content: 'CreateRecipe',
    },
];

const CreateProductWithSteps: React.FC = () => {
    const router = useRouter();
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);
    const [productId, setProductId] = useState<number | null>(null);

    const items = steps.map((item) => ({ key: item.title, title: item.title }));

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const handleProductCreated = (id: number) => {
        setProductId(id);
        next();
        message.success('Product created successfully! Now create recipe.');
    };

    const handleRecipeCreated = () => {
        message.success("Recipe for the product was created successfully!");
        router.push('/admin/products');
    };

    const handleBackToProducts = () => {
        router.push('/admin/products');
    };

    const renderContent = () => {
        switch (current) {
            case 0:
                return (
                    <CreateProductInfo
                        onProductCreated={handleProductCreated}
                        onCancel={handleBackToProducts}
                    />
                );
            case 1:
                return (
                    <CreateRecipe
                        productId={productId!}
                        onRecipeCreated={handleRecipeCreated}
                        onCancel={handleBackToProducts}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <Flex align="center" justify="space-between" wrap style={{ marginBottom: 24 }}>
                <Space align="center" wrap>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        onClick={handleBackToProducts}
                    />
                    <Title level={3} style={{ margin: 0 }}>
                        Create Product
                    </Title>
                </Space>
            </Flex>

            <Card>
                <Steps current={current} items={items} style={{ marginBottom: 32 }} />

                <div style={{ minHeight: '500px' }}>
                    {renderContent()}
                </div>
            </Card>
        </div>
    );
};

export default CreateProductWithSteps;
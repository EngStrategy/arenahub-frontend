'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, App, Spin, Alert, Flex, Tag, Descriptions, Result, Divider } from 'antd';
import { useTheme } from '@/context/ThemeProvider';
import { useRouter } from 'next/navigation';
import { getMinhaAssinatura, createCustomerPortalSession, AssinaturaDetalhes } from '@/app/api/entities/subscriptionStripe';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const statusConfig: Record<AssinaturaDetalhes['status'], { color: string, text: string, icon: React.ReactNode }> = {
    ATIVA: { color: 'success', text: 'Ativa', icon: <CheckCircleOutlined /> },
    ATRASADA: { color: 'error', text: 'Pagamento Pendente', icon: <ExclamationCircleOutlined /> },
    CANCELADA: { color: 'warning', text: 'Cancelada', icon: <CloseCircleOutlined /> },
    INATIVA: { color: 'default', text: 'Inativa', icon: <SyncOutlined spin /> },
};

export default function AssinaturaPage() {
    const { isDarkMode } = useTheme();
    const { message } = App.useApp();
    const router = useRouter();

    const [assinaturas, setAssinaturas] = useState<AssinaturaDetalhes[]>([]);
    const [loading, setLoading] = useState(true);
    const [portalLoading, setPortalLoading] = useState(false);

    useEffect(() => {
        const fetchAssinatura = async () => {
            try {
                const data = await getMinhaAssinatura();
                setAssinaturas(data || []);
            } catch (error) {
                console.error("Erro ao buscar dados da assinatura:", error);
                message.error("Não foi possível carregar os detalhes da sua assinatura.");
            } finally {
                setLoading(false);
            }
        };
        fetchAssinatura();
    }, [message]);

    const handleManageSubscription = async () => {
        setPortalLoading(true);
        try {
            const { url } = await createCustomerPortalSession();
            window.location.href = url;
        } catch (error) {
            console.error("Erro ao abrir o portal de gerenciamento:", error);
            message.error("Não foi possível abrir o portal de gerenciamento. Tente novamente.");
            setPortalLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <Flex justify="center" className="py-20"><Spin size="large" /></Flex>;
        }

        if (assinaturas.length > 0) {
            return (
                <Flex vertical gap="large">
                    {assinaturas.map((assinatura, index) => {
                        const currentStatus = statusConfig[assinatura.status] || statusConfig.INATIVA;
                        const dataExibicao = assinatura.dataCancelamento || assinatura.proximaCobranca;

                        return (
                            <Card key={`index-${index}`} className="w-full">
                                <Descriptions
                                    title={
                                        <>
                                            Detalhes do Plano: <span className='!text-green-600'>{assinatura.planoNome}</span>
                                        </>
                                    }
                                    bordered
                                    column={1}
                                >
                                    <Descriptions.Item label="Status">
                                        <Tag icon={currentStatus.icon} color={currentStatus.color} className="!text-base !px-2 !py-1">
                                            {currentStatus.text}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Valor">
                                        {assinatura.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={assinatura.dataCancelamento ? "Válida até" : "Próxima Cobrança"}>
                                        {dataExibicao
                                            ? format(new Date(dataExibicao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                            : 'Data não informada'
                                        }
                                    </Descriptions.Item>
                                </Descriptions>
                                {assinatura.status === 'ATRASADA' && (
                                    <Alert
                                        message="Pagamento Pendente"
                                        description="Esta assinatura está com o pagamento atrasado. Atualize suas informações de pagamento para reativá-la."
                                        type="error"
                                        showIcon
                                        className="!mt-6"
                                    />
                                )}
                                {assinatura.status === 'CANCELADA' && assinatura.dataCancelamento && (
                                    <Alert
                                        message="Assinatura Cancelada"
                                        description={`Seu acesso ao plano permanecerá ativo até ${format(new Date(assinatura.dataCancelamento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.`}
                                        type="warning"
                                        showIcon
                                        className="!mt-6"
                                    />
                                )}
                            </Card>
                        )
                    })}
                    <Divider />
                    <Flex vertical gap="middle">
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleManageSubscription}
                            loading={portalLoading}
                        >
                            Gerenciar Assinaturas e Pagamentos
                        </Button>
                    </Flex>
                </Flex>
            );
        }

        return (
            <Result
                status="warning"
                title="Nenhuma assinatura ativa"
                subTitle="Parece que você ainda não tem um plano ativo. Escolha um plano para desbloquear todos os recursos."
                extra={
                    <Button type="primary" size="large" onClick={() => router.push('/perfil/arena/planos')}>
                        Ver Planos
                    </Button>
                }
            />
        );
    };

    return (
        <Content className={`!px-8 sm:!px-4 !py-8 flex-1 !pb-20 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            <div className="max-w-4xl mx-auto">
                <Title level={2} className="!mb-2">Gestão de Assinatura</Title>
                <Paragraph className="!text-lg text-gray-500 mb-8">
                    Aqui você pode visualizar o status do seu plano, gerenciar pagamentos e fazer alterações.
                </Paragraph>

                {renderContent()}

            </div>
        </Content>
    );
}
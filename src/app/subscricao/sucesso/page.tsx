'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Flex, Layout, Result, Spin, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/hooks/use-auth';
import { getMe } from '@/app/api/entities/user';
import { useSession } from 'next-auth/react';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function PagamentoSucessoPage() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const { status, update } = useSession();
    const hasRefreshed = useRef(false);

    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status !== "authenticated" || hasRefreshed.current) return;

        const verifyAndRefreshSession = async () => {
            try {
                const freshUserData = await getMe();

                if (freshUserData) {
                    await update({
                        name: freshUserData.name,
                        picture: freshUserData.imageUrl,
                        statusAssinatura: freshUserData.statusAssinatura,
                        cpfCnpj: freshUserData.cpfCnpj,
                    });
                    hasRefreshed.current = true;
                } else {
                    throw new Error("Não foi possível obter os dados atualizados do usuário.");
                }
            } catch (err) {
                console.error("Falha ao verificar sessão ou atualizar dados:", err);
                setError("Houve um problema ao verificar sua assinatura. Por favor, tente fazer login novamente.");
            } finally {
                setVerifying(false);
            }
        };

        verifyAndRefreshSession();
    }, [status, update]);

    if (verifying) {
        return (
            <Content
                className="flex items-center justify-center min-h-screen"
                style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
            >
                <Flex
                    justify="center"
                    align="center"
                    className="h-screen"
                >
                    <Spin size="large" />
                    <Typography.Text className="ml-4">Finalizando e ativando sua assinatura...</Typography.Text>
                </Flex>
            </Content>
        );
    }

    if (error) {
        return (
            <Content
                className="flex items-center justify-center min-h-screen"
                style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
            >
                <Result
                    status="error"
                    title="Falha na Verificação da Assinatura"
                    subTitle={error}
                    extra={[<Button type="primary" key="login" size="large" onClick={() => router.push('/login')}>Fazer Login</Button>]}
                />
            </Content>
        )
    }

    return (
        <Content
            className="flex items-center justify-center min-h-screen"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
        >
            <Result
                status="success"
                title={<Title level={2} className="!text-green-600">Pagamento Realizado com Sucesso!</Title>}
                subTitle={
                    <Paragraph className="!text-lg max-w-lg mx-auto">
                        Sua assinatura foi ativada. Agora você tem acesso a todos os recursos para gerenciar e impulsionar sua arena.
                    </Paragraph>
                }
                extra={[
                    <Button type="primary" key="dashboard" size="large" onClick={() => router.push('/dashboard')}>
                        Ir para o meu Dashboard
                    </Button>,
                ]}
            />
        </Content>
    );
}
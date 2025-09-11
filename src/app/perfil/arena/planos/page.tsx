'use client';
import { loadStripe } from '@stripe/stripe-js';
import { Card, App, Flex, Typography, List, Tag, Divider } from 'antd';
import { useState } from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { createCheckoutSession } from '@/app/api/entities/subscriptionStripe';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { useTheme } from '@/context/ThemeProvider';
import { PlanosPageSkeleton } from './skeletonPlanos';
import { useAuth } from '@/context/hooks/use-auth';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const priceIdMensal = process.env.NEXT_PUBLIC_STRIPE_ID_PRICE_ARENAHUB_MENSAL;
const priceIdTrimestral = process.env.NEXT_PUBLIC_STRIPE_ID_PRICE_ARENAHUB_TRIMESTRAL;
const priceIdSemestral = process.env.NEXT_PUBLIC_STRIPE_ID_PRICE_ARENAHUB_SEMESTRAL;

const planos = [
    {
        nome: "Mensal",
        priceId: priceIdMensal,
        preco: "R$ 99,90",
        periodo: "/mês",
        descricao: "Ideal para começar sem compromisso de longo prazo.",
        features: [
            "Gerenciamento de até 3 quadras",
            "Agenda online completa",
            "Relatórios básicos de agendamento",
            "Suporte via email"
        ],
        destaque: false,
    },
    {
        nome: "Trimestral",
        priceId: priceIdTrimestral,
        preco: "R$ 89,90",
        periodo: "/mês",
        descricao: "O melhor custo-benefício para arenas em crescimento.",
        economia: "Economize 10%",
        features: [
            "Gerenciamento de quadras ilimitado",
            "Tudo do plano Mensal",
            "Relatórios financeiros avançados",
            "Suporte prioritário via WhatsApp"
        ],
        destaque: true,
    },
    {
        nome: "Semestral",
        priceId: priceIdSemestral,
        preco: "R$ 79,90",
        periodo: "/mês",
        descricao: "Máxima economia para arenas estabelecidas.",
        economia: "Economize 20%",
        features: [
            "Tudo do plano Trimestral",
            "Personalização da página da arena",
            "Acesso antecipado a novas funcionalidades",
            "Gerente de conta dedicado"
        ],
        destaque: false,
    },
];

export default function PlanosPage() {
    const { message } = App.useApp();
    const { isLoadingSession } = useAuth();
    const { isDarkMode } = useTheme();
    const [loadingPriceId, setLoadingPriceId] = useState<string>('');

    const handleSubscribe = async (priceId: string) => {
        setLoadingPriceId(priceId);
        try {
            const { sessionId } = await createCheckoutSession(priceId);

            const stripe = await stripePromise;
            const redirectResult = await stripe?.redirectToCheckout({ sessionId });

            if (redirectResult?.error) {
                message.error(redirectResult.error.message || "Não foi possível redirecionar para o pagamento.");
            }

        } catch (error: any) {
            console.error("Erro ao iniciar assinatura:", error);
            message.error(error.message || "Ocorreu um erro. Tente novamente.");
            setLoadingPriceId('');
        }
    };

    if (isLoadingSession) {
        return <PlanosPageSkeleton />;
    }

    return (
        <div className={`px-4 sm:px-10 lg:px-20 pt-8 pb-20 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            <div className="text-center mb-12">
                <Title level={1}>Planos flexíveis para sua Arena</Title>
                <Paragraph className="!text-lg !max-w-2xl !mx-auto !text-gray-500">
                    Escolha o plano que melhor se adapta ao tamanho e às necessidades do seu negócio.
                </Paragraph>
                <Paragraph className="!font-bold !text-md !max-w-2xl !mx-auto !text-gray-500">
                    Todos os planos incluem um período de teste gratuito de 30 dias. Cancele quando quiser.
                </Paragraph>
            </div>

            <Flex justify="center" align="center" gap={32} className="flex-wrap">
                {planos.map((plano, index) => (
                    <motion.div
                        key={plano.priceId}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Card
                            className={`!w-full !max-w-sm !transform !transition-transform !duration-300 hover:!-translate-y-2 !flex !flex-col
                                ${plano.destaque ? '!border-2 !border-green-500' : '!border-gray-200'}`}
                            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                            styles={{ body: { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '2rem' } }}
                        >
                            {plano.destaque && (
                                <Tag color="green" className="!absolute !top-4 !right-4 !font-bold !tracking-wider">MAIS POPULAR</Tag>
                            )}
                            <Flex vertical align="center" className="!flex-grow">
                                <Title level={3}>{plano.nome}</Title>
                                <Paragraph type="secondary" className="!text-center !h-12">{plano.descricao}</Paragraph>

                                <Flex align="baseline" gap={4} className="my-4">
                                    <Title level={1} className="!m-0">{plano.preco}</Title>
                                    <Text type="secondary">{plano.periodo}</Text>
                                </Flex>

                                <Text className="!text-green-600 !font-semibold !mb-6">
                                    {plano.economia ? `${plano.economia} + 30 dias grátis` : 'Comece com 30 dias grátis'}
                                </Text>

                                <Divider />

                                <List
                                    dataSource={plano.features}
                                    renderItem={(item) => (
                                        <List.Item className="!border-none !px-0 !py-1">
                                            <Flex align="center" gap={8}>
                                                <CheckCircleOutlined className="!text-green-500" />
                                                <Text>{item}</Text>
                                            </Flex>
                                        </List.Item>
                                    )}
                                    className="!w-full !text-left !mb-6 !flex-grow"
                                />

                                <ButtonPrimary
                                    text="Começar Teste Grátis"
                                    onClick={() => plano.priceId && handleSubscribe(plano.priceId)}
                                    loading={loadingPriceId === plano.priceId}
                                    size="large"
                                    block
                                    ghost={!plano.destaque}
                                    disabled={!plano.priceId}
                                />
                            </Flex>
                        </Card>
                    </motion.div>
                ))}
            </Flex>
        </div>
    );
}

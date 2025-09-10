'use client';
import { Card, Flex, Typography, List, Tag, Divider } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { useTheme } from '@/context/ThemeProvider';
import { motion } from 'framer-motion';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

const planos = [
    {
        nome: "Mensal",
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
        preco: "R$ 89,90",
        periodo: "/mês",
        economia: "Economize 10%",
        descricao: "O melhor custo-benefício para arenas em crescimento.",
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
        preco: "R$ 79,90",
        periodo: "/mês",
        economia: "Economize 20%",
        descricao: "Máxima economia para arenas estabelecidas.",
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
    const { isDarkMode } = useTheme();

    return (
        <div className={`px-4 sm:px-10 lg:px-20 pt-8 pb-20 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            <div className="text-center mb-12">
                <Title level={1}>Planos flexíveis para a sua Arena</Title>
                <Paragraph className="!text-lg !max-w-2xl !mx-auto !text-gray-500">
                    Escolha o período de assinatura que faz mais sentido para sua Arena.
                    O cadastro é feito em seguida, e a escolha do plano é confirmada apenas após o registro.
                </Paragraph>
            </div>

            <Flex justify="center" align="center" gap={32} className="flex-wrap items-stretch">
                {planos.map((plano, index) => (
                    <motion.div
                        key={index}
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
                                {plano.economia && <Text className="!text-green-600 !font-semibold !mb-6">{plano.economia}</Text>}

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

                                <Link href="/registro?aba=arena" className='!w-full mt-3'>
                                    <ButtonPrimary
                                        text=" Cadastrar Arena"
                                        size="large"
                                        block
                                        ghost={!plano.destaque}
                                    />
                                </Link>
                            </Flex>
                        </Card>
                    </motion.div>
                ))}
            </Flex>
        </div>
    );
}


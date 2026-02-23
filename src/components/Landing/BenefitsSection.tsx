'use client';

import React from 'react';
import { Card, Flex, Typography, Avatar, Button } from 'antd';
import { Users, ShieldCheck, BarChart3, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';
import { CalendarOutlined, DollarCircleOutlined, TeamOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useTheme } from "@/context/ThemeProvider";

const { Title, Paragraph, Text } = Typography;

export function Benefits() {
    const { isDarkMode } = useTheme();
    const cardVariants = {
        offscreen: { y: 50, opacity: 0 },
        onscreen: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 20 }
        }
    } as const;

    return (
        <section
            id="benefits"
            className="py-20"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light-secondary)' }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    className="text-center max-w-3xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="text-xs uppercase tracking-widest font-bold text-green-600">Benefícios</span>
                    <h2 className={`mt-2 text-3xl sm:text-4xl font-extrabold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        Por que usar o ArenaHub?
                    </h2>
                    <p className={`mt-3 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Tudo o que você precisa para tirar seu jogo do papel — sem complicações.
                    </p>
                </motion.div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                    {/* Card de Benefícios para Arenas */}
                    <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }} variants={cardVariants} className="relative md:transform md:scale-105 z-10">
                        <div className="absolute -top-4 inset-x-0 flex justify-center z-20">
                            <span className="bg-green-600 text-white font-bold text-xs uppercase tracking-wider py-1 px-4 rounded-full shadow-md animate-pulse">
                                Recomendado para Gestores
                            </span>
                        </div>
                        <Card className={`h-full shadow-2xl transition-all duration-300 !border-2 !border-green-500 overflow-hidden
                            ${isDarkMode ? '!bg-gray-800 before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-900/20 before:to-transparent' : '!bg-white before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-50/50 before:to-transparent'}`}>
                            <div className="relative z-10">
                                <Flex vertical align="center" className="text-center p-4">
                                    <Avatar size={64} icon={<BarChart3 />} className="!bg-green-100 !text-green-600" />
                                    <Title level={3} className="mt-4">Para Arenas</Title>
                                    <Paragraph className="text-gray-500 font-medium">
                                        Otimize sua gestão e aumente a sua receita.
                                    </Paragraph>
                                    <ul className="space-y-3 text-left mt-4 text-base w-full">
                                        <li className="flex items-start">
                                            <BarChart3 size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                                            <span><strong>Eficiência:</strong> Reduza o trabalho manual com uma agenda automatizada.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <DollarCircleOutlined className="!text-green-500 mr-3 mt-1 text-xl flex-shrink-0" />
                                            <span><strong>Visibilidade:</strong> Atraia novos clientes e aumente a taxa de ocupação das suas quadras.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <CalendarOutlined className="!text-green-500 mr-3 mt-1 text-xl flex-shrink-0" />
                                            <span><strong>Controle Total:</strong> Gira horários, preços e pagamentos num só lugar.</span>
                                        </li>
                                    </ul>
                                    <div className="mt-8 w-full text-center">
                                        <Link href="/registro?aba=arena">
                                            <Button
                                                type="primary"
                                                size="large"
                                                block
                                                className='!bg-green-600 !text-white hover:!bg-green-700 hover:!scale-[1.02] !transition-all !h-12 !font-bold !text-base'
                                            >
                                                Comece com 30 Dias Grátis
                                            </Button>
                                        </Link>
                                        <Text type="secondary" className="!text-xs mt-3 block font-medium">
                                            Sem compromisso. Cancele quando quiser.
                                        </Text>
                                    </div>
                                </Flex>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Card de Benefícios para Atletas */}
                    <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }} variants={cardVariants}>
                        <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <Flex vertical align="center" className="text-center p-4">
                                <Avatar size={64} icon={<Users />} className="!bg-green-100 !text-green-600" />
                                <Title level={3} className="mt-4">Para Atletas</Title>
                                <Paragraph className="text-gray-500">
                                    A sua próxima partida está a poucos cliques de distância.
                                </Paragraph>
                                <ul className="space-y-3 text-left mt-4 text-base">
                                    <li className="flex items-center">
                                        <ShieldCheck size={20} className="text-green-500 mr-3 flex-shrink-0" />
                                        <span><strong>Confiabilidade:</strong> Reservas confirmadas em tempo real.</span>
                                    </li>
                                    <li className="flex items-center">
                                        <CalendarClock size={20} className="text-green-500 mr-3 flex-shrink-0" />
                                        <span><strong>Conveniência:</strong> Agende a qualquer hora, de qualquer lugar.</span>
                                    </li>
                                    <li className="flex items-center">
                                        <TeamOutlined className="!text-green-500 mr-3 text-xl flex-shrink-0" />
                                        <span><strong>Comunidade:</strong> Encontre jogos e junte-se a outros atletas.</span>
                                    </li>
                                </ul>
                            </Flex>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
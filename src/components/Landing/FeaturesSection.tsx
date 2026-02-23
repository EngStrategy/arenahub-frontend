'use client';

import React from 'react';
import { Card, Typography } from 'antd';
import { Search, LayoutDashboard, Globe, Shuffle, Star, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from "@/context/ThemeProvider";

const { Title, Paragraph } = Typography;

const features = [
    {
        icon: <Search size={28} className="text-blue-500" />,
        bgColor: "bg-blue-100",
        title: "Busca e Reservas Online",
        description: "Encontre a quadra ideal por desporto ou localização e agende o seu horário em segundos."
    },
    {
        icon: <Globe size={28} className="text-orange-500" />,
        bgColor: "bg-orange-100",
        title: "Jogos Abertos",
        description: "Não tem equipa completa? Crie ou participe em jogos abertos e nunca mais deixe de jogar."
    },
    {
        icon: <LayoutDashboard size={28} className="text-purple-500" />,
        bgColor: "bg-purple-100",
        title: "Painel de Gestão para Arenas",
        description: "Controle total sobre os seus horários, finanças e clientes num dashboard simples e poderoso."
    },
    {
        icon: <Shuffle size={28} className="text-red-500" />,
        bgColor: "bg-red-100",
        title: "Sorteador de Times",
        description: "Acabe com a discussão. Use o nosso sorteador para criar equipas equilibradas por nível técnico."
    },
    {
        icon: <Star size={28} className="text-yellow-500" />,
        bgColor: "bg-yellow-100",
        title: "Avaliações Reais",
        description: "Escolha as melhores quadras com base na opinião de outros atletas como você."
    },
    {
        icon: <Bell size={28} className="text-indigo-500" />,
        bgColor: "bg-indigo-100",
        title: "Notificações em Tempo Real",
        description: "Receba lembretes dos seus jogos e alertas sobre novas oportunidades na plataforma."
    }
];

export function Features() {
    const { isDarkMode } = useTheme();
    return (
        <section
            id="features" className="py-20"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark-secondary)' : 'var(--cor-fundo-light)' }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <span className="text-xs uppercase tracking-widest font-bold text-green-600">Funcionalidades</span>
                    <h2 className={`mt-2 text-3xl sm:text-4xl font-extrabold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        Tudo o que o seu jogo precisa
                    </h2>
                    <p className={`mt-3 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Uma plataforma completa, pensada para atletas e donos de arenas.
                    </p>
                </div>
                <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const isJogosAbertos = feature.title === "Jogos Abertos";
                        const isArenaPainel = feature.title === "Painel de Gestão para Arenas";

                        let cardStyles = `!bg-gray-50 hover:shadow-xl hover:-translate-y-1 ${isDarkMode && '!bg-zinc-900'}`;
                        if (isJogosAbertos) {
                            cardStyles = `!border-2 !border-orange-400 !bg-orange-50/50 hover:!shadow-orange-200 hover:-translate-y-2 !shadow-lg ${isDarkMode ? '!bg-orange-900/20 !border-orange-500/50' : ''}`;
                        } else if (isArenaPainel) {
                            cardStyles = `!border-2 !border-purple-300 !bg-purple-50/50 hover:!shadow-purple-200 hover:-translate-y-2 !shadow-lg md:scale-105 ${isDarkMode ? '!bg-purple-900/20 !border-purple-500/50' : ''}`;
                        }

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={isJogosAbertos || isArenaPainel ? "relative z-10" : ""}
                            >
                                {isJogosAbertos && (
                                    <div className="absolute -top-3 -right-3 z-10 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                                        Novo!
                                    </div>
                                )}
                                {isArenaPainel && (
                                    <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
                                        <span className="bg-purple-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                                            🌟 Exclusivo Parceiros
                                        </span>
                                    </div>
                                )}
                                <Card
                                    variant="borderless"
                                    className={`h-full text-center transition-all duration-300 ${cardStyles}`}
                                >
                                    <div className="p-4 mt-2">
                                        {/* O contêiner do ícone agora usa as cores dinâmicas */}
                                        <div className={`inline-flex p-4 rounded-full ${feature.bgColor} ${(isJogosAbertos || isArenaPainel) && 'shadow-inner'}`}>
                                            {feature.icon}
                                        </div>
                                        <Title level={4} className="!mt-5">{feature.title}</Title>
                                        <Paragraph type="secondary" className={`mt-2 ${((isJogosAbertos || isArenaPainel) && isDarkMode) ? '!text-gray-300' : ''}`}>
                                            {feature.description}
                                        </Paragraph>
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
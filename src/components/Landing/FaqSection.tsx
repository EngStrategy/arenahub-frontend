'use client';

import React from 'react';
import { Collapse, Typography } from 'antd';
import { motion } from 'framer-motion';
import { PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Paragraph } = Typography;

const faqItems = [
    {
        key: '1',
        label: 'Como encontro um jogo aberto para eu entrar?',
        children: <Paragraph>Se você estiver no celular, tem uma barra de navegação na parte inferior da tela. Senão, na parte superior(Menu) você encontrará a opção "Jogos abertos". Filtre por data, horário e localização para ver as opções disponíveis. Além disso, fique atento às notificações de novos jogos que podem ser criados por outros usuários.</Paragraph>
    },
    {
        key: '2',
        label: 'O ArenaHub é gratuito para atletas?',
        children: <Paragraph>Sim! Para atletas, a utilização da plataforma para procurar, agendar e participar em jogos é totalmente gratuita. Você paga apenas o valor do aluguel da quadra, diretamente com a Arena.</Paragraph>
    },
    {
        key: '3',
        label: 'Quais são os custos para as arenas?',
        children: <Paragraph>As arenas parceiras pagam uma pequena taxa de subscrição mensal, com planos flexíveis que se adaptam ao tamanho do seu negócio. Não cobramos comissões por agendamento. Visite a nossa página de <Link href="/planos" className="!text-green-600 !font-bold hover:!underline">planos</Link> para mais detalhes.</Paragraph>
    },
    {
        key: '4',
        label: 'Como é que a minha arena recebe os pagamentos dos atletas?',
        children: <Paragraph>Ainda estamos a desenvolver o sistema de pagamento direto para atletas. Por enquanto, o ArenaHub foca-se em fornecer a melhor ferramenta de gestão de horários, e os pagamentos são geridos diretamente entre a arena e o atleta, da forma que você já está habituado.</Paragraph>
    },
    {
        key: '5',
        label: 'Posso cancelar um agendamento?',
        children: <Paragraph>Sim. Cada arena define a sua própria política de cancelamento (ex: cancelamento gratuito até 24 horas antes do jogo). Esta informação estará sempre visível para si antes de confirmar qualquer agendamento.</Paragraph>
    }
];

export function Faq({ isDarkMode }: { readonly isDarkMode: boolean }) {
    return (
        <section
            id="faq"
            className="py-20"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light-secondary)' }}
        >
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    className="text-center max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-xs uppercase tracking-widest font-bold text-green-600">Perguntas Frequentes</span>
                    <h2 className={`mt-2 text-3xl sm:text-4xl font-extrabold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        Tudo o que você precisa saber
                    </h2>
                    <p className={`mt-3 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Dúvidas comuns sobre como o ArenaHub funciona.
                    </p>
                </motion.div>

                <motion.div
                    className="mt-10 space-y-4"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                >
                    <Collapse
                        items={faqItems}
                        bordered={false}
                        defaultActiveKey={['1']}
                        accordion
                        className="!bg-transparent"
                        expandIcon={({ isActive }) => <PlusOutlined rotate={isActive ? 45 : 0} className="!text-green-600" />}
                        style={{
                            '--antd-collapse-content-padding': '0 20px 20px',
                            '--antd-collapse-header-padding': '20px',
                        } as React.CSSProperties}
                    />
                </motion.div>
            </div>
        </section>
    );
}
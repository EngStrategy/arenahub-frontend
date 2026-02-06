"use client";

import React from 'react';
import { Layout, Typography, Divider } from 'antd';
import { useTheme } from '@/context/ThemeProvider';
import { ShieldCheck } from 'lucide-react';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

export default function PoliticaPrivacidadePage() {
    const { isDarkMode } = useTheme();

    return (
        <Layout className={`!px-4 sm:!px-10 lg:!px-40 !py-12 !flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            <Content>
                <div className="max-w-4xl mx-auto">
                    <header className="text-center mb-12">
                        <div className="flex justify-center mb-4">
                            <ShieldCheck size={48} className="text-green-500" />
                        </div>
                        <Title level={1}>Política de Privacidade</Title>
                        <Paragraph type="secondary" className="text-lg">
                            Sua privacidade é importante para nós. Entenda como coletamos, usamos e protegemos seus dados.
                        </Paragraph>
                        <Text type="secondary">Última atualização: {new Date().toLocaleDateString('pt-BR')}</Text>
                    </header>

                    <div className={`p-8 rounded-lg shadow-sm ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}>
                        <section className="mb-8">
                            <Title level={3}>1. Introdução</Title>
                            <Paragraph>
                                Bem-vindo ao ArenaHub. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma de agendamento de quadras esportivas e serviços relacionados.
                            </Paragraph>
                            <Paragraph>
                                Ao acessar ou usar o ArenaHub, você concorda com os termos desta política. Se você não concordar, por favor, não utilize nossos serviços.
                            </Paragraph>
                        </section>

                        <Divider />

                        <section className="mb-8">
                            <Title level={3}>2. Informações que Coletamos</Title>
                            <Paragraph>
                                Coletamos informações para fornecer e melhorar nossos serviços. Os tipos de dados coletados incluem:
                            </Paragraph>
                            <ul className="list-disc pl-6 space-y-2 text-base">
                                <li>
                                    <Text strong>Informações de Cadastro:</Text> Nome, e-mail, número de telefone, data de nascimento e senha.
                                </li>
                                <li>
                                    <Text strong>Informações de Pagamento:</Text> Detalhes necessários para processar pagamentos (processados de forma segura por terceiros, não armazenamos dados completos de cartão de crédito).
                                </li>
                                <li>
                                    <Text strong>Dados de Uso:</Text> Histórico de agendamentos, interações com a plataforma, registros de acesso (logs) e preferências.
                                </li>
                                <li>
                                    <Text strong>Localização:</Text> Podemos coletar sua localização aproximada para sugerir arenas próximas, mediante sua permissão.
                                </li>
                            </ul>
                        </section>

                        <Divider />

                        <section className="mb-8">
                            <Title level={3}>3. Como Usamos Suas Informações</Title>
                            <Paragraph>
                                Utilizamos seus dados para as seguintes finalidades:
                            </Paragraph>
                            <ul className="list-disc pl-6 space-y-2 text-base">
                                <li>Gerenciar sua conta e fornecer acesso à plataforma.</li>
                                <li>Processar agendamentos e pagamentos.</li>
                                <li>Enviar confirmações, atualizações e notificações sobre seus jogos.</li>
                                <li>Melhorar nossos serviços, suporte ao cliente e experiência do usuário.</li>
                                <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
                                <li>Cumprir obrigações legais.</li>
                            </ul>
                        </section>

                        <Divider />

                        <section className="mb-8">
                            <Title level={3}>4. Compartilhamento de Dados</Title>
                            <Paragraph>
                                Não vendemos suas informações pessoais. Podemos compartilhar seus dados apenas nas seguintes situações:
                            </Paragraph>
                            <ul className="list-disc pl-6 space-y-2 text-base">
                                <li>
                                    <Text strong>Com Arenas Parceiras:</Text> Para confirmar seus agendamentos (nome e telefone de contato).
                                </li>
                                <li>
                                    <Text strong>Prestadores de Serviço:</Text> Empresas que nos ajudam a operar o negócio (ex: processadores de pagamento, hospedagem), sob acordos de confidencialidade.
                                </li>
                                <li>
                                    <Text strong>Obrigações Legais:</Text> Quando exigido por lei ou ordem judicial.
                                </li>
                            </ul>
                        </section>

                        <Divider />

                        <section className="mb-8">
                            <Title level={3}>5. Segurança dos Dados</Title>
                            <Paragraph>
                                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela internet é 100% seguro.
                            </Paragraph>
                        </section>

                        <Divider />

                        <section className="mb-8">
                            <Title level={3}>6. Seus Direitos</Title>
                            <Paragraph>
                                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                            </Paragraph>
                            <ul className="list-disc pl-6 space-y-2 text-base">
                                <li>Acessar e corrigir seus dados pessoais.</li>
                                <li>Solicitar a exclusão de seus dados (respeitando obrigações legais de retenção).</li>
                                <li>Revogar consentimentos previamente dados.</li>
                                <li>Solicitar a portabilidade dos dados.</li>
                            </ul>
                            <Paragraph className="mt-4">
                                Para exercer esses direitos, entre em contato conosco através dos nossos canais de suporte.
                            </Paragraph>
                        </section>

                        <Divider />

                        <section>
                            <Title level={3}>7. Contato</Title>
                            <Paragraph>
                                Se tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:
                            </Paragraph>
                            <Paragraph>
                                <Text strong>E-mail:</Text> arenahub.2025@gmail.com<br />
                            </Paragraph>
                        </section>
                    </div>
                </div>
            </Content>
        </Layout>
    );
}

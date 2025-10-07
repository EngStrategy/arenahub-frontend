"use client";

import React from 'react';
import { Layout, Typography, Collapse, Divider, Card, Space, Row, Col } from 'antd';
import { MailOutlined, WhatsAppOutlined, QuestionCircleOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeProvider';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const faqGeral = [
    {
        key: 'g1',
        label: 'Como crio ou recupero minha conta?',
        children: <Paragraph>Para criar uma conta, clique em "Cadastre-se" na página inicial e preencha seus dados. Se esqueceu sua senha, utilize a opção "Esqueceu sua senha?" na página de login para iniciar o processo de recuperação.</Paragraph>,
    },
    {
        key: 'g2',
        label: 'Como atualizo minhas informações de perfil?',
        children: <Paragraph>Após fazer login, acesse a área "Meus Dados" no menu principal. Lá, você poderá editar seu nome, foto, e outras informações pessoais.</Paragraph>,
    },
];

const faqJogadores = [
    {
        key: 'j1',
        label: 'Como faço para agendar um horário em uma quadra?',
        children: <Paragraph>Na página inicial, utilize a busca para encontrar uma arena. Selecione a arena, escolha a quadra, a data e o horário desejado. Siga as instruções para confirmar e efetuar o pagamento do seu agendamento.</Paragraph>,
    },
    {
        key: 'j2',
        label: 'Posso cancelar um agendamento? Como funciona o reembolso?',
        children: <Paragraph>Sim, você pode cancelar um agendamento na seção "Meus Agendamentos". A política de cancelamento e reembolso varia de acordo com cada arena e a antecedência do cancelamento. Verifique as regras no momento da reserva.</Paragraph>,
    },
    {
        key: 'j3',
        label: 'O que são "Jogos Abertos"?',
        children: <Paragraph>"Jogos Abertos" são partidas criadas por outros usuários que precisam de mais jogadores. Você pode solicitar entrada nesses jogos para participar e dividir o custo da quadra. É uma ótima forma de jogar mesmo sem ter um time completo.</Paragraph>,
    },
];

const faqArenas = [
    {
        key: 'a1',
        label: 'Como cadastro minha arena na plataforma?',
        children: <Paragraph>Na pagina de login do sistema, clique em "Cadastre-se", vá para a aba de "Arenas" na qual você será guiado por um formulário para registrar as informações da sua arena.</Paragraph>,
    },
    {
        key: 'a2',
        label: 'Como gerencio os agendamentos recebidos?',
        children: <Paragraph>No computador (parte superior), no Celular (parte inferior), acesse "Agendamentos". Lá você terá uma visão completa de todos os agendamentos pendentes, confirmados e o histórico completo, podendo gerenciar cada um deles.</Paragraph>,
    },
    {
        key: 'a3',
        label: 'Como defino os preços e horários de funcionamento das minhas quadras?',
        children: (
            <Typography>
                <ol>
                    <li>
                        Após fazer login, acesse a área "Quadras" no menu principal. Lá, você poderá editar cada quadra individualmente para configurar os horários disponíveis e definir preços fixos ou variáveis para diferentes dias e horários.
                    </li>
                    <li>
                        No seu painel inicial tem uma seção de "Acesso Rápido", clique em "Gerenciar Quadras", você pode editar cada quadra individualmente para configurar os horários disponíveis e definir preços fixos ou variáveis para diferentes dias e horários.
                    </li>
                </ol>
            </Typography>
        ),
    }
];


export default function AjudaSuporte() {
    const { isDarkMode } = useTheme();

    return (
        <Layout className={`!px-4 sm:!px-10 lg:!px-20 !py-8 !flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            <Content >
                <div className="max-w-4xl mx-auto">
                    <header className="text-center mb-12">
                        <QuestionCircleOutlined style={{ fontSize: '48px', color: '#06d6a0' }} />
                        <Title level={1} className="!mt-4">Central de Ajuda e Suporte</Title>
                        <Paragraph type="secondary" className="text-lg">
                            Tire suas dúvidas, resolva problemas e encontre tudo que precisa para aproveitar nossa plataforma ao máximo.
                        </Paragraph>
                    </header>

                    <section id="faq" className="mb-12">
                        <Title level={2} className="text-center mb-8">Perguntas Frequentes (FAQ)</Title>
                        <Space direction="vertical" size="large" className="w-full">
                            <Collapse accordion items={faqGeral} size="large" bordered={false} className="bg-white rounded-lg shadow-sm" />

                            <Title level={4} className="!mt-6"><UserOutlined className="mr-2" />Para Jogadores</Title>
                            <Collapse accordion items={faqJogadores} size="large" bordered={false} className="bg-white rounded-lg shadow-sm" />

                            <Title level={4} className="!mt-6"><ShopOutlined className="mr-2" />Para Donos de Arena</Title>
                            <Collapse accordion items={faqArenas} size="large" bordered={false} className="bg-white rounded-lg shadow-sm" />
                        </Space>
                    </section>

                    <Divider />

                    <section id="contact" className="text-center">
                        <Title level={2} className="mb-4">Ainda precisa de ajuda?</Title>
                        <Paragraph type="secondary" className="text-lg mb-8">
                            Se não encontrou a resposta que procurava, entre em contato conosco. Nossa equipe está pronta para ajudar!
                        </Paragraph>

                        <Row gutter={[16, 16]} justify="center" className="mb-10">
                            <Col xs={24} sm={12}>
                                <Card hoverable className="text-center">
                                    <a href="mailto:arenahub.2025@gmail.com" className="!text-current hover:!text-green-primary">
                                        <MailOutlined className="text-3xl mb-2" />
                                        <Text strong className='!block'>Email</Text>
                                        <Text type="secondary">arenahub.2025@gmail.com</Text>
                                    </a>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Card hoverable className="text-center">
                                    <a href="https://wa.me/5589994673969" target="_blank" rel="noopener noreferrer" className="!text-current hover:!text-green-primary">
                                        <WhatsAppOutlined className="text-3xl mb-2" />
                                        <Text strong className='!block'>WhatsApp</Text>
                                        <Text type="secondary">(89) 99467-3969</Text>
                                    </a>
                                </Card>
                            </Col>
                        </Row>

                        {/* <Title level={3} className="mb-6">Ou nos envie uma mensagem</Title>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        className="text-left"
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="name"
                                    label="Seu nome"
                                    rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
                                >
                                    <Input placeholder="João da Silva" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="email"
                                    label="Seu email"
                                    rules={[{ required: true, message: 'Por favor, insira um email válido!', type: 'email' }]}
                                >
                                    <Input placeholder="seuemail@exemplo.com" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            name="subject"
                            label="Assunto"
                            rules={[{ required: true, message: 'Por favor, insira o assunto!' }]}
                        >
                            <Input placeholder="Ex: Problema com agendamento" />
                        </Form.Item>
                        <Form.Item
                            name="message"
                            label="Sua mensagem"
                            rules={[{ required: true, message: 'Por favor, escreva sua mensagem!' }]}
                        >
                            <Input.TextArea rows={5} placeholder="Descreva seu problema ou dúvida em detalhes..." />
                        </Form.Item>
                        <Form.Item className="text-center">
                            <Button type="primary" htmlType="submit" size="large" className="w-full sm:w-auto">
                                Enviar Mensagem
                            </Button>
                        </Form.Item>
                    </Form> */}
                    </section>
                </div>
            </Content>
        </Layout>
    );
}
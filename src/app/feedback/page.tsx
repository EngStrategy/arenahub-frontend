"use client"

import React, { useState, useEffect } from 'react';
import { Layout, Typography, Form, Input, Card, Row, Col, Space, App, Select } from 'antd';
import { useTheme } from '@/context/ThemeProvider';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { BulbOutlined, BugOutlined, HeartOutlined, MessageOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { MdOutlineEmail } from 'react-icons/md';
import { createFeedback, type FeedbackCreate } from '@/app/api/entities/feedback';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;

const FeedbackPageSkeleton = () => {
    return (
        <div className="animate-pulse bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <div className="h-10 md:h-12 bg-gray-300 rounded-lg w-1/3 max-w-sm mx-auto"></div>
                    <div className="h-4 bg-gray-300 rounded-md w-1/2 max-w-lg mx-auto mt-4"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
                        <div className="h-8 bg-gray-300 rounded-md w-1/2"></div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                <div className="h-10 bg-gray-300 rounded-md w-full"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                <div className="h-10 bg-gray-300 rounded-md w-full"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                                <div className="h-24 bg-gray-300 rounded-md w-full"></div>
                            </div>
                            <div className="h-12 bg-green-300 rounded-md w-full"></div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
                        <div className="h-8 bg-gray-300 rounded-md w-2/3"></div>
                        <div className="h-4 bg-gray-300 rounded-md w-full mt-4"></div>
                        <div className="pt-6 border-t border-gray-200 space-y-4">
                            <div className="h-6 bg-gray-300 rounded-md w-1/3"></div>
                            <div className="flex gap-4">
                                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function FeedbackPage() {
    const { isDarkMode } = useTheme();
    const [loadingPage, setLoadingPage] = useState(true);
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoadingPage(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        
        const payload: FeedbackCreate = {
            nome: values.name,
            email: values.email,
            tipo: values.feedbackType,
            mensagem: values.message,
        };

        try {
            await createFeedback(payload);
            message.success('Feedback enviado com sucesso! Agradecemos sua contribuição.');
            form.resetFields();
        } catch (error) {
            console.error("Erro ao enviar feedback:", error);
            message.error("Não foi possível enviar seu feedback. Tente novamente mais tarde.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingPage) {
        return <FeedbackPageSkeleton />;
    }

    return (
        <Layout className={isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}>
            <Content>
                <div className="py-16">
                    <div className="text-center mb-16 px-4">
                        <Title level={1}>Central de Feedback</Title>
                        <Paragraph className="!text-lg max-w-2xl mx-auto">
                            Sua opinião é fundamental para nós! Use este espaço para nos enviar sugestões de melhorias, relatar um bug ou simplesmente deixar um elogio. Juntos, podemos tornar o ArenaHub ainda melhor.
                        </Paragraph>
                    </div>

                    <div className="px-4 sm:px-10 lg:px-20">
                        <Row gutter={[{ xs: 24, sm: 32, md: 48 }, { xs: 48, sm: 32, md: 48 }]} align="top">
                            {/* Coluna do Formulário */}
                            <Col xs={24} lg={12}>
                                <Card variant='borderless' title={<Title level={3} className="!m-0">Deixe sua mensagem</Title>}>
                                    <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="name"
                                                    label="Nome"
                                                    rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
                                                >
                                                    <Input min={2} max={100} placeholder="Seu nome" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="email"
                                                    label="Email para contato"
                                                    rules={[{ required: true, type: 'email', message: 'Por favor, insira um email válido!' }]}
                                                >
                                                    <Input placeholder="seu.email@exemplo.com" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item name="feedbackType" label="Tipo de Feedback" rules={[{ required: true, message: 'Selecione o tipo de feedback!' }]}>
                                            <Select placeholder="Sobre o que você gostaria de falar?">
                                                <Option value="ELOGIO"><HeartOutlined className="mr-2" />Elogio</Option>
                                                <Option value="SUGESTAO_MELHORIA"><BulbOutlined className="mr-2" />Sugestão de Melhoria</Option>
                                                <Option value="RELATORIO_BUG"><BugOutlined className="mr-2" />Relatar um Problema/Bug</Option>
                                                <Option value="DUVIDA"><QuestionCircleOutlined className="mr-2" />Dúvida</Option>
                                                <Option value="OUTRO"><MessageOutlined className="mr-2" />Outro Assunto</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            name="message"
                                            label="Sua Mensagem"
                                            rules={[
                                                { required: true, message: 'Por favor, escreva sua mensagem!' },
                                                { max: 2000, message: 'A mensagem deve ter no máximo 2000 caracteres.' }
                                            ]}
                                        >
                                            <Input.TextArea
                                                autoSize={{ minRows: 3, maxRows: 6 }}
                                                rows={5}
                                                placeholder="Descreva sua ideia, problema ou elogio com o máximo de detalhes possível..."
                                                count={{ show: true, max: 2000 }}
                                            />
                                        </Form.Item>

                                        <Form.Item>
                                            <ButtonPrimary 
                                                text='Enviar Feedback' 
                                                htmlType="submit" 
                                                block 
                                                loading={isSubmitting}
                                                disabled={isSubmitting}
                                            />
                                        </Form.Item>
                                    </Form>
                                </Card>
                            </Col>

                            {/* Coluna de Informações */}
                            <Col xs={24} lg={12}>
                                <Space direction="vertical" size="large" className="!w-full">
                                    <Card
                                        variant='borderless'
                                        title={<div><Title level={3} className="!m-0">Por que seu feedback é importante?</Title></div>}
                                    >
                                        <Paragraph type="secondary">
                                            Cada sugestão é lida e analisada pela nossa equipe. Feedbacks como o seu nos ajudam a priorizar novas funcionalidades, corrigir problemas que não vimos e, o mais importante, construir uma plataforma que atenda às suas necessidades.
                                        </Paragraph>
                                        <Title level={5} className="!mt-6">Prefere falar diretamente?</Title>
                                        <Paragraph type="secondary">
                                            Para assuntos urgentes ou se preferir um contato mais direto, você pode nos encontrar em nossos canais.
                                        </Paragraph>
                                        <div className="mt-4 pt-4 border-t">
                                            <Title level={5}>Nossos canais</Title>
                                            <Space size="large" className="mt-2">
                                                <Link href="https://www.instagram.com/eng.strategy" className="text-gray-500 hover:text-green-500 transition-colors"><FaInstagram size={24} /></Link>
                                                <Link href="mailto:arenahub.2025@gmail.com" className="text-gray-500 hover:text-green-500 transition-colors"><MdOutlineEmail size={24} /></Link>
                                                <Link href="https://wa.me/5589994673969" className="text-gray-500 hover:text-green-500 transition-colors"><FaWhatsapp size={24} /></Link>
                                            </Space>
                                        </div>
                                    </Card>
                                </Space>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Content>
        </Layout>
    );
}
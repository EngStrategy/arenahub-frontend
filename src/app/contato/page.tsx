"use client"

import React, { useState, useEffect } from 'react';
import { Layout, Typography, Form, Input, Card, Row, Col, Space, App } from 'antd';
import { useTheme } from '@/context/ThemeProvider';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const ContatoPageSkeleton = () => {
    return (
        <div className="animate-pulse bg-gray-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                <div className="text-center mb-16">
                    <div className="h-10 md:h-12 bg-gray-300 dark:bg-neutral-700 rounded-lg w-1/3 max-w-sm mx-auto"></div>
                    <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded-md w-1/2 max-w-lg mx-auto mt-4"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg space-y-8">
                        <div className="h-8 bg-gray-300 dark:bg-neutral-700 rounded-md w-1/2"></div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-1/4"></div>
                                <div className="h-10 bg-gray-300 dark:bg-neutral-700 rounded-md w-full"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-1/4"></div>
                                <div className="h-10 bg-gray-300 dark:bg-neutral-700 rounded-md w-full"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-1/4"></div>
                                <div className="h-24 bg-gray-300 dark:bg-neutral-700 rounded-md w-full"></div>
                            </div>
                            <div className="h-12 bg-green-300 dark:bg-green-800 rounded-md w-full"></div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg space-y-6">
                            <div className="h-8 bg-gray-300 dark:bg-neutral-700 rounded-md w-2/3"></div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3"><div className="h-6 w-6 bg-gray-300 dark:bg-neutral-700 rounded"></div> <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-5/6"></div></div>
                                <div className="flex items-center gap-3"><div className="h-6 w-6 bg-gray-300 dark:bg-neutral-700 rounded"></div> <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-1/3"></div></div>
                                <div className="flex items-center gap-3"><div className="h-6 w-6 bg-gray-300 dark:bg-neutral-700 rounded"></div> <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-1/2"></div></div>
                            </div>
                            <div className="pt-6 border-t border-gray-200 dark:border-neutral-700 space-y-4">
                                <div className="h-6 bg-gray-300 dark:bg-neutral-700 rounded-md w-1/3"></div>
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-gray-300 dark:bg-neutral-700 rounded-full"></div>
                                    <div className="h-8 w-8 bg-gray-300 dark:bg-neutral-700 rounded-full"></div>
                                    <div className="h-8 w-8 bg-gray-300 dark:bg-neutral-700 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="h-80 w-full bg-gray-300 dark:bg-neutral-800 rounded-lg shadow-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function ContatoPage() {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const { message } = App.useApp();
    const [form] = Form.useForm();

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const onFinish = (values: any) => {
        console.log('Valores do formulário:', values);
        message.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        form.resetFields();
    };

    if (loading) {
        return <ContatoPageSkeleton />;
    }

    return (
        <Layout className={isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}>
            <Content>
                <div className="py-16">
                    <div className="text-center mb-16 px-4">
                        <Title level={1}>Entre em Contato</Title>
                        <Paragraph className="!text-lg max-w-2xl mx-auto">
                            Dúvidas, sugestões ou propostas de parceria? Preencha o formulário ou utilize um de nossos canais de atendimento.
                        </Paragraph>
                    </div>

                    <Row gutter={[48, 48]} className="!px-4 sm:!px-10 lg:!px-20" align="top">
                        {/* Coluna do Formulário */}
                        <Col xs={24} lg={12}>
                            <Card variant='borderless' title={<Title level={3} className="!m-0 !border-0">Envie sua mensagem</Title>}>
                                <Form form={form} layout="vertical" onFinish={onFinish} size="large">
                                    <Form.Item name="name" label="Nome Completo" rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}>
                                        <Input placeholder="Seu nome completo" />
                                    </Form.Item>
                                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Por favor, insira um email válido!' }]}>
                                        <Input placeholder="seu.email@exemplo.com" />
                                    </Form.Item>
                                    <Form.Item name="subject" label="Assunto" rules={[{ required: true, message: 'Por favor, insira o assunto!' }]}>
                                        <Input placeholder="Sobre o que você gostaria de falar?" />
                                    </Form.Item>
                                    <Form.Item name="message" label="Mensagem" rules={[{ required: true, message: 'Por favor, escreva sua mensagem!' }]}>
                                        <Input.TextArea rows={4} placeholder="Escreva os detalhes aqui..." />
                                    </Form.Item>
                                    <Form.Item>
                                        <ButtonPrimary text='Enviar Mensagem' htmlType="submit" block />
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>

                        {/* Coluna de Informações e Mapa */}
                        <Col xs={24} lg={12}>
                            <Space direction="vertical" size="large" className="!w-full">
                                <Card variant='borderless' title={<Title level={3} className="!m-0">Informações e Canais</Title>}>
                                    <Space direction="vertical" size="middle" className="!w-full">
                                        <div className="flex items-start"><FaMapMarkerAlt className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" /><Text>Av. Plácido Castelo, 1234 - Centro, Quixadá - CE, 63900-000</Text></div>
                                        <div className="flex items-center"><FaPhoneAlt className="h-5 w-5 text-green-500 mr-4 flex-shrink-0" /><Text>(89) 99467-3969</Text></div>
                                        <div className="flex items-center"><FaEnvelope className="h-5 w-5 text-green-500 mr-4 flex-shrink-0" /><Text>engstrategy25@gmail.com</Text></div>
                                        <div className="flex items-center"><FaClock className="h-5 w-5 text-green-500 mr-4 flex-shrink-0" /><Text>Segunda a Sexta: 08:00 - 22:00</Text></div>
                                    </Space>
                                    <div className="mt-8 pt-6 border-t">
                                        <Title level={5}>Siga-nos nas redes</Title>
                                        <Space size="large" className="mt-2">
                                            <Link href="https://www.instagram.com/eng.strategy" className="text-gray-500 hover:text-green-500 transition-colors"><FaInstagram size={24} /></Link>
                                            <Link href="https://www.facebook.com/eng.strategy" className="text-gray-500 hover:text-green-500 transition-colors"><FaFacebook size={24} /></Link>
                                            <Link href="https://wa.me/5589994673969" className="text-gray-500 hover:text-green-500 transition-colors"><FaWhatsapp size={24} /></Link>
                                        </Space>
                                    </div>
                                </Card>
                                <Card variant='borderless'>
                                     <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15886.51654157173!2d-39.02641761284181!3d-4.969894799999991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7be57416d862287%3A0x7d2de55e4e8910b!2sQuixad%C3%A1%2C%20CE!5e0!3m2!1spt-BR!2sbr!4v1721344468641!5m2!1spt-BR!2sbr"
                                        width="100%"
                                        height="300"
                                        style={{ border: 0 }}
                                        allowFullScreen={true}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Localização da Arena em Quixadá"
                                    ></iframe>
                                </Card>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    );
}
"use client";

import React, { useEffect, useState } from 'react';
import { Layout, Typography, Row, Col, Card, Avatar, Button, Space, Image } from 'antd';
import { useTheme } from '@/context/ThemeProvider';
import { FaUsers, FaHeartbeat, FaLightbulb, FaShieldAlt } from 'react-icons/fa';
import { FaLinkedin, FaGithub } from 'react-icons/fa6';
import Link from 'next/link';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const QuemSomosPulseSkeleton = () => (
    <div className="animate-pulse">
        <div className="relative h-[50vh] w-full bg-gray-300">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-2xl mx-auto text-center space-y-4 px-4">
                    <div className="h-10 md:h-14 bg-gray-400 rounded-lg w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-400 rounded-md w-full mx-auto"></div>
                    <div className="h-4 bg-gray-400 rounded-md w-5/6 mx-auto"></div>
                </div>
            </div>
        </div>

        <div className="px-4 sm:px-10 lg:px-40 py-16">
            <div className="flex flex-col md:flex-row gap-12 mb-20">
                <div className="w-full md:w-1/2 space-y-4">
                    <div className="h-8 bg-gray-300 rounded-md w-1/3"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-300 rounded-md"></div>
                        <div className="h-4 bg-gray-300 rounded-md"></div>
                        <div className="h-4 bg-gray-300 rounded-md w-5/6"></div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                    <div className="h-8 bg-gray-300 rounded-md w-1/3"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-300 rounded-md"></div>
                        <div className="h-4 bg-gray-300 rounded-md"></div>
                        <div className="h-4 bg-gray-300 rounded-md"></div>
                        <div className="h-4 bg-gray-300 rounded-md w-5/6"></div>
                    </div>
                </div>
            </div>

            <div className="text-center mb-20">
                <div className="h-9 w-1/3 bg-gray-300 rounded-md mx-auto mb-12"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="space-y-4">
                            <div className="h-12 w-12 bg-gray-300 rounded-md mx-auto"></div>
                            <div className="h-6 w-3/4 bg-gray-300 rounded-md mx-auto"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-300 rounded-md mx-auto"></div>
                                <div className="h-4 w-5/6 bg-gray-300 rounded-md mx-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mb-20">
                <div className="h-9 w-1/3 bg-gray-300 rounded-md mx-auto mb-12"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="space-y-4">
                            <div className="h-32 w-32 bg-gray-300 rounded-full mx-auto"></div>
                            <div className="space-y-2">
                                <div className="h-6 w-1/2 bg-gray-300 rounded-md mx-auto"></div>
                                <div className="h-5 w-1/3 bg-gray-300 rounded-md mx-auto"></div>
                            </div>
                            <div className="space-y-2 px-4">
                                <div className="h-4 w-full bg-gray-300 rounded-md mx-auto"></div>
                                <div className="h-4 w-5/6 bg-gray-300 rounded-md mx-auto"></div>
                            </div>
                            <div className="flex justify-center items-center gap-4 pt-2">
                                <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                                <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-gray-200">
            <div className="px-4 sm:px-10 lg:px-40 py-16 text-center">
                <div className="h-9 w-1/2 bg-gray-300 rounded-md mx-auto"></div>
                <div className="max-w-3xl mx-auto my-8 space-y-3">
                    <div className="h-4 bg-gray-300 rounded-md w-full"></div>
                    <div className="h-4 bg-gray-300 rounded-md w-5/6 mx-auto"></div>
                </div>
                <div className="flex justify-center items-center gap-4">
                    <div className="h-12 w-40 bg-gray-300 rounded-lg"></div>
                    <div className="h-12 w-40 bg-gray-300 rounded-lg"></div>
                </div>
            </div>
        </div>
    </div>
);

const teamMembers = [
    {
        name: 'Sávio Cavalho',
        role: 'CEO & Fundador',
        bio: 'Apaixonado por futebol desde criança, transformou a frustração de não encontrar quadras em uma solução para milhares de atletas.',
        avatar: 'https://i.imgur.com/BkSSSx4.jpeg',
        socials: {
            linkedin: 'https://www.linkedin.com/in/saviosoaresc/',
            github: 'https://github.com/saviosoaresUFC',
        }
    },
    {
        name: 'Rian Lima',
        role: 'CTO & Co-fundador',
        bio: 'O arquiteto da nossa tecnologia. Garante que a plataforma seja rápida, segura e fácil de usar para todos.',
        avatar: 'https://i.imgur.com/57QCyQb.jpeg',
        socials: {
            linkedin: '#',
            github: 'https://github.com/rlimapro',
        }
    },
    {
        name: 'Renan Alencar',
        role: 'Gerente de Comunidade',
        bio: 'A ponte entre nossa plataforma, os atletas e as arenas. Organiza eventos e garante a melhor experiência para a comunidade.',
        avatar: 'https://i.imgur.com/VXa1tQe.jpeg',
        socials: {
            linkedin: 'https://www.linkedin.com/in/renansoaresdev/',
            github: 'https://github.com/renansuaris',
        }
    },
];

export default function QuemSomosPage() {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <QuemSomosPulseSkeleton />;
    }

    return (
        <Layout className={`${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            <Content>
                <div className="relative h-[50vh] w-full">
                    <Image
                        src="https://i.imgur.com/klvDU0t.png"
                        alt="Time de atletas comemorando"
                        preview={false}
                        width="100%"
                        height="100%"
                        style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center">
                            <Title level={1} className="!text-white !text-4xl md:!text-6xl !font-extrabold drop-shadow-lg">
                                Conectando Apaixonados pelo Esporte
                            </Title>
                            <Paragraph className="!text-gray-200 text-lg md:text-xl max-w-2xl mx-auto">
                                Mais que uma plataforma de agendamento, somos uma comunidade que vive e respira esporte.
                            </Paragraph>
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-10 lg:px-40 py-16">
                    <Row gutter={[48, 48]} align="middle" className="mb-20">
                        <Col xs={24} md={12}>
                            <Title level={2}>Nossa Missão</Title>
                            <Paragraph className="text-lg">
                                Nossa missão é simples: <Text strong>facilitar o acesso ao esporte para todos.</Text> Queremos que encontrar e reservar um espaço para praticar sua atividade física preferida seja tão fácil quanto chamar um amigo para jogar. Quebramos as barreiras para que você se preocupe apenas com uma coisa: a diversão.
                            </Paragraph>
                        </Col>
                        <Col xs={24} md={12}>
                            <Title level={2}>Nossa História</Title>
                            <Paragraph className="text-lg">
                                Tudo começou em Quixadá, com um grupo de amigos e uma dificuldade recorrente: encontrar uma quadra livre nos fins de semana. Entre ligações, mensagens e desencontros, nasceu a ideia de criar uma plataforma que centralizasse tudo. De um simples projeto para resolver um problema local, crescemos para nos tornar a maior ponte entre atletas e arenas da região.
                            </Paragraph>
                        </Col>
                    </Row>

                    <div className="text-center mb-20">
                        <Title level={2} className="!mb-12">Nossos Valores</Title>
                        <Row gutter={[24, 24]} justify="center">
                            <Col xs={24} sm={12} lg={6}>
                                <Card variant='borderless' className="h-full text-center">
                                    <FaHeartbeat className="text-5xl text-green-500 mx-auto mb-4" />
                                    <Title level={4}>Paixão pelo Esporte</Title>
                                    <Paragraph>O esporte está em nosso DNA. É o que nos move e nos inspira a inovar todos os dias.</Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card variant='borderless' className="h-full text-center">
                                    <FaUsers className="text-5xl text-green-500 mx-auto mb-4" />
                                    <Title level={4}>Comunidade</Title>
                                    <Paragraph>Construímos mais do que conexões; criamos laços entre pessoas que compartilham a mesma paixão.</Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card variant='borderless' className="h-full text-center">
                                    <FaLightbulb className="text-5xl text-green-500 mx-auto mb-4" />
                                    <Title level={4}>Inovação Constante</Title>
                                    <Paragraph>Usamos a tecnologia para simplificar, agilizar e melhorar a experiência de atletas e gestores de arenas.</Paragraph>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card variant='borderless' className="h-full text-center">
                                    <FaShieldAlt className="text-5xl text-green-500 mx-auto mb-4" />
                                    <Title level={4}>Confiança e Segurança</Title>
                                    <Paragraph>Garantimos um ambiente seguro e transparente para agendamentos, pagamentos e interações.</Paragraph>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    <div className="text-center mb-20">
                        <Title level={2} className="!mb-12">Conheça Nosso Time</Title>
                        <Row gutter={[24, 32]} justify="center">
                            {teamMembers.map((member, index) => (
                                <Col key={index} xs={24} sm={12} md={8}>
                                    <Card className="bg-transparent" variant='borderless'>
                                        <div className="text-center">
                                            <Avatar size={128} src={member.avatar} />
                                            <Title level={4} className="!mt-4 !mb-1">{member.name}</Title>
                                            <Text type="secondary" className="!text-green-500 font-semibold">{member.role}</Text>
                                            <Paragraph className="mt-3 min-h-[60px]">{member.bio}</Paragraph>
                                            <Space size="large" className="mt-2">
                                                <a
                                                    href={member.socials.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-green-500"
                                                    title={`LinkedIn de ${member.name}`}
                                                >
                                                    <FaLinkedin size={24} />
                                                </a>
                                                <a
                                                    href={member.socials.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-green-500"
                                                    title={`GitHub de ${member.name}`}
                                                >
                                                    <FaGithub size={24} />
                                                </a>
                                            </Space>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                </div>

                <div className={isDarkMode ? 'bg-neutral-800' : 'bg-gray-100'}>
                    <div className="px-4 sm:px-10 lg:px-40 py-16 pb-20 text-center">
                        <Title level={2}>Pronto para entrar em quadra?</Title>
                        <Paragraph className="text-lg max-w-3xl mx-auto mb-8">
                            Seja você um atleta procurando o lugar perfeito para jogar ou uma arena querendo otimizar seus agendamentos, nós temos a solução.
                        </Paragraph>
                        <Space direction="horizontal" size="large" wrap className="justify-center">
                            <Link href="/arenas" passHref>
                                <Button type="primary" size="large" className="!bg-green-primary hover:!bg-green-500">
                                    Encontre sua Quadra
                                </Button>
                            </Link>
                            <Link href="/registro" passHref>
                                <Button size="large">
                                    Cadastre sua Arena
                                </Button>
                            </Link>
                        </Space>
                    </div>
                </div>

            </Content>
        </Layout>
    );
}
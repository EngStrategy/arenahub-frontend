"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { Button, Avatar, Card, Col, Row, Flex, Typography, Layout } from 'antd';
import {
  PlusOutlined,
  DollarCircleOutlined,
  UserOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { GiSoccerField } from 'react-icons/gi';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { useTheme } from '@/context/ThemeProvider';

const { Title, Text } = Typography;

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, changeType }) => {
  let iconColor = '#f2e8ff';
  if (React.isValidElement(icon)) {
    const props = icon.props as { className?: string };
    if (props.className?.includes('green')) {
      iconColor = '#e6f4ea';
    } else if (props.className?.includes('blue')) {
      iconColor = '#e6f7ff';
    }
  }

  return (
    <Card>
      <Flex align="center" gap="large">
        <Avatar size={50} icon={icon} style={{ backgroundColor: iconColor }} />
        <Flex vertical>
          <Text type="secondary">{title}</Text>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>{value}</Title>
          {change && (
            <Text style={{ fontSize: '12px', color: changeType === 'increase' ? '#38a169' : '#e53e3e' }}>
              {change}
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};


const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 animate-pulse">
    <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
    <div className="flex-1 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 rounded w-64"></div>
          <div className="h-5 bg-gray-300 rounded w-48"></div>
        </div>
        <div className="h-12 bg-gray-300 rounded-lg w-36 mt-4 sm:mt-0"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  </main>
);


export default function Dashboard() {
  const { data: session, status } = useSession();
  const { isDarkMode } = useTheme();

  const kpiData = [
    { icon: <DollarCircleOutlined className="!text-green-600 text-2xl" />, title: "Receita do Mês", value: "R$ 7.850,00", change: "+12% vs. mês passado", changeType: 'increase' as const },
    { icon: <ScheduleOutlined className="!text-blue-600 text-2xl" />, title: "Agendamentos Hoje", value: "12", change: "2 horários livres", changeType: 'decrease' as const },
    { icon: <UserOutlined className="!text-purple-600 text-2xl" />, title: "Novos Clientes", value: "23", change: "+5 nesta semana", changeType: 'increase' as const },
  ];
  const upcomingBookings = [
    { time: "18:00 - 19:00", court: "Quadra 1", client: "Sávio Soares", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1", phoneNumber: "85992490695" },
    { time: "21:00 - 22:00", court: "Quadra 2", client: "Cristiano Ronaldo", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=3", phoneNumber: "89994706972" },
  ];
  const quickAccessLinks = [
    { label: "Gerenciar Quadras", icon: <GiSoccerField />, path: "/perfil/arena/quadras" },
    { label: "Agendamentos", icon: <ScheduleOutlined />, path: "/perfil/arena/agendamentos" },
    { label: "Relatórios Financeiros", icon: <BarChartOutlined />, path: "/perfil/arena/relatorios" },
    { label: "Gestão de Clientes", icon: <TeamOutlined />, path: "/perfil/arena/clientes" },
  ];

  if (status === 'loading') {
    return <DashboardSkeleton />;
  }

  return (
    <Layout.Content style={{ padding: '2rem 8%', backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)', }} >
      <Flex vertical gap="large">
        {/* Cabeçalho */}
        <Flex justify="space-between" align="center">
          <Flex vertical>
            <Title level={2}>
              Olá, {session?.user?.name ? session.user.name.split(' ').slice(0, 3).join(' ') : "Arena"}!
            </Title>
            <Text type="secondary">Aqui está um resumo do seu dia.</Text>
          </Flex>
          <Link href="/perfil/arena/quadras/nova">
            <ButtonPrimary text="Nova Quadra" icon={<PlusOutlined />} size="large" />
          </Link>
        </Flex>

        {/* KPI Cards */}
        <Row gutter={[16, 16]}>
          {kpiData.map((item) => (
            <Col key={item.title} xs={24} md={12} lg={8}>
              <StatCard {...item} />
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title={<Title level={4}>Próximos Agendamentos</Title>}>
              <Flex vertical gap="middle">
                {upcomingBookings.map((booking, index) => (
                  <Card key={index} type="inner">
                    <Flex justify="space-between" align="center">
                      <Flex align="center" gap="middle">
                        <Avatar src={booking.avatar} icon={<UserOutlined />} />
                        <Flex vertical>
                          <Text strong>{booking.client}</Text>
                          <Text type="secondary">{booking.court}</Text>
                        </Flex>
                      </Flex>
                      <Flex align="flex-end" vertical>
                        <Text style={{ color: '#15a01a' }}>{booking.time}</Text>
                        <Button
                          type="link"
                          icon={<FaWhatsapp />}
                          href={`https://wa.me/55${booking.phoneNumber}?text=Olá, ${booking.client}! Lembrete do seu agendamento hoje, ${booking.time}.`}
                          style={{ paddingRight: 0 }}
                        >
                          Lembrar
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title={<Title level={4}>Acesso Rápido</Title>}>
              <Flex vertical gap="small">
                {quickAccessLinks.map((link) => (
                  <Link key={link.label} href={link.path}>
                    <Button icon={link.icon} size="large" block style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: 'auto', padding: '10px 15px' }}>
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </Flex>
            </Card>
          </Col>
        </Row>
      </Flex>
    </Layout.Content>
  );
}
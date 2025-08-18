"use client";

import React, { useEffect, useState } from 'react';
import { Button, Avatar, Card, Col, Row, Flex, Typography, Layout, Tag, Alert } from 'antd';
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
import { getDashboardData, DashboardData } from '../api/entities/arena';
import { useAuth } from '@/context/hooks/use-auth';
import { type AgendamentoArena, getAgendamentosPendentesResolucao } from '../api/entities/agendamento';
import { useRouter } from 'next/navigation';

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
  const { user, isLoadingSession, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendentesResolucao, setPendentesResolucao] = useState<AgendamentoArena[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getDashboardData();
          setDashboardData(data);
        } catch (err) {
          console.error("Erro ao buscar dados do dashboard:", err);
          setError("Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.");
        } finally {
          setLoading(false);
        }
      };

      const fetchPendentesResolucao = async () => {
        try {
          const data = await getAgendamentosPendentesResolucao();
          setPendentesResolucao(data);
        } catch (err) {
          console.error("Erro ao buscar agendamentos pendentes para resolução:", err);
        }
      };

      Promise.all([
        fetchDashboardData(),
        fetchPendentesResolucao()
      ]);
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading || isLoadingSession) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Layout.Content style={{ padding: '2rem 8%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Alert message="Erro" description={error} type="error" showIcon />
      </Layout.Content>
    );
  }

  if (!dashboardData) {
    return (
      <Layout.Content style={{ padding: '2rem 8%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Nenhum dado disponível para o dashboard.</Text>
      </Layout.Content>
    )
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const kpiData: StatCardProps[] = [
    {
      icon: <DollarCircleOutlined className="!text-green-600 text-2xl" />,
      title: "Receita do Mês (Pagos)",
      value: formatCurrency(dashboardData.receitaDoMes),
      change: `${dashboardData.percentualReceitaVsMesAnterior.toFixed(1).replace('.', ',')}% vs. mês passado`,
      changeType: dashboardData.percentualReceitaVsMesAnterior >= 0 ? 'increase' : 'decrease'
    },
    {
      icon: <BarChartOutlined className="!text-blue-600 text-2xl" />,
      title: "Taxa de Ocupação Hoje",
      value: `${dashboardData.taxaOcupacaoHoje.toFixed(0)}%`,
      change: `${dashboardData.agendamentosHoje} agendamentos confirmados`,
      changeType: 'increase'
    },
    {
      icon: <UserOutlined className="!text-purple-600 text-2xl" />,
      title: "Novos Clientes na Semana",
      value: dashboardData.novosClientes.toString(),
      change: `${dashboardData.diferencaNovosClientesVsSemanaAnterior >= 0 ? '+' : ''}${dashboardData.diferencaNovosClientesVsSemanaAnterior} vs. semana passada`,
      changeType: dashboardData.diferencaNovosClientesVsSemanaAnterior >= 0 ? 'increase' : 'decrease'
    },
  ];

  const upcomingBookings = dashboardData.proximosAgendamentos.map(booking => ({
    time: `${booking.horarioInicio.slice(0, 5)} - ${booking.horarioFim.slice(0, 5)}`,
    court: booking.quadraNome,
    client: booking.clienteNome,
    avatar: booking.urlFoto || `https://api.dicebear.com/7.x/miniavs/svg?seed=${booking.agendamentoId}`,
    phoneNumber: booking.clienteTelefone.replace(/\D/g, ''),
  }));

  const quickAccessLinks = [
    { label: "Gerenciar Quadras", icon: <GiSoccerField />, path: "/perfil/arena/quadras" },
    { label: "Agendamentos", icon: <ScheduleOutlined />, path: "/perfil/arena/agendamentos" },
    { label: "Relatórios Financeiros", icon: <BarChartOutlined />, path: "#", inProgress: true },
    { label: "Gestão de Clientes", icon: <TeamOutlined />, path: "#", inProgress: true },
  ];

  return (
    <Layout.Content style={{ padding: '2rem 8% 5rem 8%', backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)', }} >
      <Flex vertical gap="large">

        {pendentesResolucao.length > 0 && (
          <Alert
            message={`${pendentesResolucao.length} Agendamento(s) Pendente(s)`}
            description="Existem agendamentos que já ocorreram e precisam que você defina o status (Pago, Ausente, etc.) para manter seus relatórios atualizados."
            type="warning"
            showIcon
            action={
              <Button
                type="primary"
                onClick={() => router.push('/perfil/arena/agendamentos')}
              >
                Resolver Agora
              </Button>
            }
            closable
            onClose={() => setPendentesResolucao([])}
          />
        )}

        {/* Cabeçalho */}
        <Flex justify="space-between" align="center">
          <Flex vertical>
            <Title level={2}>
              Olá, {user?.name ? user.name.split(' ').slice(0, 3).join(' ') : "Arena"}!
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
                          target="_blank"
                          rel="noopener noreferrer"
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
                    <Button
                      icon={link.icon}
                      size="large"
                      block
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: 'auto', padding: '10px 15px' }}
                      disabled={link.inProgress}
                    >
                      {link.label}
                      {link.inProgress && <Tag color="blue" style={{ marginLeft: 'auto' }}>Em progresso</Tag>}
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
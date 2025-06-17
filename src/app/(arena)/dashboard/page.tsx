"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { Button, Avatar } from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  DollarCircleOutlined,
  UserOutlined,
  ScheduleOutlined,
  SettingOutlined,
  BarChartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { FaWhatsapp } from 'react-icons/fa';
import { ButtonPrimary } from '@/components/ButtonPrimary';
import Link from 'next/link';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, changeType }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
    <div className="bg-green-light p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {change && (
        <p className={`text-xs ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </p>
      )}
    </div>
  </div>
);


export default function Dashboard() {
  const { data: session } = useSession();

  const kpiData = [
    {
      icon: <DollarCircleOutlined className="!text-green-600 text-2xl" />,
      title: "Receita do Mês",
      value: "R$ 7.850,00",
      change: "+12% vs. mês passado",
      changeType: 'increase' as const,
    },
    {
      icon: <ScheduleOutlined className="!text-blue-600 text-2xl" />,
      title: "Agendamentos Hoje",
      value: "12",
      change: "2 horários livres",
      changeType: 'decrease' as const,
    },
    {
      icon: <UserOutlined className="!text-purple-600 text-2xl" />,
      title: "Novos Clientes",
      value: "23",
      change: "+5 nesta semana",
      changeType: 'increase' as const,
    },
  ];

  const upcomingBookings = [
    { time: "18:00 - 19:00", court: "Quadra 1", client: "Sávio Soares", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1", phoneNumber: "85992490695" },
    { time: "21:00 - 22:00", court: "Quadra 2", client: "Cristiano Ronaldo", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=3", phoneNumber: "89994706972" },
    { time: "19:00 - 20:00", court: "Quadra 3", client: "Ronaldinho Gaúcho", avatar: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png", phoneNumber: "86995055006" },
    { time: "20:00 - 21:00", court: "Quadra 4", client: "Neymar Júnior", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2", phoneNumber: "85991943490" },
  ];

  const quickAccessLinks = [
    { label: "Gerenciar Quadras", icon: <SettingOutlined />, path: "/dashboard/quadras" },
    { label: "Calendário Completo", icon: <CalendarOutlined />, path: "/dashboard/calendario" },
    { label: "Relatórios Financeiros", icon: <BarChartOutlined />, path: "/dashboard/relatorios" },
    { label: "Gestão de Clientes", icon: <TeamOutlined />, path: "/dashboard/clientes" },
  ];


  return (
    <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Olá, {session?.user?.name
                ? session.user.name.split(' ').slice(0, 3).join(' ')
                : "Arena"}!
            </h1>
            <p className="text-gray-500 mt-1">Aqui está um resumo do seu dia.</p>
          </div>
          <ButtonPrimary
            text="Novo Agendamento"
            type="primary"
            icon={<PlusOutlined />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {kpiData.map(item => <StatCard key={item.title} {...item} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximos Agendamentos</h2>
            <div className="space-y-4">
              {upcomingBookings.map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center gap-4">
                    <Avatar src={booking.avatar} icon={<UserOutlined />} />
                    <div>
                      <p className="font-semibold text-gray-700">{booking.client}</p>
                      <p className="text-sm text-gray-500">{booking.court}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm font-semibold text-green-600">{booking.time}</p>
                    <Button
                      type="dashed"
                      className="!bg-transparent !text-xs !text-gray-500 hover:!text-green-500 !transition-colors !flex !items-center !justify-end !gap-1"
                      href={`https://wa.me/55${booking.phoneNumber}?text=Olá, ${booking.client}! Lembrete do seu agendamento hoje, ${booking.time}.`}
                    >
                      Lembrar <FaWhatsapp color='green' />
                    </Button>
                    {/* <a href={`https://wa.me/55${booking.phoneNumber}?text=Olá, ${booking.client}! Lembrete do seu agendamento hoje, ${booking.time}.`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-green-500 transition-colors flex items-center justify-end gap-1">
                      Lembrar <FaWhatsapp color='green'/>
                    </a> */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Acesso Rápido</h2>
            <div className="flex flex-col space-y-3">
              {quickAccessLinks.map(link => (
                <Link key={link.label} href={link.path}>
                  <Button icon={link.icon} size="large" className="!flex !items-center !w-full !justify-start !text-left !h-auto !py-3">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
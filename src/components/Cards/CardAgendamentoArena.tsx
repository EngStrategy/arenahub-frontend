"use client";

import { Avatar, Card, Dropdown, MenuProps, Space, Tag, Typography, Button } from "antd";
import { UserOutlined, MoreOutlined, CalendarOutlined, ClockCircleOutlined, DollarCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useMemo } from "react";
import { type StatusAgendamentoArena } from "@/app/api/entities/agendamento";

const { Text, Title } = Typography;

export interface AgendamentoArenaCardData {
    id: number;
    dataAgendamento: string;
    horarioInicio: string;
    horarioFim: string;
    valorTotal: number;
    status: StatusAgendamentoArena;
    nomeQuadra: string;
    nomeAtleta: string;
    urlFotoAtleta?: string;
}

interface CardAgendamentoArenaProps {
    agendamento: AgendamentoArenaCardData;
    onStatusChange: (agendamentoId: number, newStatus: 'PAGO' | 'AUSENTE' | 'CANCELADO') => Promise<void>;
}

export const CardAgendamentoArena = ({ agendamento, onStatusChange }: CardAgendamentoArenaProps) => {

    const statusConfig = useMemo(() => ({
        PAGO: { color: 'success', icon: <CheckCircleOutlined />, text: 'Pago' },
        PENDENTE: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pendente' },
        AUSENTE: { color: 'warning', icon: <StopOutlined />, text: 'Ausente' },
        CANCELADO: { color: 'error', icon: <CloseCircleOutlined />, text: 'Cancelado' },
        FINALIZADO: { color: 'default', icon: <CheckCircleOutlined />, text: 'Finalizado' },
    }), []);

    const currentStatus = statusConfig[agendamento.status] || statusConfig.PENDENTE;

    const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
        try {
            await onStatusChange(agendamento.id, key as 'PAGO' | 'AUSENTE' | 'CANCELADO');
        } catch (error) {
            console.error("Erro ao alterar o status do agendamento:", error);
        }
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'PAGO',
            label: 'Marcar como Pago',
            disabled: agendamento.status === 'PAGO' || agendamento.status === 'CANCELADO',
        },
        {
            key: 'AUSENTE',
            label: 'Marcar como Ausente',
            disabled: agendamento.status !== 'PENDENTE',
        },
        {
            type: 'divider',
        },
        {
            key: 'CANCELADO',
            label: 'Cancelar Agendamento',
            danger: true,
            disabled: agendamento.status === 'PAGO' || agendamento.status === 'CANCELADO',
        },
    ];

    return (
        <Card
            hoverable
            className="w-full h-full flex flex-col"
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' } }}
        >
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <Space>
                        <Avatar size={48} src={agendamento.urlFotoAtleta} icon={<UserOutlined />} />
                        <div>
                            <Title level={5} className="!mb-0">{agendamento.nomeAtleta}</Title>
                            <Text type="secondary">{agendamento.nomeQuadra}</Text>
                        </div>
                    </Space>
                    <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
                        <Button type="text" shape="circle" icon={<MoreOutlined />} />
                    </Dropdown>
                </div>

                <Space direction="vertical" size="small" className="w-full">
                    <Text>
                        <CalendarOutlined className="mr-2" />
                        {new Date(agendamento.dataAgendamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </Text>
                    <Text>
                        <ClockCircleOutlined className="mr-2" />
                        {agendamento.horarioInicio} às {agendamento.horarioFim}
                    </Text>
                    <Text strong className={`${agendamento.status === "CANCELADO" || agendamento.status === "AUSENTE" ?
                        "line-through !text-red-500" :
                        "!text-green-600"} `
                    }>
                        <DollarCircleOutlined className="mr-2" />
                        {agendamento.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Text>
                </Space>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
                <Tag icon={currentStatus.icon} color={currentStatus.color} className="!text-sm !py-1 !px-2">
                    {currentStatus.text}
                </Tag>
            </div>
        </Card>
    );
};
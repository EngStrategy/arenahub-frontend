"use client";

import { Avatar, Card, Dropdown, MenuProps, Space, Tag, Typography, Button } from "antd";
import {
    UserOutlined, MoreOutlined, CalendarOutlined, ClockCircleOutlined,
    DollarCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, StopOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useMemo } from "react";
import { AgendamentoArenaCardData } from "@/app/api/entities/agendamento";
import { convertArrayOrStringDateToDatePortuguese } from "@/context/functions/convertDate";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const { Text, Title } = Typography;


interface CardAgendamentoArenaProps {
    agendamento: AgendamentoArenaCardData;
    onStatusChange: (agendamentoId: number, newStatus: 'PAGO' | 'AUSENTE' | 'CANCELADO') => Promise<void>;
    onGerenciarFixo?: () => void;
}

const calcularDuracaoHoras = (horarioInicio: string, horarioFim: string): number => {
    try {
        const [horaInicio, minutoInicio] = horarioInicio.split(':').map(Number);
        const [horaFim, minutoFim] = horarioFim.split(':').map(Number);

        let totalMinutosInicio = horaInicio * 60 + minutoInicio;
        let totalMinutosFim = horaFim * 60 + minutoFim;

        if (totalMinutosFim < totalMinutosInicio) {
            totalMinutosFim += 24 * 60;
        }

        const diferencaEmMinutos = totalMinutosFim - totalMinutosInicio;

        return diferencaEmMinutos / 60;
    } catch (error) {
        console.error("Erro ao calcular duração:", error);
        return 0;
    }
};

export const CardAgendamentoArena = ({ agendamento, onStatusChange, onGerenciarFixo }: CardAgendamentoArenaProps) => {

    const statusConfig = useMemo(() => ({
        PAGO: { color: 'success', icon: <CheckCircleOutlined />, text: 'Pago' },
        PENDENTE: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pendente' },
        AUSENTE: { color: 'warning', icon: <StopOutlined />, text: 'Ausente' },
        CANCELADO: { color: 'error', icon: <CloseCircleOutlined />, text: 'Cancelado' },
        FINALIZADO: { color: 'default', icon: <CheckCircleOutlined />, text: 'Finalizado' },
    }), []);

    const duracaoHoras = calcularDuracaoHoras(agendamento.horarioInicio, agendamento.horarioFim);

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
        },
        {
            key: 'AUSENTE',
            label: 'Marcar como Ausente',
        },
        {
            type: 'divider',
        },
        {
            key: 'CANCELADO',
            label: 'Cancelar Agendamento',
            danger: true,
        },
    ];

    // Função para formatar a data (dia, mês por extenso) para exibição
    const formatarDataExtenso = (dataArray: string): string => {
        if (!dataArray || (Array.isArray(dataArray) && dataArray.length < 3)) return 'Data Indisponível';

        // 1. Converte a string ISO para Date e formata (usando date-fns)
        const dateObj = convertArrayOrStringDateToDatePortuguese(dataArray)

        const formatted = format(dateObj, 'eee, dd/MM/yyyy', { locale: ptBR });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    };

    const renderTopAction = () => {
        // Prioridade 2: Dropdown de Ações (para agendamentos individuais pendentes)
        if (agendamento.status === 'PENDENTE' && agendamento.tipoAgrupamento === 'NORMAL') {
            return (
                <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
                    <Button type="text" shape="circle" icon={<MoreOutlined />} />
                </Dropdown>
            );
        }

        return null;
    };

    return (
        <Card
            hoverable
            className="w-full h-full flex flex-col"
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' } }}
            onClick={agendamento.tipoAgrupamento === "FIXO_GRUPO" ? onGerenciarFixo : undefined}
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
                    {renderTopAction()}
                </div>

                {/* DETALHES DO AGENDAMENTO */}
                <Space direction="vertical" size="small" className="w-full">
                    <Text>
                        <CalendarOutlined className="mr-2" />
                        {formatarDataExtenso(agendamento.dataAgendamento)}
                    </Text>
                    <Text>
                        <ClockCircleOutlined className="mr-2" />
                        {`${agendamento.horarioInicio} às ${agendamento.horarioFim} (${duracaoHoras}h)`}
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

            {/* RODAPÉ: STATUS */}
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                <Tag icon={currentStatus.icon} color={currentStatus.color} className="!text-sm !py-1 !px-2">
                    {currentStatus.text}
                </Tag>
                {
                    agendamento.tipoAgrupamento === 'FIXO_GRUPO' && (
                        <Button
                            type="primary"
                            icon={<InfoCircleOutlined />}
                            onClick={onGerenciarFixo}
                        >
                            Gerenciar Recorrência
                        </Button>
                    )}
            </div>
        </Card>
    );
};
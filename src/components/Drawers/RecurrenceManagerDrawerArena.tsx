"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
    Drawer, Typography, Button, List, Tag,
    Flex, Popconfirm, App, Dropdown, MenuProps,
    Spin
} from 'antd';
import {
    DeleteOutlined, ScheduleOutlined, CheckCircleOutlined,
    CloseCircleOutlined, MoreOutlined, StopOutlined
} from '@ant-design/icons';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type AgendamentoArenaCardData, StatusAgendamentoArena, cancelarRecorrenciaArena } from '@/app/api/entities/agendamento';
import { convertArrayOrStringDateToDatePortuguese } from '@/context/functions/convertDate';
import { normalizeTime } from '@/context/functions/normalizeTime';

const { Title, Text } = Typography;
const { useApp } = App;

// Interfaces (copiadas do componente pai)
interface AgendamentoArenaMestre extends AgendamentoArenaCardData {
    tipoAgrupamento: 'FIXO_GRUPO';
    agendamentoFixoId: number;
    agendamentosFixosFilhos: AgendamentoArenaCardData[];
}

interface RecurrenceManagerDrawerArenaProps {
    open: boolean;
    onClose: () => void;
    agendamentoFixo: AgendamentoArenaMestre;
    onCancelFixo: (agendamentoFixoId: number) => Promise<void>;
    onStatusChangeIndividual: (agendamentoId: number, newStatus: 'PAGO' | 'AUSENTE' | 'CANCELADO') => Promise<void>;
    agendamentosFilhos: AgendamentoArenaCardData[];
    loadingFilhos: boolean;
}

const statusConfig: Record<StatusAgendamentoArena, { color: string, icon: React.ReactNode, text: string }> = {
    PAGO: { color: 'success', icon: <CheckCircleOutlined />, text: 'Pago' },
    PENDENTE: { color: 'processing', icon: <ScheduleOutlined />, text: 'Pendente' },
    AUSENTE: { color: 'warning', icon: <StopOutlined />, text: 'Ausente' },
    CANCELADO: { color: 'error', icon: <CloseCircleOutlined />, text: 'Cancelado' },
    FINALIZADO: { color: 'default', icon: <CheckCircleOutlined />, text: 'Finalizado' },
};


export const RecurrenceManagerDrawerArena = ({
    open,
    onClose,
    agendamentoFixo,
    onCancelFixo,
    onStatusChangeIndividual,
    agendamentosFilhos,
    loadingFilhos
}: RecurrenceManagerDrawerArenaProps) => {
    const { agendamentosFixosFilhos, agendamentoFixoId, nomeAtleta, nomeQuadra, valorTotal } = agendamentoFixo;
    const { message } = useApp();
    const [loadingCancelAll, setLoadingCancelAll] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState<Record<number, boolean>>({});

    const handleCancelAll = async () => {
        setLoadingCancelAll(true);
        try {
            await cancelarRecorrenciaArena(agendamentoFixoId);

            // Exibe sucesso e fecha o Drawer
            message.success("Toda a recorrência foi cancelada com sucesso!");
            onClose();

        } catch (error) {
            const errorMsg = (error as Error)?.message ?? "Não foi possível cancelar a recorrência. Tente novamente.";
            message.error(errorMsg);

            console.error('Erro ao cancelar todos os agendamentos fixos:', error);

        } finally {
            setLoadingCancelAll(false);
        }
    };

    const handleMenuClickItem = (agendamentoId: number): MenuProps['onClick'] => async ({ key }) => {
        setLoadingStatus(prev => ({ ...prev, [agendamentoId]: true }));

        const agendamentoParaMensagem = agendamentosFilhos.find(item => item.id === agendamentoId);

        try {
            await onStatusChangeIndividual(agendamentoId, key as 'PAGO' | 'AUSENTE' | 'CANCELADO');

            if (agendamentoParaMensagem) {
                const dataISO = convertArrayOrStringDateToDatePortuguese(agendamentoParaMensagem.dataAgendamento);
                message.success(`Agendamento de ${format(dataISO, 'dd/MM')} atualizado.`);
            }

        } catch (error) {
            console.error('Erro ao atualizar status do agendamento:', error);
        } finally {
            setLoadingStatus(prev => ({ ...prev, [agendamentoId]: false }));
        }
    };

    const valorTotalAgregado = agendamentosFilhos.reduce((acc, item) => acc + item.valorTotal, 0);

    // Verifica se algum agendamento filho está marcado como PAGO
    const hasPaidBookings = useMemo(() => {
        return agendamentosFilhos.some(item =>
            item.status === 'PAGO'
        );
    }, [agendamentosFilhos]);

    const renderActions = (item: AgendamentoArenaCardData) => {
        const menuItems: MenuProps['items'] = [
            { key: 'PAGO', label: 'Marcar como Pago' },
            { key: 'AUSENTE', label: 'Marcar como Ausente' },
            { type: 'divider' },
            { key: 'CANCELADO', label: 'Cancelar Individual', danger: true },
        ];

        // Ações só são permitidas para status PENDENTE
        if (item.status !== 'PENDENTE') return null;

        return (
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClickItem(item.id) }} trigger={['click']}>
                <Button
                    type="text"
                    icon={<MoreOutlined />}
                    loading={loadingStatus[item.id]}
                    disabled={loadingStatus[item.id]}
                />
            </Dropdown>
        );
    };

    return (
        <Drawer
            title="Gerenciar Agendamento Fixo (Arena)"
            placement="right"
            onClose={onClose}
            open={open}
            width={window.innerWidth > 768 ? 500 : '100%'}
            footer={
                <Flex vertical gap="small">
                    {/* Exibe aviso se o cancelamento em lote for bloqueado */}
                    {hasPaidBookings && (
                        <Text type="warning" strong>
                            O cancelamento em lote está bloqueado: Pelo menos um agendamento já foi pago ou confirmado.
                        </Text>
                    )}

                    <Flex justify="space-between" align='center'>
                        <Text strong>Valor Total: <Text className='!text-green-600'>{valorTotalAgregado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text></Text>

                        <Popconfirm
                            title="Cancelar Recorrência"
                            description="Tem certeza que deseja cancelar TODOS os agendamentos fixos futuros desta recorrência?"
                            onConfirm={handleCancelAll}
                            okText="Sim, Cancelar Tudo"
                            cancelText="Não"
                            placement="topRight"
                            disabled={hasPaidBookings}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                loading={loadingCancelAll}
                                disabled={hasPaidBookings}
                            >
                                Cancelar Recorrência ({agendamentosFilhos.length}x)
                            </Button>
                        </Popconfirm>
                    </Flex>
                </Flex>
            }
        >
            <Title level={4}>{nomeAtleta}</Title>
            <Text type="secondary">{nomeQuadra}</Text>

            {loadingFilhos ? (
                <Flex vertical justify="center" align="center" className='h-100' gap={2}>
                    <Spin size="large" />
                </Flex>
            ) : (
                <List
                    className="mt-4"
                    itemLayout="horizontal"
                    dataSource={agendamentosFilhos}
                    renderItem={(item) => {
                        const config = statusConfig[item.status] || statusConfig.PENDENTE;

                        return (
                            <List.Item actions={[renderActions(item)]}>
                                <List.Item.Meta
                                    title={
                                        <Flex justify="space-between" align="center">
                                            <Text strong>
                                                {format(convertArrayOrStringDateToDatePortuguese(item.dataAgendamento), 'EEEE, dd/MM/yyyy', { locale: ptBR }).charAt(0).toUpperCase() + format(convertArrayOrStringDateToDatePortuguese(item.dataAgendamento), 'EEEE, dd/MM/yyyy', { locale: ptBR }).slice(1)}
                                            </Text>
                                            <Text type="secondary">
                                                {normalizeTime(item.horarioInicio)} - {normalizeTime(item.horarioFim)}
                                            </Text>
                                        </Flex>
                                    }
                                    description={
                                        <Flex justify="space-between" align="center">
                                            <Tag icon={config.icon} color={config.color}>{config.text}</Tag>
                                            <Text strong>
                                                {item.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </Text>
                                        </Flex>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            )}
        </Drawer>
    );
};
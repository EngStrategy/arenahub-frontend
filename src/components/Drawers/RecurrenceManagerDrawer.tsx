"use client";

import React, { useMemo, useState } from 'react';
import { Drawer, Typography, Button, List, Tag, Flex, Popconfirm, App, Spin } from 'antd';
import { DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type AgendamentoCardData } from '@/components/Cards/AgendamentoCard';

const { Title, Text } = Typography;
const { useApp } = App;

interface AgendamentoFixoMestre extends AgendamentoCardData {
    tipoAgrupamento: 'FIXO_GRUPO';
    agendamentoFixoId: number;
    agendamentosFixosFilhos: AgendamentoCardData[];
}

interface RecurrenceManagerDrawerProps {
    open: boolean;
    onClose: () => void;
    agendamentoFixo: AgendamentoFixoMestre;
    onCancelFixo: (agendamentoFixoId: number) => Promise<void>;
    onCancelIndividual: (agendamentoId: number) => Promise<void>;
    agendamentosFilhos: AgendamentoCardData[];
    loadingFilhos: boolean;
}

export const RecurrenceManagerDrawer = ({
    open,
    onClose,
    agendamentoFixo,
    onCancelFixo,
    onCancelIndividual,
    agendamentosFilhos,
    loadingFilhos,
}: RecurrenceManagerDrawerProps) => {
    const { message } = useApp();
    const [loadingCancelAll, setLoadingCancelAll] = useState(false);
    const [loadingCancelIndividual, setLoadingCancelIndividual] = useState<Record<number, boolean>>({});

    const { agendamentoFixoId, arenaName, quadraName } = agendamentoFixo;

    const valorTotalAgregado = agendamentosFilhos.reduce((acc, item) => acc + item.valor, 0);

    const hasPaidBookings = useMemo(() => {
        return agendamentosFilhos.some(item =>
            item.status === 'pago' || item.status === 'aceito'
        );
    }, [agendamentosFilhos])

    // Cancelamento em massa
    const handleCancelAll = async () => {
        setLoadingCancelAll(true);
        try {
            await onCancelFixo(agendamentoFixoId);
            onClose(); // Fecha o drawer após o sucesso
        } catch (error) {
            // O tratamento de erro está em onCancelFixo
        } finally {
            setLoadingCancelAll(false);
        }
    };

    // Cancelamento individual
    const handleCancelItem = async (agendamentoId: number) => {
        setLoadingCancelIndividual(prev => ({ ...prev, [agendamentoId]: true }));
        try {
            await onCancelIndividual(agendamentoId);
        } catch (error) {
            // O tratamento de erro está em onCancelIndividual
        } finally {
            setLoadingCancelIndividual(prev => ({ ...prev, [agendamentoId]: false }));
        }
    };

    const renderStatusTag = (status: AgendamentoCardData['status']) => {
        switch (status) {
            case 'cancelado':
                return <Tag icon={<CloseCircleOutlined />} color="error">Cancelado</Tag>;
            case 'pago':
                return <Tag icon={<CheckCircleOutlined />} color="success">Pago</Tag>;
            case 'pendente':
                return <Tag icon={<ClockCircleOutlined />} color="processing">Pendente</Tag>;
            default:
                return <Tag>{status.toUpperCase()}</Tag>;
        }
    };

    return (
        <Drawer
            title="Gerenciar Agendamento Fixo"
            placement="right"
            onClose={onClose}
            open={open}
            width={window.innerWidth > 768 ? 500 : '100%'}
            footer={agendamentoFixo.status !== 'pendente' ? false : (
                <Flex vertical gap="small">
                    {hasPaidBookings && (
                        <Text type="warning" strong>
                            O cancelamento em lote está bloqueado: Pelo menos um agendamento já foi pago ou confirmado.
                        </Text>
                    )}

                    <Flex justify="space-between" align='center'>
                        {/* [VALOR TOTAL AGREGADO] */}
                        <Text strong>Valor Total: <Text className='!text-green-600'>{valorTotalAgregado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text></Text>

                        <Popconfirm
                            title="Cancelar Recorrência"
                            description="Tem certeza que deseja cancelar TODOS os agendamentos fixos futuros desta recorrência?"
                            onConfirm={handleCancelAll}
                            okText="Sim, Cancelar Tudo"
                            cancelText="Não"
                            placement="topRight"
                            // [BLOQUEIO UI] Desabilita Popconfirm se houver pagamento
                            disabled={hasPaidBookings}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                loading={loadingCancelAll}
                                // [BLOQUEIO UI] Desabilita o botão se houver pagamento
                                disabled={hasPaidBookings}
                            >
                                Cancelar Toda a Recorrência ({agendamentosFilhos.length}x)
                            </Button>
                        </Popconfirm>
                    </Flex>
                </Flex>
            )}
        >
            <Title level={4}>{arenaName}</Title>
            <Text type="secondary">{quadraName}</Text>
            <Text strong className="block mt-2">Agendamento Recorrente: <Text className='!text-green-600'>{agendamentosFilhos.length} datas</Text></Text>

            {loadingFilhos ? (
                <Flex vertical justify="center" align="center" className="h-60">
                    <Spin size="large" />
                    <Text className='mt-2'>Buscando datas futuras...</Text>
                </Flex>
            ) : (
                <List
                    className="mt-4"
                    itemLayout="horizontal"
                    dataSource={agendamentosFilhos}
                    renderItem={(item) => (
                        <List.Item
                            actions={
                                item.status !== 'pendente' ? [] :
                                    [
                                        <Popconfirm
                                            key="cancel"
                                            title="Cancelar Agendamento"
                                            description="Tem certeza que deseja cancelar APENAS este agendamento individual?"
                                            onConfirm={() => handleCancelItem(item.id)}
                                            okText="Sim, Cancelar"
                                            cancelText="Não"
                                        >
                                            <Button
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                loading={loadingCancelIndividual[item.id]}
                                            >
                                                Cancelar
                                            </Button>
                                        </Popconfirm>
                                    ]
                            }
                        >
                            <List.Item.Meta
                                title={
                                    <Flex justify="space-between" align="center">
                                        <Text strong>
                                            {format(parseISO(item.date), 'EEEE, dd/MM', { locale: ptBR }).replace(/^./, c => c.toUpperCase())}
                                        </Text>
                                        <Text type="secondary">
                                            {item.startTime} - {item.endTime}
                                        </Text>
                                    </Flex>
                                }
                                description={
                                    <Flex justify="space-between" align="center">
                                        {renderStatusTag(item.status)}
                                        <Text strong>
                                            {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </Text>
                                    </Flex>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </Drawer>
    );
};
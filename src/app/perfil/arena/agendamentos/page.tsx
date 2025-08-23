"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Row, Col, Flex, Empty, App, Select, Tooltip, Button, DatePicker, Pagination, Typography, Segmented } from 'antd';
import { Dayjs } from 'dayjs';
import { CardAgendamentoArena, type AgendamentoArenaCardData } from '@/components/Cards/CardAgendamentoArena';
import { useTheme } from '@/context/ThemeProvider';
import { ClearOutlined } from '@ant-design/icons';
import {
    getAllAgendamentosArena,
    type AgendamentoArena,
    type AgendamentoArenaQueryParams,
    type StatusAgendamentoArena,
    updateStatusAgendamentoArena
} from '@/app/api/entities/agendamento';
import {
    getAllQuadras,
    type Quadra
} from '@/app/api/entities/quadra';
import { useAuth } from '@/context/hooks/use-auth';

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const CardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                    <div className="h-5 bg-gray-300 rounded w-32"></div>
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
            </div>
            <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
        </div>
        <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-300 rounded w-40"></div>
            <div className="h-4 bg-gray-300 rounded w-36"></div>
            <div className="h-5 bg-gray-300 rounded w-28"></div>
        </div>
        <div className="pt-3 border-t border-gray-200">
            <div className="h-8 w-24 bg-gray-300 rounded-md"></div>
        </div>
    </div>
);

const AgendamentosArenaSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded-md w-1/3 max-w-xs mx-auto mb-8"></div>

        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-12 lg:col-span-5">
                    <div className="h-5 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-9 bg-gray-300 rounded-md w-full"></div>
                </div>
                <div className="md:col-span-6 lg:col-span-3">
                    <div className="h-5 bg-gray-300 rounded w-8 mb-2"></div>
                    <div className="h-9 bg-gray-300 rounded-md w-full"></div>
                </div>
                <div className="md:col-span-5 lg:col-span-3">
                    <div className="h-5 bg-gray-300 rounded w-12 mb-2"></div>
                    <div className="h-9 bg-gray-300 rounded-md w-full"></div>
                </div>
                <div className="md:col-span-1 lg:col-span-1 flex justify-start md:justify-center">
                    <div className="h-9 w-9 bg-gray-300 rounded-md"></div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
            ))}
        </div>
    </div>
);

type ArenaView = 'pendentes' | 'historico';

const statusForView: Record<ArenaView, StatusAgendamentoArena> = {
    pendentes: 'PENDENTE',
    historico: 'FINALIZADO',
};

export default function MeusAgendamentosArena() {
    const { session, user, isAuthenticated, isLoadingSession } = useAuth();
    const { message } = App.useApp();
    const { isDarkMode } = useTheme();

    const [view, setView] = useState<ArenaView>('pendentes');
    const [agendamentos, setAgendamentos] = useState<AgendamentoArena[]>([]);
    const [quadras, setQuadras] = useState<Quadra[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        dateRange: null as [Dayjs | null, Dayjs | null] | null,
        quadraId: 'TODAS' as 'TODAS' | number,
    });

    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 18, totalElements: 0 });


    const fetchQuadras = useCallback(async () => {
        const arenaId = (user as any)?.userId;
        if (!arenaId) {
            console.warn("Arena ID not found in session.");
            return;
        }

        try {
            const response = await getAllQuadras({ arenaId, size: 50 });
            console.log("Quadras fetched successfully:", response.content);
            setQuadras(response.content);
        } catch (error) {
            console.error("Erro ao buscar as quadras da arena:", error);
            message.error("Não foi possível carregar a lista de quadras.");
        }
    }, [session, message]);

    const fetchAgendamentos = useCallback(async (page: number, currentFilters: typeof filters, currentView: ArenaView) => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const params: AgendamentoArenaQueryParams = {
                page: page - 1,
                size: pagination.pageSize,
                sort: 'dataAgendamento',
                direction: currentView === 'pendentes' ? 'asc' : 'desc',
                status: statusForView[currentView],
                dataInicio: currentFilters.dateRange?.[0]?.format('YYYY-MM-DD'),
                dataFim: currentFilters.dateRange?.[1]?.format('YYYY-MM-DD'),
                quadraId: currentFilters.quadraId === 'TODAS' ? undefined : currentFilters.quadraId,
            };

            const response = await getAllAgendamentosArena(params);
            setAgendamentos(response.content);
            setPagination(prev => ({ ...prev, currentPage: response.number + 1, totalElements: response.totalElements }));
        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error);
            message.error("Não foi possível carregar os agendamentos.");
        } finally {
            setLoading(false);
        }
    }, [session, isAuthenticated, pagination.pageSize, message, statusForView]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchQuadras();
        }
    }, [isAuthenticated, fetchQuadras]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAgendamentos(pagination.currentPage, filters, view);
        }
    }, [pagination.currentPage, filters, view, fetchAgendamentos, isAuthenticated]);

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleLimparFiltros = () => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        setFilters({
            dateRange: null,
            quadraId: 'TODAS',
        });
    };

    const handleViewChange = (newView: ArenaView) => {
        setView(newView);
        handleLimparFiltros();
    };

    const handleStatusChange = async (agendamentoId: number, newStatus: 'PAGO' | 'AUSENTE' | 'CANCELADO') => {
        try {
            await updateStatusAgendamentoArena(agendamentoId, newStatus);

            setAgendamentos(prevAgendamentos =>
                prevAgendamentos.filter(ag => ag.id !== agendamentoId)
            );

            setPagination(prev => ({
                ...prev,
                totalElements: prev.totalElements > 0 ? prev.totalElements - 1 : 0
            }));

            message.success(`Status do agendamento alterado com sucesso!`);
        } catch (error) {
            console.error("Falha ao atualizar status:", error);
            message.error("Não foi possível alterar o status do agendamento.");
        }
    };

    const agendamentosTransformados: AgendamentoArenaCardData[] = agendamentos.map(ag => ({
        id: ag.id,
        dataAgendamento: ag.dataAgendamento,
        horarioInicio: ag.horarioInicio,
        horarioFim: ag.horarioFim,
        valorTotal: ag.valorTotal,
        status: ag.status,
        nomeQuadra: ag.nomeQuadra,
        nomeAtleta: ag.nomeAtleta,
        urlFotoAtleta: ag.urlFotoAtleta,
    }));

    const renderContent = () => {
        if (agendamentosTransformados.length > 0) {
            return (
                <>
                    <Row gutter={[24, 24]}>
                        {agendamentosTransformados.map(agendamento => (
                            <Col key={agendamento.id} xs={24} md={12} lg={8}>
                                <CardAgendamentoArena
                                    agendamento={agendamento}
                                    onStatusChange={handleStatusChange}
                                />
                            </Col>
                        ))}
                    </Row>
                    <Flex justify='center' className="!mt-8">
                        <Pagination
                            current={pagination.currentPage}
                            total={pagination.totalElements}
                            pageSize={pagination.pageSize}
                            onChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                            showSizeChanger={false}
                        />
                    </Flex>
                </>
            );
        }
        return <Empty description="Nenhum agendamento encontrado com os filtros aplicados." className="mt-10 p-8" />;
    };

    return (
        <Content className={`!px-4 sm:!px-10 lg:!px-40 !pt-8 !pb-18 !flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            {loading || isLoadingSession ? (
                <AgendamentosArenaSkeleton />
            ) : (
                <>
                    <Typography.Title level={3} className="text-center mb-8">
                        Agendamentos da Arena
                    </Typography.Title>

                    <div className="sticky top-[56px] z-10 py-4">
                        <Flex justify="center">
                            <Segmented<ArenaView>
                                options={[
                                    { label: 'Pendentes', value: 'pendentes' },
                                    { label: 'Histórico', value: 'historico' }
                                ]}
                                value={view}
                                onChange={handleViewChange}
                                size="large"
                            />
                        </Flex>
                    </div>

                    <div className="mt-2">
                        <Row gutter={[16, 16]} align="bottom">
                            <Col xs={24} sm={12} lg={10}>
                                <Text strong>Período</Text>
                                <RangePicker
                                    value={filters.dateRange}
                                    onChange={(dates) => handleFilterChange('dateRange', dates)}
                                    className="!w-full"
                                    placeholder={['Data Inicial', 'Data Final']}
                                    format="DD/MM/YYYY"
                                />
                            </Col>
                            <Col xs={21} sm={8} lg={6}>
                                <Text strong>Quadra</Text>
                                <Select
                                    placeholder="Selecione a quadra"
                                    value={filters.quadraId}
                                    onChange={(value) => handleFilterChange('quadraId', value)}
                                    className="!w-full"
                                    options={[
                                        { label: 'Todas as Quadras', value: 'TODAS' },
                                        ...quadras.map(q => ({ label: q.nomeQuadra, value: q.id }))
                                    ]}
                                />
                            </Col>
                            <Col xs={3} sm={4} lg={2} className="flex">
                                <Tooltip title="Limpar filtros">
                                    <Button icon={<ClearOutlined />} onClick={handleLimparFiltros} className="!w-full" />
                                </Tooltip>
                            </Col>
                        </Row>
                    </div>

                    <div className="mt-6">
                        {renderContent()}
                    </div>
                </>
            )}
        </Content>
    );
}
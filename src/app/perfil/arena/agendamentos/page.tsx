"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Layout, Row, Col, Flex, Empty, App, Select, Tooltip,
    Button, DatePicker, Pagination, Typography, Segmented
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { CardAgendamentoArena } from '@/components/Cards/CardAgendamentoArena';
import { useTheme } from '@/context/ThemeProvider';
import { ClearOutlined } from '@ant-design/icons';
import {
    getAllAgendamentosArena,
    cancelarRecorrenciaArena,
    type AgendamentoArena,
    type AgendamentoArenaQueryParams,
    type StatusAgendamentoArena,
    type AgendamentoArenaCardData,
    updateStatusAgendamentoArena,
    listarAgendamentosFixosFilhosArena
} from '@/app/api/entities/agendamento';
import {
    getAllQuadras,
    type Quadra
} from '@/app/api/entities/quadra';
import { useAuth } from '@/context/hooks/use-auth';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { RecurrenceManagerDrawerArena } from '@/components/Drawers/RecurrenceManagerDrawerArena';

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

type ArenaView = 'ativos' | 'historico';

const statusForView: Record<ArenaView, StatusAgendamentoArena> = {
    ativos: 'PENDENTE',
    historico: 'FINALIZADO',
};

const isValidView = (view: string | null): view is ArenaView => {
    return view === 'ativos' || view === 'historico';
}

interface AgendamentoArenaMestre extends AgendamentoArenaCardData {
    tipoAgrupamento: 'FIXO_GRUPO';
    agendamentoFixoId: number;
    agendamentosFixosFilhos: AgendamentoArenaCardData[];
}

interface AgendamentoArenaNormal extends AgendamentoArenaCardData {
    tipoAgrupamento: 'NORMAL';
}

type AgendamentoArenaAgrupado = AgendamentoArenaMestre | AgendamentoArenaNormal;

export default function MeusAgendamentosArena() {
    const { session, user, isAuthenticated, isLoadingSession } = useAuth();
    const { message } = App.useApp();
    const { isDarkMode } = useTheme();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [view, setView] = useState<ArenaView>(() => {
        const aba = searchParams.get('aba');
        return isValidView(aba) ? aba : 'ativos';
    });
    const [agendamentos, setAgendamentos] = useState<AgendamentoArena[]>([]);
    const [agendamentosFilhos, setAgendamentosFilhos] = useState<AgendamentoArenaCardData[]>([]);
    const [loadingFilhos, setLoadingFilhos] = useState(false);
    const [quadras, setQuadras] = useState<Quadra[]>([]);
    const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: Number(searchParams.get('pagina')) || 1,
        pageSize: 18,
        totalElements: 0
    });
    const [drawerFixoData, setDrawerFixoData] = useState<AgendamentoArenaMestre | null>(null);
    const [isDrawerFixoOpen, setIsDrawerFixoOpen] = useState(false);
    const [filters, setFilters] = useState(() => {
        const quadraIdParam = searchParams.get('quadra');
        const dataInicioParam = searchParams.get('dataInicio');
        const dataFimParam = searchParams.get('dataFim');

        return {
            dateRange: (dataInicioParam && dataFimParam)
                ? [dayjs(dataInicioParam), dayjs(dataFimParam)] as [Dayjs, Dayjs]
                : null,
            quadraId: quadraIdParam ? Number(quadraIdParam) : 'TODAS' as 'TODAS' | number
        };
    });

    const fetchQuadras = useCallback(async () => {
        const arenaId = (user as any)?.userId;
        if (!arenaId) {
            console.warn("Arena ID not found in session.");
            return;
        }

        try {
            const response = await getAllQuadras({ arenaId, size: 50 });
            setQuadras(response.content);
        } catch (error) {
            console.error("Erro ao buscar as quadras da arena:", error);
            message.error("Não foi possível carregar a lista de quadras.");
        }
    }, [session, message]);

    const fetchAgendamentos = useCallback(async (page: number, currentFilters: typeof filters, currentView: ArenaView) => {
        if (!isAuthenticated) return;
        setLoadingAgendamentos(true);

        let statusParam: StatusAgendamentoArena | undefined = undefined;

        if (currentView === 'historico') {
            statusParam = statusForView[currentView];
        }
        try {
            const params: AgendamentoArenaQueryParams = {
                page: page - 1,
                size: pagination.pageSize,
                sort: 'dataAgendamento',
                direction: currentView === 'ativos' ? 'asc' : 'desc',
                status: statusParam,
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
            setLoadingAgendamentos(false);
        }
    }, [session, isAuthenticated, message, statusForView]);

    const agendamentosAgrupados = useMemo((): AgendamentoArenaAgrupado[] => {
        return agendamentos.map(ag => {
            const isFixoMestre = ag.agendamentoFixoId && ag.fixo;

            if (isFixoMestre) {
                return {
                    ...ag,
                    tipoAgrupamento: 'FIXO_GRUPO',
                    agendamentosFixosFilhos: [],
                } as AgendamentoArenaMestre;
            } else {
                return {
                    ...ag,
                    tipoAgrupamento: 'NORMAL',
                } as AgendamentoArenaNormal;
            }
        });
    }, [agendamentos]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        params.set('aba', view);

        if (filters.quadraId !== 'TODAS') {
            params.set('quadra', String(filters.quadraId));
        } else {
            params.delete('quadra');
        }

        if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
            params.set('dataInicio', filters.dateRange[0].format('YYYY-MM-DD'));
            params.set('dataFim', filters.dateRange[1].format('YYYY-MM-DD'));
        } else {
            params.delete('dataInicio');
            params.delete('dataFim');
        }

        if (pagination.currentPage > 1) {
            params.set('pagina', String(pagination.currentPage));
        } else {
            params.delete('pagina');
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    }, [view, filters, pagination.currentPage, pathname, router, searchParams]);

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

    const handleAbrirDrawerFixo = useCallback(async (agendamentoMestre: AgendamentoArenaMestre) => {
        if (!agendamentoMestre.agendamentoFixoId) return;

        setDrawerFixoData(agendamentoMestre);
        setIsDrawerFixoOpen(true);
        setLoadingFilhos(true);
        setAgendamentosFilhos([]); // Limpa a lista anterior

        try {
            const filhosDaApi = await listarAgendamentosFixosFilhosArena(agendamentoMestre.agendamentoFixoId);

            const filhosMapeados: AgendamentoArenaCardData[] = filhosDaApi.map(ag => ({
                ...ag,
                tipoAgrupamento: 'NORMAL',
                dataAgendamento: ag.dataAgendamento,
            }));

            filhosMapeados.sort((a, b) => {
                const dateA = new Date(a.dataAgendamento[0], a.dataAgendamento[1] - 1, a.dataAgendamento[2]).getTime();
                const dateB = new Date(b.dataAgendamento[0], b.dataAgendamento[1] - 1, b.dataAgendamento[2]).getTime();
                return dateA - dateB;
            });

            setAgendamentosFilhos(filhosMapeados);
        } catch (error) {
            message.error("Falha ao carregar as recorrências. Tente novamente.");
            console.error(error);
            setIsDrawerFixoOpen(false);
        } finally {
            setLoadingFilhos(false);
        }
    }, [message]);

    const handleCancelarAgendamentoFixo = useCallback(async (agendamentoFixoId: number) => {
        try {
            await cancelarRecorrenciaArena(agendamentoFixoId);

            message.success("Recorrência de agendamentos cancelada com sucesso!");

            fetchAgendamentos(pagination.currentPage, filters, view);

        } catch (error) {
            const errorMsg = (error as Error)?.message ?? "Não foi possível cancelar a recorrência.";
            message.error(errorMsg);
            throw error;
        }
    }, [message, fetchAgendamentos, pagination.currentPage, filters, view]);

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

        } catch (error) {
            console.error("Falha ao atualizar status:", error);
            message.error("Não foi possível alterar o status do agendamento.");
        }
        finally {
            setIsDrawerFixoOpen(false);
        }
    };

    const renderContent = () => {
        if (agendamentosAgrupados.length > 0) {
            return (
                <>
                    <Row gutter={[24, 24]}>
                        {agendamentosAgrupados.map(agendamento => (
                            <Col key={agendamento.id} xs={24} sm={12} md={12} lg={8}>
                                <CardAgendamentoArena
                                    agendamento={agendamento}
                                    onStatusChange={handleStatusChange}
                                    onGerenciarFixo={agendamento.tipoAgrupamento === 'FIXO_GRUPO'
                                        ? () => handleAbrirDrawerFixo(agendamento as AgendamentoArenaMestre)
                                        : undefined
                                    }
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
        return <Empty description="Nenhum agendamento encontrado." className="mt-10 p-8" />;
    };

    return (
        <Content className={`!px-4 sm:!px-10 lg:!px-40 !pt-8 !pb-18 !flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            {loadingAgendamentos || isLoadingSession ? (
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
                                    { label: 'Ativos', value: 'ativos' },
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

            {drawerFixoData && (
                <RecurrenceManagerDrawerArena
                    open={isDrawerFixoOpen}
                    onClose={() => setIsDrawerFixoOpen(false)}
                    agendamentoFixo={drawerFixoData}
                    onCancelFixo={handleCancelarAgendamentoFixo}
                    onStatusChangeIndividual={handleStatusChange}
                    agendamentosFilhos={agendamentosFilhos}
                    loadingFilhos={loadingFilhos}
                />
            )}
        </Content>
    );
}
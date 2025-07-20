"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Pagination, Layout, Row, Col, Flex, Empty, App, Segmented, Typography, Select, DatePicker, Button, Tooltip } from 'antd';
import { CardAgendamento, type AgendamentoCardData } from '@/components/Cards/AgendamentoCard';
import { useSession } from 'next-auth/react';
import { getAllAgendamentosNormalAtleta, cancelarAgendamentoNormal, type AgendamentoNormal, type StatusAgendamento } from '@/app/api/entities/agendamento';
import { useTheme } from '@/context/ThemeProvider';
import { JogoAbertoCard } from '@/components/Cards/JogoAbertoCard';
import { listarJogosAbertosSolicitadosMe, type JogoAbertoMeSolicitado } from '@/app/api/entities/jogosAbertos';
import { Dayjs } from 'dayjs';
import { ClearOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Text } = Typography;


const CardAgendamentoSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-40 bg-gray-300"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                <div className="h-8 bg-gray-300 rounded-md w-1/4"></div>
            </div>
        </div>
    </div>
);
const MeusAgendamentosSkeleton = () => (
    <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1 animate-pulse">
        <div className="h-7 bg-gray-300 rounded-md w-56 mx-auto mb-8"></div>
        <div className="h-10 bg-gray-300 rounded-full w-80 mx-auto mb-8"></div>
        <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => <CardAgendamentoSkeleton key={index} />)}
        </div>
    </main>
);

type AgendamentoView = 'pendentes' | 'historico' | 'participacoes';
type TipoAgendamento = 'AMBOS' | 'NORMAL' | 'FIXO';

const statusForView: Record<AgendamentoView, StatusAgendamento | undefined> = {
    pendentes: 'PENDENTE',
    historico: 'FINALIZADO',
    participacoes: undefined,
};

export default function Agendamentos() {
    const { status: sessionStatus } = useSession();
    const { message } = App.useApp();
    const { isDarkMode } = useTheme();

    const [view, setView] = useState<AgendamentoView>('pendentes');
    const [agendamentos, setAgendamentos] = useState<AgendamentoNormal[]>([]);
    const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 12, totalElements: 0 });

    const [solicitacoes, setSolicitacoes] = useState<JogoAbertoMeSolicitado[]>([]);
    const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(true);

    const [filters, setFilters] = useState({
        dateRange: null as [Dayjs | null, Dayjs | null] | null,
        tipo: 'AMBOS' as TipoAgendamento,
    });

    const fetchAgendamentos = useCallback(async (page: number, status?: StatusAgendamento, currentFilters?: typeof filters) => {
        setLoadingAgendamentos(true);
        try {
            const params: any = {
                page: page - 1,
                size: pagination.pageSize,
                sort: 'dataAgendamento',
                direction: view === 'pendentes' ? "asc" : "desc",
                tipoAgendamento: currentFilters?.tipo || 'AMBOS',
                status: status,
            };

            if (currentFilters?.dateRange) {
                params.dataInicio = currentFilters.dateRange[0]?.format('YYYY-MM-DD');
                params.dataFim = currentFilters.dateRange[1]?.format('YYYY-MM-DD');
            }
            if (currentFilters?.tipo && currentFilters.tipo !== 'AMBOS') {
                params.tipoAgendamento = currentFilters.tipo;
            }

            const response = await getAllAgendamentosNormalAtleta(params);
            setAgendamentos(response.content);
            setPagination(prev => ({ ...prev, currentPage: response.number + 1, totalElements: response.totalElements }));
        } catch (error) {
            message.error((error as Error)?.message ?? "Não foi possível carregar os agendamentos.");
            setAgendamentos([]);
        } finally {
            setLoadingAgendamentos(false);
        }
    }, [pagination.pageSize, message, view]);

    const fetchSolicitacoes = useCallback(async () => {
        setLoadingSolicitacoes(true);
        try {
            const response = await listarJogosAbertosSolicitadosMe();
            setSolicitacoes(
                response.map((item: any) => ({
                    ...item,
                    solicitacaoId: item.solicitacaoId,
                    status: item.status,
                }))
            );
        } catch (error) {
            message.error((error as Error)?.message ?? "Não foi possível carregar suas solicitações.");
            setSolicitacoes([]);
        } finally {
            setLoadingSolicitacoes(false);
        }
    }, [message]);

    const handleLimparFiltros = useCallback(() => {
        setFilters({
            dateRange: null,
            tipo: 'AMBOS',
        });
    }, []);

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            const currentStatus = statusForView[view];
            if (view === 'participacoes') {
                fetchSolicitacoes();
            } else {
                fetchAgendamentos(1, currentStatus, filters);
            }
        }
    }, [view, filters, sessionStatus, fetchAgendamentos, fetchSolicitacoes]);


    const handlePageChange = (page: number) => {
        const currentStatus = statusForView[view];
        if (currentStatus) {
            fetchAgendamentos(page, currentStatus, filters);
        }
    };

    const handleViewChange = (value: AgendamentoView) => {
        setView(value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
        handleLimparFiltros();
    };

    const handleSaidaComSucesso = (solicitacaoId: number) => {
        setSolicitacoes(prev => prev.filter(s => s.solicitacaoId !== solicitacaoId));
    };

    const handleCancelarAgendamento = async (id: number) => {
        try {
            await cancelarAgendamentoNormal(id);
            message.success("Agendamento cancelado com sucesso!");
            const currentStatus = statusForView[view];
            if (currentStatus) {
                fetchAgendamentos(pagination.currentPage, currentStatus);
            }
        } catch (error) {
            message.error((error as Error)?.message ?? "Não foi possível cancelar o agendamento.");
        }
    };

    const agendamentosTransformados = useMemo((): AgendamentoCardData[] => {
        return agendamentos.map(agendamento => ({
            id: agendamento.id,
            date: agendamento.dataAgendamento,
            startTime: agendamento.horarioInicio,
            endTime: agendamento.horarioFim,
            valor: agendamento.valorTotal,
            esporte: agendamento.esporte,
            status: agendamento.status.toLowerCase() as AgendamentoCardData['status'],
            numeroJogadoresNecessarios: agendamento.numeroJogadoresNecessarios,
            quadraName: agendamento.nomeQuadra,
            arenaName: agendamento.nomeArena,
            urlFotoArena: agendamento.urlFotoArena,
            urlFotoQuadra: agendamento.urlFotoQuadra,
            fixo: agendamento.fixo,
            publico: agendamento.publico,
            possuiSolicitacoes: agendamento.possuiSolicitacoes,
        }));
    }, [agendamentos]);

    if (sessionStatus === 'loading') {
        return <MeusAgendamentosSkeleton />;
    }

    const renderAgendamentos = () => {
        if (loadingAgendamentos) {
            return (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => <CardAgendamentoSkeleton key={index} />)}
                </div>
            );
        }
        if (agendamentosTransformados.length > 0) {
            return (
                <>
                    <Row gutter={[24, 24]} align="stretch">
                        {agendamentosTransformados.map(agendamento => (
                            <Col key={agendamento.id} xs={24} md={12} lg={8}>
                                <CardAgendamento agendamento={agendamento} onCancel={handleCancelarAgendamento} />
                            </Col>
                        ))}
                    </Row>
                    {pagination.totalElements > pagination.pageSize && (
                        <Flex justify='center' className="!mt-8">
                            <Pagination
                                current={pagination.currentPage}
                                total={pagination.totalElements}
                                pageSize={pagination.pageSize}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </Flex>
                    )}
                </>
            );
        }
        return <Empty description="Nenhum agendamento encontrado." className="mt-10 p-8" />;
    };

    const renderSolicitacoes = () => {
        if (loadingSolicitacoes) {
            return (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => <CardAgendamentoSkeleton key={index} />)}
                </div>
            );
        }
        if (solicitacoes.length > 0) {
            return (
                <Row gutter={[24, 24]} align="stretch">
                    {solicitacoes.map(solicitacao => (
                        <Col key={solicitacao.solicitacaoId} xs={24} md={12} lg={8}>
                            <JogoAbertoCard
                                jogoAberto={solicitacao}
                                onSaidaSucesso={handleSaidaComSucesso}
                            />
                        </Col>
                    ))}
                </Row>
            );
        }
        return <Empty description="Você não possui nenhuma participação em jogos abertos." className="mt-10 p-8" />;
    };

    return (
        <Content
            className={`!px-4 sm:!px-10 lg:!px-40 !pt-8 !pb-18 !flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}
        >
            <Typography.Title level={3} className="text-center mb-8">
                Meus Agendamentos
            </Typography.Title>

            <div className="sticky top-[56px] z-10 py-4">
                <Flex justify="center">
                    <Segmented<AgendamentoView>
                        options={[
                            { label: 'Pendentes', value: 'pendentes' },
                            { label: 'Histórico', value: 'historico' },
                            { label: 'Participações', value: 'participacoes' }
                        ]}
                        value={view}
                        onChange={handleViewChange}
                        size="large"
                    />
                </Flex>
            </div>

            {view === 'historico' && (
                <div className="mt-2">
                    <Row gutter={[16, 16]} align="bottom">
                        <Col xs={24} sm={12} lg={10}>
                            <Text strong>Período</Text>
                            <RangePicker
                                value={filters.dateRange}
                                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates as [Dayjs, Dayjs] }))}
                                format="DD/MM/YYYY"
                                className="!w-full"
                                placeholder={['Data inicial', 'Data final']}
                            />
                        </Col>
                        <Col xs={21} sm={8} lg={6}>
                            <Text strong>Tipo</Text>
                            <Select
                                value={filters.tipo}
                                onChange={(value) => setFilters(prev => ({ ...prev, tipo: value }))}
                                className="!w-full"
                                options={[
                                    { label: 'Ambos', value: 'AMBOS' },
                                    { label: 'Normal', value: 'NORMAL' },
                                    { label: 'Fixo', value: 'FIXO' }
                                ]}
                            />
                        </Col>
                        <Col xs={3} sm={4} lg={2}>
                            <Tooltip title="Limpar filtros">
                                <Button icon={<ClearOutlined />} onClick={handleLimparFiltros} className="!w-full" />
                            </Tooltip>
                        </Col>
                    </Row>
                </div>
            )}

            <div className="mt-6">
                {view !== 'participacoes' && renderAgendamentos()}
                {view === 'participacoes' && renderSolicitacoes()}
            </div>
        </Content>
    );

}
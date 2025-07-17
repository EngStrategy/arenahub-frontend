"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DatePicker, Pagination, Layout, Row, Col, Flex, Empty, App, Segmented, Space, Select, Tooltip, Button } from 'antd';
import { CardAgendamento, type AgendamentoCardData } from '@/components/Cards/AgendamentoCard';
import { Dayjs } from 'dayjs';
import { useSession } from 'next-auth/react';
import { getAllAgendamentosNormalAtleta, cancelarAgendamentoNormal, type AgendamentoNormal } from '@/app/api/entities/agendamento';
import { useTheme } from '@/context/ThemeProvider';
import { ButtonDelete } from '@/components/Buttons/ButtonDelete';
import { JogoAbertoCard } from '@/components/Cards/JogoAbertoCard';
import { listarJogosAbertosSolicitadosMe, type JogoAbertoMeSolicitado } from '@/app/api/entities/jogosAbertos';
import { ClearOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { RangePicker } = DatePicker;

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


export default function Agendamentos() {
    const { status: sessionStatus } = useSession();
    const { message } = App.useApp();
    const { isDarkMode } = useTheme();

    const [view, setView] = useState<'agendamentos' | 'solicitacoes'>('agendamentos');

    const [agendamentos, setAgendamentos] = useState<AgendamentoNormal[]>([]);
    const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [tipoAgendamento, setTipoAgendamento] = useState<'NORMAL' | 'FIXO' | 'AMBOS'>('AMBOS');
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 16, totalElements: 0 });

    const [solicitacoes, setSolicitacoes] = useState<JogoAbertoMeSolicitado[]>([]);
    const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(true);

    const fetchAgendamentos = useCallback(async (page: number) => {
        setLoadingAgendamentos(true);
        try {
            const params = {
                page: page - 1,
                size: pagination.pageSize,
                sort: 'dataAgendamento',
                direction: "desc" as const,
                dataInicio: dateRange?.[0]?.format('YYYY-MM-DD'),
                dataFim: dateRange?.[1]?.format('YYYY-MM-DD'),
                tipoAgendamento: tipoAgendamento === 'AMBOS' ? undefined : tipoAgendamento,
            };
            const response = await getAllAgendamentosNormalAtleta(params);
            setAgendamentos(response.content);
            setPagination(prev => ({ ...prev, currentPage: response.number + 1, totalElements: response.totalElements }));
        } catch (error) {
            message.error((error as Error)?.message ?? "Não foi possível carregar os agendamentos.");
        } finally {
            setLoadingAgendamentos(false);
        }
    }, [pagination.pageSize, dateRange, tipoAgendamento, message]);

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
        } finally {
            setLoadingSolicitacoes(false);
        }
    }, [message]);

    const handleSaidaComSucesso = (solicitacaoId: number) => {
        setSolicitacoes(prev => prev.filter(s => s.solicitacaoId !== solicitacaoId));
    };


    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            if (view === 'agendamentos') {
                fetchAgendamentos(pagination.currentPage);
            } else {
                fetchSolicitacoes();
            }
        }
    }, [view, dateRange, tipoAgendamento, sessionStatus, pagination.currentPage]);


    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleLimparFiltro = () => {
        setDateRange(null);
        setTipoAgendamento('AMBOS');
    };

    const handleCancelarAgendamento = async (id: number) => {
        try {
            await cancelarAgendamentoNormal(id);
            message.success("Agendamento cancelado com sucesso!");
            fetchAgendamentos(pagination.currentPage);
        } catch (error) {
            message.error((error as Error)?.message ?? "Não foi possível cancelar o agendamento.");
        }
    };

    const agendamentosTransformados = useMemo(() => {
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
        }));
    }, [agendamentos]);

    if (sessionStatus === 'loading') {
        return <MeusAgendamentosSkeleton />;
    }

    return (
        <Content
            className={`!px-4 sm:!px-10 lg:!px-40 !py-8 !flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}
        >
            {/* Barra de filtros e abas que fica fixa no topo */}
            <div className="sticky top-[56px] z-10 py-4" >
                <Flex justify="center" className="!mb-6">
                    <Segmented
                        options={[
                            { label: 'Meus Agendamentos', value: 'agendamentos' },
                            { label: 'Participações', value: 'solicitacoes' }
                        ]}
                        value={view}
                        onChange={(value) => setView(value as 'agendamentos' | 'solicitacoes')}
                        size="large"
                    />
                </Flex>

            </div>
            {view === 'agendamentos' && (
                <Flex justify='center'>
                    <Space.Compact size="middle">
                        <Select
                            value={tipoAgendamento}
                            onChange={setTipoAgendamento}
                            options={[
                                { label: 'Todos os Tipos', value: 'AMBOS' },
                                { label: 'Normais', value: 'NORMAL' },
                                { label: 'Fixos', value: 'FIXO' }
                            ]}
                            style={{ minWidth: '150px' }}
                        />
                        <RangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            format="DD/MM/YYYY"
                            readOnly
                            placeholder={['Data inicial', 'Data final']}
                        />
                        <Tooltip title="Limpar filtros">
                            <Button icon={<ClearOutlined />} onClick={handleLimparFiltro} />
                        </Tooltip>
                    </Space.Compact>
                </Flex>
            )}


            <div className="mt-8">
                {view === 'agendamentos' && (() => {
                    let agendamentosContent;
                    if (loadingAgendamentos) {
                        agendamentosContent = (
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, index) => <CardAgendamentoSkeleton key={index} />)}
                            </div>
                        );
                    } else if (agendamentosTransformados.length > 0) {
                        agendamentosContent = (
                            <>
                                <Row gutter={[24, 24]} align="stretch">
                                    {agendamentosTransformados.map(agendamento => (
                                        <Col key={agendamento.id} xs={24} md={12} lg={8}>
                                            <CardAgendamento agendamento={agendamento} onCancel={handleCancelarAgendamento} />
                                        </Col>
                                    ))}
                                </Row>
                                {agendamentosTransformados.length > pagination.pageSize && (
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
                    } else {
                        agendamentosContent = (
                            <Empty description="Nenhum agendamento encontrado para o período selecionado." className="mt-10 p-8" />
                        );
                    }
                    return agendamentosContent;
                })()}

                {view === 'solicitacoes' && (() => {
                    let solicitacoesContent;
                    if (loadingSolicitacoes) {
                        solicitacoesContent = (
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, index) => <CardAgendamentoSkeleton key={index} />)}
                            </div>
                        );
                    } else if (solicitacoes.length > 0) {
                        solicitacoesContent = (
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
                    } else {
                        solicitacoesContent = (
                            <Empty description="Você não possui nenhuma solicitação para jogos abertos." className="mt-10 p-8" />
                        );
                    }
                    return solicitacoesContent;
                })()}
            </div>
        </Content>
    );
}
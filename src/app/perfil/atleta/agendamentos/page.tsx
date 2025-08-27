"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
    Pagination,
    Layout,
    Row,
    Col,
    Flex,
    Empty,
    App,
    Segmented,
    Typography,
    Select,
    DatePicker,
    Button,
    Tooltip,
    Card,
    Rate,
    Avatar,
    Divider,
    Carousel,
    Form,
    Input
} from 'antd';
import { CardAgendamento, type AgendamentoCardData } from '@/components/Cards/AgendamentoCard';

import {
    getAllAgendamentosNormalAtleta,
    cancelarAgendamentoNormal,
    getAgendamentosAvaliacoesPendentes,
    criarOuDispensarAvaliacao,
    atualizarAvaliacao,
    type AgendamentoNormal,
    type StatusAgendamento,
    type AvaliacaoResponse,
} from '@/app/api/entities/agendamento';
import { useTheme } from '@/context/ThemeProvider';
import { JogoAbertoCard } from '@/components/Cards/JogoAbertoCard';
import { listarJogosAbertosSolicitadosMe, type JogoAbertoMeSolicitado } from '@/app/api/entities/jogosAbertos';
import dayjs, { Dayjs } from 'dayjs';
import { ClearOutlined, CloseOutlined, LeftOutlined, PictureOutlined, RightOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/hooks/use-auth';

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

import type { CarouselRef } from 'antd/es/carousel';

export default function Agendamentos() {
    const carouselRef = useRef<CarouselRef>(null);
    const { isAuthenticated, isLoadingSession } = useAuth();
    const { message, notification } = App.useApp();
    const { isDarkMode } = useTheme();

    const [view, setView] = useState<AgendamentoView>('pendentes');
    const [agendamentos, setAgendamentos] = useState<AgendamentoNormal[]>([]);
    const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
    const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 12, totalElements: 0 });

    const [solicitacoes, setSolicitacoes] = useState<JogoAbertoMeSolicitado[]>([]);
    const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(true);

    const [agendamentosParaAvaliar, setAgendamentosParaAvaliar] = useState<AgendamentoCardData[]>([]);

    const onFinishCarouselItem = async (agendamentoId: number, values: { nota: number, comentario?: string }) => {
        await handleSubmeterAvaliacao(agendamentoId, values.nota, values.comentario);
        if (carouselRef.current) carouselRef.current.next();
    };

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
            const errorMsg = (error as Error)?.message ?? "Não foi possível carregar os agendamentos.";
            notification.error({ message: errorMsg, duration: 8 });
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
            const errorMsg = (error as Error)?.message ?? "Não foi possível carregar suas solicitações.";
            notification.error({ message: errorMsg, duration: 8 });
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
            avaliacao: agendamento.avaliacao ? {
                idAvaliacao: agendamento.avaliacao.idAvaliacao,
                nota: agendamento.avaliacao.nota,
                comentario: agendamento.avaliacao.comentario
            } : null,
            avaliacaoDispensada: agendamento.avaliacaoDispensada,
        }));
    }, [agendamentos]);

    useEffect(() => {
        if (isAuthenticated && !isLoadingSession) {
            const currentStatus = statusForView[view];
            if (view === 'participacoes') {
                fetchSolicitacoes();
            } else {
                fetchAgendamentos(1, currentStatus, filters);
            }
        }
    }, [view, filters, isAuthenticated, isLoadingSession, fetchAgendamentos, fetchSolicitacoes]);

    useEffect(() => {
        if (isAuthenticated && !isLoadingSession && view === 'historico') {
            const fetchAvaliacoesPendentes = async () => {
                setLoadingAvaliacoes(true);
                try {
                    const response = await getAgendamentosAvaliacoesPendentes();
                    console.log('Avaliações pendentes:', response);
                    const pendentesTransformados = response
                        ? response.map(ag => ({
                            id: ag.id,
                            date: ag.dataAgendamento,
                            startTime: ag.horarioInicio,
                            endTime: ag.horarioFim,
                            valor: ag.valorTotal,
                            esporte: ag.esporte,
                            status: ag.status.toLowerCase() as AgendamentoCardData['status'],
                            quadraName: ag.nomeQuadra,
                            arenaName: ag.nomeArena,
                            urlFotoArena: ag.urlFotoArena,
                            urlFotoQuadra: ag.urlFotoQuadra,
                            fixo: ag.fixo,
                            publico: ag.publico,
                            avaliacao: null,
                            avaliacaoDispensada: ag.avaliacaoDispensada,
                        }))
                        : [];
                    setAgendamentosParaAvaliar(pendentesTransformados);
                } catch (error) {
                    const errorMsg = (error as Error)?.message ?? "Não foi possível buscar avaliações pendentes.";
                    console.error("Erro ao buscar avaliações pendentes:", error);
                    notification.error({ message: errorMsg, duration: 8 });
                } finally {
                    setLoadingAvaliacoes(false);
                }
            };
            fetchAvaliacoesPendentes();
        } else {
            setAgendamentosParaAvaliar([]);
        }
    }, [isAuthenticated, isLoadingSession, view]);

    const handleSubmeterAvaliacao = useCallback(async (agendamentoId: number, nota: number, comentario?: string) => {
        try {
            await criarOuDispensarAvaliacao(agendamentoId, { nota, comentario });

            setAgendamentosParaAvaliar(prev => prev.filter(ag => ag.id !== agendamentoId));

            setAgendamentos(prev =>
                prev.map(ag =>
                    ag.id === agendamentoId
                        ? { ...ag, avaliacao: { idAvaliacao: ag.avaliacao?.idAvaliacao ?? 0, nota, comentario: comentario || '' } }
                        : ag
                )
            );

            message.success("Obrigado pela sua avaliação!");
        } catch (error) {
            const errorMsg = (error as Error)?.message ?? "Não foi possível enviar sua avaliação. Tente novamente.";
            message.error(errorMsg);
        }
    }, [message]);

    const handleAtualizarAvaliacao = useCallback(async (avaliacaoId: number, nota: number, comentario?: string) => {
        try {
            await atualizarAvaliacao(avaliacaoId, { nota, comentario });

            setAgendamentos(prev =>
                prev.map(ag =>
                    ag.avaliacao?.idAvaliacao === avaliacaoId
                        ? { ...ag, avaliacao: { idAvaliacao: avaliacaoId, nota, comentario: comentario || '' } }
                        : ag
                )
            );

            message.success("Avaliação atualizada com sucesso!");
        } catch (error) {
            const errorMsg = (error as Error)?.message ?? "Não foi possível atualizar sua avaliação. Tente novamente.";
            notification.error({ message: errorMsg, duration: 8 });
        }
    }, [message]);

    const handleDispensarAvaliacao = useCallback(async (agendamentoId: number) => {
        try {
            await criarOuDispensarAvaliacao(agendamentoId, {});

            setAgendamentosParaAvaliar(prev => prev.filter(ag => ag.id !== agendamentoId));
            message.info("Avaliação dispensada.");
        } catch (error) {
            console.error("Erro ao dispensar avaliação:", error);
            const errorMsg = (error as Error)?.message ?? "Não foi possível dispensar a avaliação. Tente novamente.";
            notification.error({ message: errorMsg, duration: 8 });
        }
    }, [message]);

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
            const errorMsg = (error as Error)?.message ?? "Não foi possível cancelar o agendamento.";
            notification.error({ message: errorMsg, duration: 8 });
        }
    };

    if (isLoadingSession) {
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
                                <CardAgendamento
                                    agendamento={agendamento}
                                    onCancel={handleCancelarAgendamento}
                                    onAvaliacaoSubmit={handleAtualizarAvaliacao}
                                />
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
        <Content className={`!px-4 sm:!px-10 lg:!px-40 !pt-8 !pb-18 !flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`} >
            <Typography.Title level={3} className="text-center mb-8">
                Meus Agendamentos
            </Typography.Title>

            {agendamentosParaAvaliar.length > 0 && view === 'historico' && (
                <div className="mb-8 relative px-8">
                    <Carousel
                        ref={carouselRef}
                        dots={true}
                        className="pb-4"
                    >
                        {agendamentosParaAvaliar.map(ag => (
                            <div key={ag.id} className="px-1 pb-1">
                                <Card className="shadow-xs border border-gray-100 !rounded-xl overflow-hidden">
                                    <Button
                                        type="text"
                                        shape="circle"
                                        icon={<CloseOutlined />}
                                        onClick={() => handleDispensarAvaliacao(ag.id)}
                                        className="!absolute top-2 right-2 z-10 bg-gray-100 hover:!bg-gray-200"
                                        title="Dispensar esta avaliação"
                                    />
                                    <Form
                                        key={ag.id}
                                        onFinish={(values) => onFinishCarouselItem(ag.id, values)}
                                        layout="vertical"
                                    >
                                        <Flex vertical align="center" gap={4} className="text-center mb-4">
                                            <Avatar
                                                size={80}
                                                src={ag.urlFotoArena}
                                                icon={<PictureOutlined />}
                                                className="border-2 border-white shadow-md"
                                            />
                                            <div className='mt-2'>
                                                <Typography.Title level={5} className="!mb-0">
                                                    {ag.arenaName}
                                                </Typography.Title>
                                                <Typography.Text type="secondary">
                                                    {ag.quadraName} - {new Date(ag.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                                </Typography.Text>
                                            </div>
                                        </Flex>
                                        <Divider className="!my-2" />
                                        <div className="px-4 py-2">
                                            <Form.Item
                                                name="nota"
                                                label={<Typography.Text strong>Sua nota</Typography.Text>}
                                                rules={[{ required: true, message: 'Por favor, dê uma nota!' }]}
                                                className="!mb-4 text-center"
                                            >
                                                <Rate className="!text-2xl" />
                                            </Form.Item>
                                            <Form.Item
                                                name="comentario"
                                                label={<Typography.Text strong>Seu comentário (opcional)</Typography.Text>}
                                            >
                                                <Input.TextArea rows={3} placeholder="Como foi sua experiência?" />
                                            </Form.Item>
                                            <Flex justify="end" className="mt-4">
                                                <Button type="primary" htmlType="submit" size="large">
                                                    Enviar Avaliação
                                                </Button>
                                            </Flex>
                                        </div>
                                    </Form>
                                </Card>
                            </div>
                        ))}
                    </Carousel>
                    <Button
                        shape="circle"
                        icon={<LeftOutlined />}
                        onClick={() => carouselRef.current && carouselRef.current.prev()}
                        className="!absolute left-0 top-1/2 -translate-y-1/2 z-10"
                    />
                    <Button
                        shape="circle"
                        icon={<RightOutlined />}
                        onClick={() => carouselRef.current && carouselRef.current.next()}
                        className="!absolute right-0 top-1/2 -translate-y-1/2 z-10"
                    />
                </div>
            )}

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
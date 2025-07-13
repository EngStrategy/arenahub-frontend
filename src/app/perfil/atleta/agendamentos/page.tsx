"use client";
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button, DatePicker, Pagination, Layout, Typography, Row, Col, Flex, Empty, App, Select } from 'antd';
import { CardAgendamento, type AgendamentoCardData } from '@/components/Cards/AgendamentoCard';
import { Dayjs } from 'dayjs';
import { useSession } from 'next-auth/react';
import {
    getAllAgendamentosNormalAtleta,
    cancelarAgendamentoNormal,
    type AgendamentoNormal
} from '@/app/api/entities/agendamento';
import { useTheme } from '@/context/ThemeProvider';
import { ButtonDelete } from '@/components/Buttons/ButtonDelete';

const { Title } = Typography;
const { Content } = Layout;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="h-12 bg-gray-300 rounded-lg col-span-1 lg:col-span-2"></div>
            <div className="h-12 bg-gray-300 rounded-lg col-span-1 lg:col-span-2"></div>
            <div className="h-12 bg-gray-300 rounded-lg col-span-1"></div>
        </div>
        <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => <CardAgendamentoSkeleton key={index} />)}
        </div>
    </main>
);

export default function Agendamentos() {
    const { status: sessionStatus } = useSession();
    const { message } = App.useApp();
    const { isDarkMode } = useTheme();

    const [agendamentos, setAgendamentos] = useState<AgendamentoNormal[]>([]);
    const [loading, setLoading] = useState(true);


    const [dataInicial, setDataInicial] = useState<Dayjs | null>(null);
    const [dataFinal, setDataFinal] = useState<Dayjs | null>(null);
    const [tipoAgendamento, setTipoAgendamento] = useState<'NORMAL' | 'FIXO' | 'AMBOS'>('AMBOS');

    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 16,
        totalElements: 0,
    });

    const fetchAgendamentos = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const params = {
                page: page - 1,
                size: pagination.pageSize,
                sort: 'dataAgendamento',
                direction: "asc" as const,
                dataInicio: dataInicial?.format('YYYY-MM-DD'),
                dataFim: dataFinal?.format('YYYY-MM-DD'),
                tipoAgendamento: tipoAgendamento,
            };

            const response = await getAllAgendamentosNormalAtleta(params);
            setAgendamentos(response.content);
            setPagination(prev => ({
                ...prev,
                currentPage: response.number + 1,
                totalElements: response.totalElements,
            }));

        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error);
            message.error((error as Error)?.message ?? "Não foi possível carregar os agendamentos.", 7);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize, dataInicial, dataFinal, tipoAgendamento, message]);

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            fetchAgendamentos(1);
        }
    }, [dataInicial, dataFinal, tipoAgendamento, sessionStatus, fetchAgendamentos]);

    const handlePageChange = (page: number) => {
        fetchAgendamentos(page);
    };

    const handleLimparFiltro = () => {
        setDataInicial(null);
        setDataFinal(null);
        setTipoAgendamento('AMBOS');
    };

    const handleCancelarAgendamento = async (id: number) => {
        try {
            await cancelarAgendamentoNormal(id);
            message.success("Agendamento cancelado com sucesso!");
            fetchAgendamentos(pagination.currentPage);
        } catch (error) {
            console.error("Erro ao cancelar agendamento:", error);
            message.error((error as Error)?.message ?? "Não foi possível cancelar o agendamento.", 7);
        }
    };

    // Transforma os dados para o card usando o cache
    const agendamentosTransformados = useMemo(() => {
        return agendamentos.map(agendamento => {
            return {
                id: agendamento.id,
                arenaName: agendamento.nomeArena,
                quadraName: agendamento.nomeQuadra,
                localImageUrl: agendamento.urlFotoArena,
                date: agendamento.dataAgendamento,
                startTime: agendamento.horarioInicio,
                endTime: agendamento.horarioFim,
                valor: agendamento.valorTotal,
                status: agendamento.status.toLowerCase() as AgendamentoCardData['status'],
                publico: agendamento.publico,
                fixo: agendamento.fixo,
            };
        });
    }, [agendamentos]);

    if (sessionStatus === 'loading') {
        return <MeusAgendamentosSkeleton />;
    }

    let contentToRender;
    if (loading) {
        contentToRender = (
            <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => <CardAgendamentoSkeleton key={index} />)}
            </div>
        );
    } else if (agendamentosTransformados.length > 0) {
        contentToRender = (
            <>
                <Row gutter={[24, 24]} align="stretch">
                    {agendamentosTransformados.map((agendamento) => (
                        <Col key={agendamento.id} xs={24} md={12} lg={8}>
                            <CardAgendamento
                                agendamento={agendamento}
                                onCancel={handleCancelarAgendamento}
                            />
                        </Col>
                    ))}
                </Row>
                <Flex justify='center' className="!mt-8">
                    <Pagination
                        current={pagination.currentPage}
                        total={pagination.totalElements}
                        pageSize={pagination.pageSize}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </Flex>
            </>
        );
    } else {
        contentToRender = (
            <Empty
                description="Nenhum agendamento encontrado para o período selecionado."
                className="mt-10 p-8 rounded-lg"
            />
        );
    }

    return (
        <Content
            className="!px-4 sm:!px-10 lg:!px-40 !py-8 !flex-1"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
        >
            <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>Meus agendamentos</Title>

            <Row gutter={[24, 24]} align="middle" className="mb-8">
                <Col xs={12} lg={4}>
                    <Select
                        value={tipoAgendamento}
                        onChange={setTipoAgendamento}
                        options={[
                            { label: 'Todos', value: 'AMBOS' },
                            { label: 'Normais', value: 'NORMAL' },
                            { label: 'Fixos', value: 'FIXO' }
                        ]}
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={12} lg={4}>
                    <DatePicker
                        value={dataInicial}
                        onChange={setDataInicial}
                        placeholder="Data inicial"
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        readOnly 
                    />
                </Col>
                <Col xs={12} lg={4}>
                    <DatePicker
                        value={dataFinal}
                        onChange={setDataFinal}
                        placeholder="Data final"
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        readOnly 
                    />
                </Col>
                <Col xs={12} lg={4}>
                    <ButtonDelete
                        text='Limpar filtros'
                        onClick={handleLimparFiltro}
                    />
                </Col>
            </Row>
            {contentToRender}
        </Content>
    );
}
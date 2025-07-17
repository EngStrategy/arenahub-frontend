"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Pagination, Layout, Typography, Row, Col, Flex, Empty, App } from 'antd';
import { JogoAbertoCard } from '@/components/Cards/JogoAbertoCard';
import CitySports from '@/components/CitySports';
import { useSession } from 'next-auth/react';
import { sportIcons } from '@/data/sportIcons';
import { useTheme } from '@/context/ThemeProvider';
import { getAllJogosAbertos, JogosAbertosQueryParams, type JogosAbertos as JogoAbertoAPI } from '@/app/api/entities/jogosAbertos';
import { mapeamentoEsportes } from '@/context/functions/mapeamentoEsportes';
import { TipoQuadra } from '../api/entities/quadra';

const { Title } = Typography;
const { Content } = Layout;

const JogoAbertoCardSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 animate-pulse">
        <div className="bg-gray-300 h-40 w-full rounded-lg"></div>
        <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded-lg mt-4"></div>
    </div>
);
const JogoAbertoSkeleton = () => (
    <div className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
        <div className="h-7 bg-gray-300 rounded-md w-48 mx-auto mb-8 animate-pulse"></div>
        <div className="w-full">
            <div className="mb-8 flex overflow-x-auto whitespace-nowrap space-x-3 pb-3">
                {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="bg-gray-300 h-10 w-28 rounded-full animate-pulse"></div>
                ))}
            </div>
            <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <JogoAbertoCardSkeleton key={index} />
                ))}
            </div>
        </div>
    </div>
);

const friendlyNameToBackendEnum = Object.entries(mapeamentoEsportes).reduce((acc, [key, value]) => {
    acc[value] = key as TipoQuadra;
    return acc;
}, {} as Record<string, TipoQuadra>);

export default function JogosAbertos() {
    const { status: sessionStatus } = useSession();
    const { isDarkMode } = useTheme();
    const { message } = App.useApp();

    const [jogos, setJogos] = useState<JogoAbertoAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSport, setSelectedSport] = useState('');
    const [committedSearchTerm, setCommittedSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 16,
        totalElements: 0,
    });

    const fetchJogosAbertos = useCallback(async (page: number, sport: string, cidade: string) => {
        setLoading(true);
        try {
            const backendSport = sport === 'Todos' ? undefined : friendlyNameToBackendEnum[sport];

            const params = {
                page: page - 1,
                size: pagination.pageSize,
                sort: 'dataAgendamento',
                direction: 'asc',
                cidade: cidade === '' ? undefined : cidade,
                esporte: backendSport,
            };
            const response = await getAllJogosAbertos(params as JogosAbertosQueryParams);

            setJogos(response?.content ?? []);
            setPagination(prev => ({
                ...prev,
                currentPage: (response?.number ?? 0) + 1,
                totalElements: response?.totalElements ?? 0,
            }));
        } catch (error) {
            console.error(
                "Erro ao buscar jogos abertos:",
                error instanceof Error ? error : new Error(String(error))
            );
            message.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar os jogos abertos."
            );
            setJogos([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize, message]);

    useEffect(() => {
        fetchJogosAbertos(pagination.currentPage, selectedSport, committedSearchTerm);
    }, [pagination.currentPage, selectedSport, committedSearchTerm, fetchJogosAbertos]);

    const handleSportChange = (sport: string) => {
        setSelectedSport(sport);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleSearchCommit = (term: string) => {
        setCommittedSearchTerm(term);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const allSports = Object.keys(sportIcons);

    if (sessionStatus === 'loading') {
        return <JogoAbertoSkeleton />;
    }

    let contentToRender;
    if (loading) {
        contentToRender = (
            <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <JogoAbertoCardSkeleton key={index} />
                ))}
            </div>
        );
    } else if (jogos.length > 0) {
        contentToRender = (
            <>
                <Row gutter={[24, 24]} className="mb-10">
                    {jogos.map((jogo) => (
                        <Col key={jogo.agendamentoId} xs={24} sm={12} lg={8}>
                            <JogoAbertoCard jogoAberto={jogo} />
                        </Col>
                    ))}
                </Row>
                {jogos.length > pagination.pageSize && (
                    <Flex justify='center'>
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
        contentToRender = (
            <Empty description="Nenhum jogo aberto encontrado para o esporte selecionado." className="mt-10" />
        );
    }

    return (
        <Content
            className="px-4 sm:px-10 lg:px-40 py-8 flex-1"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
        >
            <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>Jogos abertos</Title>

            <CitySports
                loading={loading}
                selectedSport={selectedSport}
                setSelectedSport={handleSportChange}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSearchCommit={handleSearchCommit}
                setCurrentPage={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                allSports={allSports}
                sportIcons={sportIcons}
            />
            {contentToRender}
        </Content>
    );
}
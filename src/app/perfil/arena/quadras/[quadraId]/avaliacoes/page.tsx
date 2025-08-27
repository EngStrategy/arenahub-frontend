'use client';

import React, { useState, use, useEffect } from 'react';
import { Typography, message, Flex, Empty, Layout, Pagination, Spin, Breadcrumb } from 'antd';
import { HomeOutlined, StarOutlined } from '@ant-design/icons';
import { getQuadraById, getAvaliacoesQuadra, Quadra } from '@/app/api/entities/quadra';
import { AvaliacaoResponse } from '@/app/api/entities/agendamento';
import { useTheme } from '@/context/ThemeProvider';
import AvaliacaoCard from '@/components/Cards/AvaliacaoCard';

const { Title } = Typography;
const { Content } = Layout;

type PageProps = {
    params: Promise<{quadraId: string}>
}

const AvaliacoesPageSkeleton = () => (
    <Content className="!px-4 sm:!px-10 lg:!px-40 !py-8">
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-8 animate-pulse"></div>
        <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4 animate-pulse">
                    <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                </div>
            ))}
        </div>
    </Content>
);


const QuadraAvaliacoesPage = ({ params: paramsPromise }: PageProps) => {
    const params = use(paramsPromise);
    
    const { isDarkMode } = useTheme();
    const quadraId = Number(params.quadraId);

    const [quadra, setQuadra] = useState<Quadra | undefined>(undefined);
    const [avaliacoes, setAvaliacoes] = useState<AvaliacaoResponse[]>([]);
    const [loadingQuadra, setLoadingQuadra] = useState(true);
    const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(true);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 16,
        total: 0,
    });

    useEffect(() => {
        const fetchQuadraData = async () => {
            if (!quadraId) return;
            setLoadingQuadra(true);
            try {
                const quadraData = await getQuadraById(quadraId);
                setQuadra(quadraData);
            } catch (error) {
                console.error("Erro ao buscar dados da quadra:", error);
                message.error('Não foi possível carregar os detalhes da quadra.');
            } finally {
                setLoadingQuadra(false);
            }
        };
        fetchQuadraData();
    }, [quadraId]);

    useEffect(() => {
        const fetchAvaliacoesData = async () => {
            if (!quadraId) return;
            setLoadingAvaliacoes(true);
            try {
                const avaliacaoParams = {
                    page: pagination.current - 1,
                    size: pagination.pageSize,
                    sort: 'dataAvaliacao',
                    direction: 'desc' as const,
                };
                const avaliacoesData = await getAvaliacoesQuadra(quadraId, avaliacaoParams);
                setAvaliacoes(avaliacoesData.content);
                setPagination(prev => ({
                    ...prev,
                    total: avaliacoesData.totalElements,
                }));
            } catch (error) {
                console.error("Erro ao buscar avaliações:", error);
                message.error('Não foi possível carregar as avaliações.');
            } finally {
                setLoadingAvaliacoes(false);
            }
        };
        fetchAvaliacoesData();
    }, [quadraId, pagination.current, pagination.pageSize]);


    const handlePageChange = (page: number, pageSize: number) => {
        setPagination(prev => ({ ...prev, current: page, pageSize }));
    };

    if (loadingQuadra) {
        return <AvaliacoesPageSkeleton />;
    }

    return (
        <Content
            className="!px-4 sm:!px-10 lg:!px-40 !pt-8 !pb-18"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
        >
            <Breadcrumb
                items={[
                    { href: '/dashboard', title: <HomeOutlined /> },
                    { href: '/perfil/arena/quadras', title: 'Minhas Quadras' },
                    { title: <Flex align='center' gap='small'><StarOutlined /> Avaliações</Flex> },
                ]}
                className='!mb-6'
            />

            <Title level={3}>Avaliações da Quadra: {quadra?.nomeQuadra || 'Carregando...'}</Title>

            <Spin spinning={loadingAvaliacoes}>
                <Flex vertical gap="middle">
                    {avaliacoes.length > 0 ? (
                        avaliacoes.map(avaliacao => (
                            <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />
                        ))
                    ) : (
                        <Empty description="Esta quadra ainda não possui avaliações." className="py-10" />
                    )}
                </Flex>
            </Spin>

            {pagination.total > pagination.pageSize && (
                <Flex justify="center" className="!mt-8">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </Flex>
            )}
        </Content>
    );
};

export default QuadraAvaliacoesPage;
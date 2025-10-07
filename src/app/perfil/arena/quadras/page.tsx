'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Select, Typography, Row, Col, message, Flex, Empty, Layout } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CourtCard from '@/components/Cards/CourtCard';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import Link from 'next/link';
import { getQuadraByIdArena, Quadra, TipoQuadra, deleteQuadra } from '@/app/api/entities/quadra';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/hooks/use-auth';

const { Title } = Typography;
const { Content } = Layout;

const CourtCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-300"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
        <div className="h-8 w-8 bg-gray-300 rounded"></div>
        <div className="h-8 w-8 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

const MinhasQuadrasPageSkeleton = () => (
  <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
    <div className="h-8 bg-gray-300 rounded w-48 mb-8 animate-pulse"></div>
    <div className="mb-6 animate-pulse">
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="h-10 bg-gray-300 rounded-md w-full sm:w-52"></div>
        <div className="h-10 bg-gray-300 rounded-md w-full sm:w-48"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map(() => {
        const uniqueKey = Math.random().toString(36).slice(2, 11);
        return <CourtCardSkeleton key={uniqueKey} />;
      })}
    </div>
  </main>
);

const MinhasQuadrasPage: React.FC = () => {
  const { user, isLoadingSession } = useAuth();
  const { isDarkMode } = useTheme();

  const [courts, setCourts] = useState<Quadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('all');

  useEffect(() => {
    const fetchCourts = async () => {
      if (user?.userId) {
        setLoading(true);
        try {
          const arenaData = await getQuadraByIdArena(user.userId);
          let courtsData: Quadra[] = [];
          if (Array.isArray(arenaData)) {
            courtsData = arenaData;
          } else if (arenaData) {
            courtsData = [arenaData];
          }
          setCourts(courtsData);
        } catch (error) {
          console.error('Erro ao buscar quadras:', error);
          message.error('Erro ao carregar quadras.');
        } finally {
          setLoading(false);
        }
      } else if (!isLoadingSession) {
        setLoading(false);
      }
    };

    fetchCourts();
  }, [user, isLoadingSession]);

  const handleDelete = async (id: number) => {
    try {
      await deleteQuadra(id);

      setCourts(prev => prev.filter(court => court.id !== id));
      message.warning('Quadra excluída com sucesso.');
    } catch (error) {
      console.error("Erro ao excluir quadra:", error);
      message.error('Não foi possível excluir a quadra. Tente novamente.');
    }
  };

  const filteredCourts = useMemo(() => {
    return courts.filter(court =>
      sportFilter === 'all' || court.tipoQuadra?.includes(sportFilter as any)
    );
  }, [courts, sportFilter]);

  const sportOptions = useMemo(() => {
    const uniqueSports = Array.from(new Set(courts.flatMap(court => court.tipoQuadra)));
    return uniqueSports.map(sport => ({
      value: sport,
      label: formatarEsporte(sport as TipoQuadra),
    }));
  }, [courts]);

  if (loading || isLoadingSession) {
    return <MinhasQuadrasPageSkeleton />;
  }

  return (
    <Content
      className="!px-4 sm:!px-10 lg:!px-40 !pt-8 !pb-18"
      style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
    >
      <Title level={3}>Minhas quadras</Title>

      <Flex justify="space-between" align="center" gap="middle" wrap="wrap" className="!mb-6">
        <Select
          value={sportFilter}
          style={{ minWidth: 200 }}
          onChange={(value) => setSportFilter(value)}
          options={[
            { value: 'all', label: 'Todos os esportes' },
            ...sportOptions,
          ]}
        />
        <Link href="/perfil/arena/quadras/nova">
          <ButtonPrimary text='Adicionar quadra' icon={<PlusOutlined />} />
        </Link>
      </Flex>

      <Row gutter={[24, 24]}>
        {filteredCourts.map(court => (
          <Col key={court.id} xs={24} sm={12} md={8} xl={6}>
            <CourtCard court={court} onDelete={handleDelete} />
          </Col>
        ))}
      </Row>

      {filteredCourts.length === 0 && !loading && (
        <Empty description="Nenhuma quadra encontrada." className="py-10" />
      )}
    </Content>
  );
};

export default MinhasQuadrasPage;
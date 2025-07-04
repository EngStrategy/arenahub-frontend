'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Select, Typography, Row, Col, Modal, message } from 'antd';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import CourtCard from '@/components/Cards/CourtCard';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getQuadraByIdArena, Quadra } from '@/app/api/entities/quadra';

const { Title } = Typography;
const { confirm } = Modal;

// --- NOVOS SKELETONS COM HTML E TAILWIND ---
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
      {Array.from({ length: 3 }).map((_, index) => (
        <CourtCardSkeleton key={index} />
      ))}
    </div>
  </main>
);
// --- FIM DOS NOVOS SKELETONS ---

const MinhasQuadrasPage: React.FC = () => {
  const { data: session, status } = useSession();

  const [courts, setCourts] = useState<Quadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');

  useEffect(() => {
    const fetchCourts = async () => {
      if (session?.user?.accessToken && session?.user?.userId) {
        setLoading(true); // Garante que o skeleton apareça em re-buscas
        try {
          const arenaData = await getQuadraByIdArena(session.user.userId);
          if (arenaData) {
            setCourts(Array.isArray(arenaData) ? arenaData : [arenaData]);
          } else {
            setCourts([]);
          }
        } catch (error) {
          console.error('Erro ao buscar quadras:', error);
          message.error('Erro ao carregar quadras.');
        } finally {
          setLoading(false);
        }
      } else if (status !== 'loading') {
        setLoading(false);
      }
    };

    fetchCourts();
  }, [session, status]);

  const deleteCourt = (id: number) => {
    setCourts(prev => prev.filter(court => court.id !== id));
    message.success('Quadra excluída.');
  };

  const handleDelete = (id: number) => {
    confirm({
      title: 'Deseja excluir esta quadra?',
      icon: <ExclamationCircleFilled />,
      content: 'A ação não pode ser desfeita.',
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        deleteCourt(id);
      },
    });
  };

  const filteredCourts = useMemo(() => {
    return courts.filter(court => {
      const matchesSearch = court.nomeQuadra.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = sportFilter === 'all' || court.tipoQuadra?.includes(sportFilter as any);
      return matchesSearch && matchesSport;
    });
  }, [courts, searchTerm, sportFilter]);

  if (loading || status === 'loading') {
    return <MinhasQuadrasPageSkeleton />;
  }

  return (
    <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
      <Title level={3}>Minhas quadras</Title>

      <div className="mb-6">
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Select
            value={sportFilter}
            className="w-full sm:w-auto sm:min-w-[200px]"
            onChange={(value) => setSportFilter(value)}
            showSearch
            options={[
              { value: 'all', label: 'Filtrar por esporte' },
              ...Array.from(new Set(courts.flatMap(court => court.tipoQuadra))).map(sport => ({
                value: sport,
                label: sport,
              }))
            ]}
          />
          <Link key="button-nova-quadra" href="/perfil/arena/minhas-quadras/nova">
            <ButtonPrimary
              text='Adicionar quadra'
              type="primary"
              icon={<PlusOutlined />}
              className='w-full sm:w-auto'
            />
          </Link>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {filteredCourts.map(court => (
          <Col key={court.id} xs={24} md={12} xl={8}>
            <CourtCard
              court={court}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>
      {filteredCourts.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-500">
          Nenhuma quadra encontrada.
        </div>
      )}
    </main>
  );
};

export default MinhasQuadrasPage;
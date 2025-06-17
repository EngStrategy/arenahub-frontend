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

const MinhasQuadrasPage: React.FC = () => {
  const { data: session } = useSession();

  const [courts, setCourts] = useState<Quadra[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('all');

  useEffect(() => {
    const fetchCourts = async () => {
      if (session?.user?.accessToken && session?.user?.userId) {
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
        }
      }
    };

    fetchCourts();

  }, [session?.user?.accessToken, session?.user?.userId]);


  const handleEdit = (id: number) => {

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
        setCourts(prev => prev.filter(court => court.id !== id));
        message.success('Quadra excluída.');
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

  return (
    <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
      <Title level={3}>Minhas quadras</Title>

      {/* Barra de Ações */}
      <div className="mb-6">
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Select
            value={sportFilter}
            className="w-full sm:w-auto sm:min-w-[200px]"
            onChange={(value) => setSportFilter(value)}
            showSearch
            options={[
              { value: 'all', label: 'Filtrar por esporte' },
              ...Array.from(
                new Set(
                  courts.flatMap(court => court.tipoQuadra)
                )
              ).map(sport => ({
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

      {/* Grid de Quadras */}
      <Row gutter={[24, 24]}>
        {filteredCourts.map(court => (
          <Col key={court.id} xs={24} md={12} xl={8}>
            <CourtCard
              court={court}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>
      {filteredCourts.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Nenhuma quadra encontrada.
        </div>
      )}
    </main>
  );
};

export default MinhasQuadrasPage;
"use client";

import React, { useState, useEffect } from 'react';
import { Col, Flex, Pagination, Row } from 'antd';
import { ArenaCard } from '@/components/Cards/ArenaCard';
import { sportIcons } from '@/data/sportIcons';
import { type Arena, getAllArenas, type ArenaQueryParams } from '@/app/api/entities/arena';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CitySports from '@/components/CitySports';
import { useTheme } from '@/context/ThemeProvider';

const ArenaCardSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 flex flex-col animate-pulse">
    <div className="bg-gray-300 h-40 w-full"></div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-300 rounded w-3/5"></div>
      <div className="h-4 bg-gray-300 rounded w-4/5"></div>
    </div>
  </div>
);

const sportNameToBackendEnum: { [key: string]: ArenaQueryParams['esporte'] } = {
  'Futebol society': 'FUTEBOL_SOCIETY',
  'Futebol Sete': 'FUTEBOL_SETE',
  'Futebol 11': 'FUTEBOL_ONZE',
  'Futsal': 'FUTSAL',
  'Beach Tennis': 'BEACHTENNIS',
  'Vôlei': 'VOLEI',
  'Futevôlei': 'FUTEVOLEI',
  'Basquete': 'BASQUETE',
  'Handebol': 'HANDEBOL',
};

export default function HomePage() {
  const { status } = useSession();
  const { isDarkMode } = useTheme();


  const [selectedSport, setSelectedSport] = useState('Todos');
  const [committedSearchTerm, setCommittedSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 16;

  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalArenas, setTotalArenas] = useState(0);

  const isLoadingSession = status === "loading";

  useEffect(() => {
    const fetchArenas = async () => {
      setLoading(true);
      try {
        const backendSport = selectedSport === 'Todos' ? undefined : sportNameToBackendEnum[selectedSport];

        const response = await getAllArenas({
          page: currentPage - 1,
          size: pageSize,
          esporte: backendSport,
          cidade: committedSearchTerm === '' ? undefined : committedSearchTerm,
        });

        setArenas(response?.content || []);
        setTotalArenas(response?.totalElements ?? 0);
      } catch (error) {
        console.error("Erro ao buscar arenas:", error);
        setArenas([]);
        setTotalArenas(0);
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchArenas();
    }

  }, [currentPage, selectedSport, committedSearchTerm, status]);

  const handleSearchCommit = () => {
    setCommittedSearchTerm(inputValue);
    setCurrentPage(1);
  };

  const allSports = ['Todos', ...Object.keys(sportIcons)];

  const isPageLoading = loading || isLoadingSession;

  let content: React.ReactNode;
  if (isPageLoading) {
    content = (
      <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ArenaCardSkeleton key={index} />
        ))}
      </div>
    );
  } else if (arenas.length > 0) {
    content = (
      <>
        <Row gutter={[24, 24]} className="mb-10">
          {arenas.map((arena) => (
            <Col key={arena.id} xs={24} sm={24} lg={12}>
              <Link href={`/quadras/${arena.id}`} passHref>
                <ArenaCard
                  arena={{
                    ...arena,
                    avaliacao: arena.avaliacao ?? 1.0,
                    numeroAvaliacoes: arena.numeroAvaliacoes ?? 10,
                  }}
                  showDescription={false}
                />
              </Link>
            </Col>
          ))}
        </Row>
        <Flex justify='center'>
          <Pagination
            current={currentPage}
            total={totalArenas}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </Flex>
      </>
    );
  } else {
    content = (
      <div className="text-center py-10 text-gray-500">
        Nenhuma arena encontrada.
      </div>
    );
  }

  return (
    <Flex
      vertical
      className={`!px-4 sm:!px-10 lg:!px-40 !py-8 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}
    >
      <div className="w-full">
        <CitySports
          loading={isPageLoading}
          selectedSport={selectedSport}
          setSelectedSport={setSelectedSport}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSearchCommit={handleSearchCommit}
          setCurrentPage={setCurrentPage}
          allSports={allSports}
          sportIcons={sportIcons}
        />
        {content}
      </div>
    </Flex>
  );
};
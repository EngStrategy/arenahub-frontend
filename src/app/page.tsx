"use client";

import React, { useState } from 'react';
import { Pagination } from 'antd';
import { ArenaCard } from '@/components/ArenaCard';
import { sportIcons } from '@/data/sportIcons';
import { Arena, getAllArenas } from './api/entities/arena';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CitySports from '@/components/CitySports';

export default function HomePage() {
  const { data: session } = useSession();

  const [selectedSport, setSelectedSport] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 16;

  const [arenas, setArenas] = useState<Arena[]>([]);

  React.useEffect(() => {
    const fetchArenas = async () => {
      try {
        const response = await getAllArenas(
          session?.user.accessToken ?? '',
          {
            currentPage,
            pageSize,
          }
        );
        setArenas(response?.content || []);
      } catch (error) {
        console.error("Erro ao buscar arenas:", error);
      }
    };
    fetchArenas();
  }, [currentPage, pageSize, session?.user.accessToken]);

  const filteredArenas = arenas.filter(arena => {
    const matchesSport = selectedSport === 'Todos' || arena.sports?.includes(selectedSport);
    const matchesSearch = searchTerm === '' || arena.endereco.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSport && matchesSearch;
  });

  const paginatedArenas = filteredArenas.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const allSports = ['Todos', ...Object.keys(sportIcons)];

  return (
    <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
      <div className="w-full">
        <CitySports
          selectedSport={selectedSport}
          setSelectedSport={setSelectedSport}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setCurrentPage={setCurrentPage}
          allSports={allSports}
          sportIcons={sportIcons}
        />

        {/* Arena Listing */}
        {paginatedArenas.length > 0 ? (
          <>
            <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {paginatedArenas.map((arena) => (
                <Link key={arena.id} href={`/quadras-page/${arena.id}`} passHref>
                  <ArenaCard
                    arena={{
                      ...arena,
                      sports: arena.sports || ["Futebol Society", "Vôlei", "Beach Tennis", "Basquete",],
                      avaliacao: arena.avaliacao ?? 1.0,
                      numeroAvaliacoes: arena.numeroAvaliacoes ?? 10,
                    }}
                    showDescription={false}
                  />
                </Link>
              ))}
            </div>

            <div className='flex justify-center'>
              <Pagination
                current={currentPage}
                total={filteredArenas.length}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Nenhuma arena encontrada com os filtros aplicados.
          </div>
        )}
      </div>
    </main>
  );
};
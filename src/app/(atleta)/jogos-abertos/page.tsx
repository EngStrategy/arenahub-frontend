"use client";

import React, { useState } from 'react';
import { sportIcons } from '@/data/sportIcons';
import { Pagination } from 'antd';
import { JogoAbertoCard } from '@/components/Cards/JogoAbertoCard';
import CitySports from '@/components/CitySports';
import { useSession } from 'next-auth/react';

type JogoAberto = {
    id: string;
    arenaName: string;
    quadraName: string;
    localImageUrl?: string;
    date: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    sport: string;
    vagasDisponiveis: number;
};

const jogosAbertos: JogoAberto[] = [
    { id: '1', arenaName: 'Resenha', quadraName: 'Campo Leste 2', localImageUrl: '/images/arena1.png', date: '2023-10-01', startTime: '10:00', endTime: '11:00', durationHours: 1, sport: 'Futebol society', vagasDisponiveis: 5 },
    { id: '2', arenaName: 'Arena João Garcia', quadraName: 'Quadra Sul 1', localImageUrl: '/images/arenaGarcia.png', date: '2023-02-02', startTime: '14:00', endTime: '15:00', durationHours: 1, sport: 'Basquete', vagasDisponiveis: 3 },
    { id: '3', arenaName: 'MR Sports', quadraName: 'Campo Principal', localImageUrl: '/images/arenaTennis.png', date: '2023-09-03', startTime: '16:00', endTime: '17:00', durationHours: 1, sport: 'Vôlei', vagasDisponiveis: 2 },
    { id: '4', arenaName: 'Arena Wilson', quadraName: 'Quadra Norte 4', localImageUrl: '/images/arenaWilson.png', date: '2023-08-04', startTime: '18:00', endTime: '19:00', durationHours: 1, sport: 'Handebol', vagasDisponiveis: 4 },
    { id: '5', arenaName: 'Arena Júnior Bocão', quadraName: 'Campo Oeste 5', localImageUrl: '/images/arena1.png', date: '2023-01-05', startTime: '20:00', endTime: '21:00', durationHours: 1, sport: 'Futsal', vagasDisponiveis: 6 },
    { id: '6', arenaName: 'Arena do Esporte', quadraName: 'Quadra Central 3', localImageUrl: '/images/arenaFaustinoGreen.png', date: '2023-07-06', startTime: '12:00', endTime: '13:00', durationHours: 1, sport: 'Futebol 11', vagasDisponiveis: 8 },
    { id: '7', arenaName: 'Arena Beach Sports', quadraName: 'Quadra Praia 1', localImageUrl: '/images/arenaesportes.png', date: '2023-06-07', startTime: '15:00', endTime: '16:00', durationHours: 1, sport: 'Futebol de areia', vagasDisponiveis: 10 },
    { id: '8', arenaName: 'Arena do Vôlei', quadraName: 'Quadra Sul 2', localImageUrl: '/images/arenaFaustinoBlack.png', date: '2023-05-08', startTime: '17:00', endTime: '18:00', durationHours: 1, sport: 'Beach Tennis', vagasDisponiveis: 7 },
];

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


export default function JogosAbertos() {
    const { status } = useSession();
    const [selectedSport, setSelectedSport] = useState('Todos');
    const filteredJogos = jogosAbertos.filter(jogo =>
        selectedSport === 'Todos' || jogo.sport === selectedSport
    );

    const allSports = ['Todos', ...Object.keys(sportIcons)];

    if (status === 'loading') {
        return (
            <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
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
            </main>
        )
    }

    return (
        <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
            <h1 className='text-lg text-center mb-8'>Jogos abertos</h1>
            <div className="w-full">
                <CitySports
                    selectedSport={selectedSport}
                    setSelectedSport={setSelectedSport}
                    searchTerm=""
                    setSearchTerm={() => { }}
                    setCurrentPage={() => { }}
                    allSports={allSports}
                    sportIcons={sportIcons}
                />

                {filteredJogos.length > 0 ? (
                    <>
                        <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJogos.map((jogo) => (
                                <JogoAbertoCard key={jogo.id} jogoAberto={jogo} />
                            ))}
                        </div>

                        <div className='flex justify-center'>
                            <Pagination
                                total={filteredJogos.length}
                                showSizeChanger={false}
                                showQuickJumper={false}
                                defaultPageSize={10}
                                defaultCurrent={1}
                            />
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500 mt-10">
                        Nenhum jogo encontrado para o esporte selecionado.
                    </div>
                )}
            </div>
        </main>
    )
}
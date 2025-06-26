"use client";

import React, { useState } from 'react';
import { sportIcons } from '@/data/sportIcons';
import { Pagination } from 'antd';
import { JogoAbertoCard } from '@/components/JogoAbertoCard';
import CitySports from '@/components/CitySports';

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
    {
        id: '1',
        arenaName: 'Resenha',
        quadraName: 'Campo Leste 2',
        localImageUrl: '/arena1.png',
        date: '2023-10-01',
        startTime: '10:00',
        endTime: '11:00',
        durationHours: 1,
        sport: 'Futebol society',
        vagasDisponiveis: 5,
    },
    {
        id: '2',
        arenaName: 'Arena João Garcia',
        quadraName: 'Quadra Sul 1',
        localImageUrl: '/arenaGarcia.png',
        date: '2023-02-02',
        startTime: '14:00',
        endTime: '15:00',
        durationHours: 1,
        sport: 'Basquete',
        vagasDisponiveis: 3,
    },
    {
        id: '3',
        arenaName: 'MR Sports',
        quadraName: 'Campo Principal',
        localImageUrl: '/arenaTennis.png',
        date: '2023-09-03',
        startTime: '16:00',
        endTime: '17:00',
        durationHours: 1,
        sport: 'Vôlei',
        vagasDisponiveis: 2,
    },
    {
        id: '4',
        arenaName: 'Arena Wilson',
        quadraName: 'Quadra Norte 4',
        localImageUrl: '/arenaWilson.png',
        date: '2023-08-04',
        startTime: '18:00',
        endTime: '19:00',
        durationHours: 1,
        sport: 'Handebol',
        vagasDisponiveis: 4,
    },
    {
        id: '5',
        arenaName: 'Arena Júnior Bocão',
        quadraName: 'Campo Oeste 5',
        localImageUrl: '/arena1.png',
        date: '2023-01-05',
        startTime: '20:00',
        endTime: '21:00',
        durationHours: 1,
        sport: 'Futsal',
        vagasDisponiveis: 6,
    },
    {
        id: '6',
        arenaName: 'Arena do Esporte',
        quadraName: 'Quadra Central 3',
        localImageUrl: '/arenaFaustinoGreen.png',
        date: '2023-07-06',
        startTime: '12:00',
        endTime: '13:00',
        durationHours: 1,
        sport: 'Futebol 11',
        vagasDisponiveis: 8,
    },
    {
        id: '7',
        arenaName: 'Arena Beach Sports',
        quadraName: 'Quadra Praia 1',
        localImageUrl: '/arenaesportes.png',
        date: '2023-06-07',
        startTime: '15:00',
        endTime: '16:00',
        durationHours: 1,
        sport: 'Futebol de areia',
        vagasDisponiveis: 10,
    },
    {
        id: '8',
        arenaName: 'Arena do Vôlei',
        quadraName: 'Quadra Sul 2',
        localImageUrl: '/arenaFaustinoBlack.png',
        date: '2023-05-08',
        startTime: '17:00',
        endTime: '18:00',
        durationHours: 1,
        sport: 'Beach Tennis',
        vagasDisponiveis: 7,
    },
];


export default function JogosAbertos() {
    const [selectedSport, setSelectedSport] = useState('Todos');

    const filteredJogos = jogosAbertos.filter(jogo =>
        selectedSport === 'Todos' || jogo.sport === selectedSport
    );

    const allSports = ['Todos', ...Object.keys(sportIcons)];

    return (
        <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
            <h1 className='text-lg text-center mb-8'>Jogos abertos</h1>
            <div className="w-full">
                <CitySports
                    selectedSport={selectedSport}
                    setSelectedSport={setSelectedSport}
                    searchTerm=""
                    setSearchTerm={() => { }}
                    // currentPage={1}
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

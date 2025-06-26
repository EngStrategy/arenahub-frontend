"use client";

import React, { useState } from 'react';
import { Button, DatePicker, Pagination } from 'antd';
import { CardAgendamento } from '@/components/AgendamentoCard';
import dayjs, { Dayjs } from 'dayjs';

type Agendamento = {
    id: string;
    arenaName: string;
    quadraName: string;
    localImageUrl?: string;
    date: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    valor: number;
    status: 'pendente' | 'solicitado' | 'aceito' | 'ausente';
};

const meusAgendamentos: Agendamento[] = [
    {
        id: '1',
        arenaName: 'Arena A',
        quadraName: 'Campo 1',
        date: '2025-06-18',
        startTime: '18:00',
        endTime: '19:00',
        durationHours: 1,
        valor: 100,
        status: 'pendente',
    },
    {
        id: '2',
        arenaName: 'Arena B',
        quadraName: 'Quadra Central',
        date: '2025-06-20',
        startTime: '18:00',
        endTime: '19:00',
        durationHours: 1,
        valor: 120,
        status: 'solicitado',
    },
    {
        id: '3',
        arenaName: 'Arena A',
        quadraName: 'Campo 2',
        date: '2025-06-22',
        startTime: '18:00',
        endTime: '19:00',
        durationHours: 1,
        valor: 100,
        status: 'aceito',
    },
    {
        id: '4',
        arenaName: 'Arena C',
        quadraName: 'Campo Principal',
        date: '2025-05-10',
        startTime: '18:00',
        endTime: '19:00',
        durationHours: 1,
        valor: 90,
        status: 'ausente',
    },
];

export default function MeusAgendamentos() {
    const [dataInicial, setDataInicial] = useState<Dayjs | null>(null);
    const [dataFinal, setDataFinal] = useState<Dayjs | null>(null);
    const [agendamentosFiltrados, setAgendamentosFiltrados] = useState(meusAgendamentos);

    const handleAplicarFiltro = () => {
        const filtered = meusAgendamentos.filter(agendamento => {
            const dataAgendamento = dayjs(agendamento.date);
            const isAfterStart = !dataInicial || dataAgendamento.isAfter(dataInicial.startOf('day')) || dataAgendamento.isSame(dataInicial.startOf('day'));
            const isBeforeEnd = !dataFinal || dataAgendamento.isBefore(dataFinal.endOf('day')) || dataAgendamento.isSame(dataFinal.endOf('day'));
            return isAfterStart && isBeforeEnd;
        });
        setAgendamentosFiltrados(filtered);
    };

    const handleLimparFiltro = () => {
        setDataInicial(null);
        setDataFinal(null);
        setAgendamentosFiltrados(meusAgendamentos);
    };

    return (
        <main className="bg-gray-50 px-4 sm:px-10 lg:px-40 py-8 flex-1">
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Meus agendamentos</h1>
                <p className="text-gray-600 mb-6">Escolha o período que deseja filtrar</p>
                
    
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <DatePicker 
                        value={dataInicial} 
                        onChange={setDataInicial} 
                        placeholder="Data inicial" 
                        className="w-full" 
                        size="large"
                    />
                    <DatePicker 
                        value={dataFinal} 
                        onChange={setDataFinal} 
                        placeholder="Data final" 
                        className="w-full" 
                        size="large"
                    />
                    <Button 
                        type="primary" 
                        size="large" 
                        className="w-full !bg-green-600 hover:!bg-green-700 !border-green-600"
                        onClick={handleAplicarFiltro}
                    >
                        Aplicar filtro
                    </Button>
                    <Button 
                        type="primary" 
                        danger
                        size="large"
                        className="w-full" 
                        onClick={handleLimparFiltro}
                    >
                        Limpar filtro
                    </Button>
                </div>

                <p className="text-gray-700 mb-6 font-semibold">
                    {agendamentosFiltrados.length} agendamento(s) encontrado(s)
                </p>

                {agendamentosFiltrados.length > 0 ? (
                    <>
                        <div className="w-full mb-10 flex flex-col gap-4">
                            {agendamentosFiltrados.map((agendamento) => (
                                <CardAgendamento key={agendamento.id} agendamento={agendamento} />
                            ))}
                        </div>
                        <div className='flex justify-center'>
                            <Pagination 
                                total={agendamentosFiltrados.length} 
                                showSizeChanger={false} 
                                defaultPageSize={5} 
                            />
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500 mt-10 bg-white p-8 rounded-lg border">
                        Nenhum agendamento encontrado para o período selecionado.
                    </div>
                )}
            </div>
        </main>
    );
}
"use client";

import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Pagination } from 'antd';
import { CardAgendamento } from '@/components/Cards/AgendamentoCard';
import dayjs, { Dayjs } from 'dayjs';
import { useSession } from 'next-auth/react';

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
    status: 'pendente' | 'solicitado' | 'aceito' | 'ausente' | 'cancelado' | 'pago';
};

const meusAgendamentos: Agendamento[] = [
    { id: '1', arenaName: 'Arena A', quadraName: 'Campo 1', date: '2025-06-18', startTime: '08:00', endTime: '08:30', durationHours: 0.5, valor: 100, status: 'pendente' },
    { id: '2', arenaName: 'Arena B', quadraName: 'Quadra Central', date: '2025-06-20', startTime: '18:00', endTime: '19:00', durationHours: 1, valor: 120, status: 'solicitado' },
    { id: '3', arenaName: 'Arena C', quadraName: 'Campo 2', date: '2025-06-22', startTime: '22:00', endTime: '23:00', durationHours: 1, valor: 100, status: 'aceito' },
    { id: '4', arenaName: 'Arena D', quadraName: 'Campo Principal', date: '2025-05-10', startTime: '10:00', endTime: '11:00', durationHours: 1, valor: 90, status: 'ausente' },
    { id: '5', arenaName: 'Arena Júnior Bocão', quadraName: 'Quadra 3', date: '2025-05-15', startTime: '16:00', endTime: '18:00', durationHours: 2, valor: 110, status: 'cancelado' },
    { id: '6', arenaName: 'Arena F', quadraName: 'Quadra 4', date: '2025-05-20', startTime: '20:00', endTime: '21:00', durationHours: 1, valor: 130, status: 'pago' },
];

const CardAgendamentoSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
        <div className="h-40 bg-gray-300"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                <div className="h-8 bg-gray-300 rounded-md w-1/4"></div>
            </div>
        </div>
    </div>
);

const MeusAgendamentosSkeleton = () => (
    <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1 animate-pulse">
        <div className="h-7 bg-gray-300 rounded-md w-56 mx-auto mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="h-12 bg-gray-300 rounded-lg col-span-1 lg:col-span-2"></div>
            <div className="h-12 bg-gray-300 rounded-lg col-span-1 lg:col-span-2"></div>
            <div className="h-12 bg-gray-300 rounded-lg col-span-1"></div>
        </div>
        <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <CardAgendamentoSkeleton key={index} />
            ))}
        </div>
    </main>
);

export default function MeusAgendamentos() {
    const { status} = useSession();
    const [dataInicial, setDataInicial] = useState<Dayjs | null>(null);
    const [dataFinal, setDataFinal] = useState<Dayjs | null>(null);
    const [agendamentosFiltrados, setAgendamentosFiltrados] = useState(meusAgendamentos);

    useEffect(() => {
        const filtered = meusAgendamentos.filter(agendamento => {
            const dataAgendamento = dayjs(agendamento.date);
            const isAfterStart = !dataInicial || dataAgendamento.isAfter(dataInicial.startOf('day')) || dataAgendamento.isSame(dataInicial.startOf('day'));
            const isBeforeEnd = !dataFinal || dataAgendamento.isBefore(dataFinal.endOf('day')) || dataAgendamento.isSame(dataFinal.endOf('day'));
            return isAfterStart && isBeforeEnd;
        });
        setAgendamentosFiltrados(filtered);
    }, [dataInicial, dataFinal]);

    const handleLimparFiltro = () => {
        setDataInicial(null);
        setDataFinal(null);
        setAgendamentosFiltrados(meusAgendamentos);
    };

    if (status === 'loading') {
        return <MeusAgendamentosSkeleton />;
    }

    return (
        <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
            <h1 className="text-lg text-center mb-8 text-gray-800">Meus agendamentos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <DatePicker
                    value={dataInicial}
                    onChange={setDataInicial}
                    placeholder="Data inicial"
                    className="w-full lg:col-span-2"
                    size="large"
                />
                <DatePicker
                    value={dataFinal}
                    onChange={setDataFinal}
                    placeholder="Data final"
                    className="w-full lg:col-span-2"
                    size="large"
                />
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
            {agendamentosFiltrados.length > 0 ? (
                <>
                    <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </main>
    );
}
"use client";

import React, { useState } from 'react';
import { PictureOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { App, Avatar, Flex, Popconfirm, Tooltip, Typography } from 'antd';
import ModalSolicitacoesEntrada from '../Modais/ModalSolicitacoesEntrada';
import { type Solicitacao } from '@/app/api/entities/solicitacao';
import { getSolicitacoesPorAgendamento, aceitarSolicitacao, recusarSolicitacao } from '@/app/api/entities/solicitacao';

const statusMap = {
    pendente: { text: 'Pendente', className: 'bg-sky-100 text-sky-500' },
    solicitado: { text: 'Solicitado', className: 'bg-gray-100 text-gray-500' },
    aceito: { text: 'Aceito', className: 'bg-green-100 text-green-500' },
    ausente: { text: 'Ausente', className: 'bg-red-100 text-red-500' },
    cancelado: { text: 'Cancelado', className: 'bg-red-100 text-red-500' },
    pago: { text: 'Pago', className: 'bg-green-100 text-green-500' },
};

export type AgendamentoCardData = {
    id: number;
    arenaName: string;
    quadraName: string;
    localImageUrl?: string;
    date: string;
    startTime: string;
    endTime: string;
    valor: number;
    status: keyof typeof statusMap;
    numeroJogadoresNecessarios?: number;
    publico: boolean;
    fixo: boolean;
};

type CardProps = {
    readonly agendamento: AgendamentoCardData;
    readonly onCancel: (id: number) => Promise<void>;
};

const formatarDataAmigavel = (dateString: string) => {
    const data = new Date(dateString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export function CardAgendamento({ agendamento, onCancel }: CardProps) {
    const { message } = App.useApp();
    const statusInfo = statusMap[agendamento.status] || statusMap.pendente;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(false);

    const valorFormatado = agendamento.valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    const handleConfirmCancel = async () => {
        await onCancel(agendamento.id);
    };

    const handleOpenModal = async () => {
        setIsModalOpen(true);
        setLoadingSolicitacoes(true);
        try {
            const data = await getSolicitacoesPorAgendamento(agendamento.id);
            setSolicitacoes(data);
        } catch (error) {
            message.error("Erro ao buscar solicitações.");
            console.error("Erro ao buscar solicitações:", error);
        } finally {
            setLoadingSolicitacoes(false);
        }
    };

    const handleAcceptRequest = async (solicitacaoId: number) => {
        try {
            await aceitarSolicitacao(solicitacaoId);
            message.success("Solicitação aceita!");

            setSolicitacoes(prev => prev.filter(s => s.id !== solicitacaoId));
        } catch (error) {
            message.error("Falha ao aceitar solicitação.");
            console.error("Erro ao aceitar solicitação:", error);
            return;
        }
    };

    const handleDeclineRequest = async (solicitacaoId: number) => {
        try {
            await recusarSolicitacao(solicitacaoId);
            message.info("Solicitação recusada.");

            setSolicitacoes(prev => prev.filter(s => s.id !== solicitacaoId));
        } catch (error) {
            message.error("Falha ao recusar solicitação.");
            console.error("Erro ao recusar solicitação:", error);
            return;
        }
    };

    const DataNaAcao = () => {
        const data = new Date(agendamento.date + 'T00:00:00');
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = data.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
        const ano = data.getFullYear();

        return (
            <div className="w-16 text-center">
                <p className="text-lg font-bold">{dia}</p>
                <p className="text-sm uppercase text-gray-500 font-semibold">{mes}</p>
                <p className="text-sm text-gray-500 font-semibold">{ano}</p>
            </div>
        );
    };

    const AcoesDoCard = () => {
        // Ação de cancelar é possível para status 'PENDENTE'
        if (agendamento.status === 'pendente') {
            return (
                <>
                    <Tooltip title="Cancelar agendamento" placement="top">
                        <Popconfirm
                            title="Cancelar Agendamento"
                            description="Você tem certeza que quer cancelar?"
                            icon={null}
                            okText="Sim"
                            cancelText="Não"
                            okButtonProps={{ type: 'text', className: '!bg-red-500 !text-white' }}
                            cancelButtonProps={{ type: 'text', className: '!text-gray-600' }}
                            onConfirm={handleConfirmCancel}
                        >
                            <button
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 
                                text-red-500 hover:bg-red-200 transition-colors cursor-pointer"
                                aria-label="Cancelar agendamento"
                            >
                                <DeleteOutlined style={{ fontSize: '20px' }} />
                            </button>
                        </Popconfirm>
                    </Tooltip>

                    {agendamento.publico && (
                        <Tooltip title="Solicitações" placement="bottom">
                            <button
                                className="relative flex h-10 w-10 items-center justify-center rounded-lg 
                                bg-green-100 text-green-500 hover:bg-green-200 transition-colors cursor-pointer"
                                aria-label="Ver solicitações"
                                onClick={handleOpenModal}
                            >
                                <UserAddOutlined style={{ fontSize: '20px' }} />
                            </button>
                        </Tooltip>
                    )}
                </>
            );
        }

        // Para outros status, mostra a data
        if (['ausente', 'cancelado', 'pago'].includes(agendamento.status)) {
            return <DataNaAcao />;
        }

        // Para status sem ação como 'aceito', 'solicitado', etc.
        return <div className="w-16" />;
    };

    return (
        <>
            <Flex align='center' className="h-full gap-4 rounded-lg border border-gray-200 !p-3 shadow-sm">
                <Flex vertical align='center' justify='start' className="text-center w-24">
                    {agendamento.localImageUrl ? (
                        <Avatar shape="circle" size={80} src={agendamento.localImageUrl || undefined}
                            icon={<PictureOutlined />} />
                    ) : (
                        <PictureOutlined className='text-6xl text-gray-300' />
                    )}
                    <p className="mt-2 font-semibold text-gray-800 text-sm break-words">{agendamento.arenaName}</p>
                </Flex>

                <div className="w-px self-stretch bg-gray-200" />
                <div className="flex-grow space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{
                        !['ausente', 'cancelado', 'pago'].includes(agendamento.status)
                        && formatarDataAmigavel(agendamento.date)
                    }</p>
                    <p className="text-sm text-gray-600">
                        {agendamento.startTime} às {agendamento.endTime}
                    </p>
                    <p className="text-sm text-gray-600">{agendamento.quadraName}</p>
                    <p className={`font-bold text-lg ${['ausente', 'cancelado'].includes(agendamento.status)
                        ? 'text-gray-400 line-through'
                        : 'text-green-600'}`}>
                        {valorFormatado}
                    </p>
                    <div className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusInfo.className}`}>
                        {statusInfo.text}
                    </div>
                </div>

                <div className="ml-auto flex flex-col items-center justify-center gap-2">
                    <AcoesDoCard />
                </div>
            </Flex>
            
            <ModalSolicitacoesEntrada
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                loading={loadingSolicitacoes}
                solicitacoes={solicitacoes}
                vagasDisponiveis={agendamento.numeroJogadoresNecessarios || 0}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
            />
        </>
    );
}
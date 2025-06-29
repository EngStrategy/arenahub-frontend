

import { PictureOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { App, Popconfirm, Tooltip } from 'antd';
import Image from 'next/image';
import React from 'react';


const formatarDataAmigavel = (dateString: string) => {
    const data = new Date(dateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
    return data.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};


const statusMap = {
    pendente: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    solicitado: { text: 'Solicitado', className: 'bg-blue-100 text-blue-800' },
    aceito: { text: 'Aceito', className: 'bg-green-100 text-green-800' },
    ausente: { text: 'Ausente', className: 'bg-red-100 text-red-800' },
};

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

type CardProps = {
    readonly agendamento: Agendamento;
};

export function CardAgendamento({ agendamento }: CardProps) {
    const { notification } = App.useApp();
    const statusInfo = statusMap[agendamento.status];

   
    const valorFormatado = agendamento.valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    const AcoesDoCard = () => {
        switch (agendamento.status) {
            case 'pendente':
                return (
                    <>
                        <Tooltip title="Cancelar agendamento">
                            <Popconfirm
                                title="Cancelar Agendamento"
                                description="Você tem certeza que quer cancelar?"
                                okText="Sim"
                                cancelText="Não"
                                onConfirm={() => console.log("Agendamento cancelado:", agendamento.id)} 
                            >
                                <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                                    <DeleteOutlined style={{ fontSize: '20px' }} />
                                </button>
                            </Popconfirm>
                        </Tooltip>
                        <Tooltip title="Convidar amigo">
                            <button className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-500 hover:bg-green-200 transition-colors">
                                <UserAddOutlined style={{ fontSize: '20px' }} />
                                {/* Notificação em ponto vermelho */}
                                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-600" />
                            </button>
                        </Tooltip>
                    </>
                );
            case 'aceito':
                return (
                     <Tooltip title="Cancelar agendamento">
                        <Popconfirm
                            title="Cancelar Agendamento"
                            description="Você tem certeza que quer cancelar?"
                            okText="Sim"
                            cancelText="Não"
                            onConfirm={() => console.log("Agendamento cancelado:", agendamento.id)}
                        >
                            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                                <DeleteOutlined style={{ fontSize: '20px' }} />
                            </button>
                        </Popconfirm>
                    </Tooltip>
                );
            case 'ausente':
                 return (
                    <div className="text-center font-bold">
                        <p className="text-sm">{new Date(agendamento.date + 'T00:00:00').getDate()}</p>
                        <p className="text-xs uppercase">{new Date(agendamento.date + 'T00:00:00').toLocaleString('pt-BR', { month: 'short' })}</p>
                        <p className="text-xs">{new Date(agendamento.date + 'T00:00:00').getFullYear()}</p>
                    </div>
                );
            default:
                return null; 
        }
    };


    return (
        <div className="flex w-full items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {/* Coluna da Esquerda: Imagem e Nome */}
            <div className="flex flex-col items-center text-center w-24">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400 overflow-hidden">
                    {agendamento.localImageUrl ? (
                        <Image
                            src={agendamento.localImageUrl}
                            alt={`Logo de ${agendamento.arenaName}`}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <PictureOutlined style={{ fontSize: '24px' }} />
                    )}
                </div>
                <p className="mt-2 font-semibold text-gray-800 text-sm break-words">
                    {agendamento.arenaName}
                </p>
            </div>

            {/* Coluna Central: Detalhes do Agendamento */}
            <div className="flex-grow space-y-1">
                <p className="text-sm font-medium text-gray-800">{formatarDataAmigavel(agendamento.date)}</p>
                <p className="text-sm text-gray-600">
                    {agendamento.startTime} às {agendamento.endTime} ({agendamento.durationHours}h)
                </p>
                <p className="text-sm text-gray-600">{agendamento.quadraName}</p>
               <p className={`font-bold text-lg ${agendamento.status === 'ausente' ? 'text-gray-500 line-through' : 'text-green-600'}`}>
                    {valorFormatado}
                </p>
                
                {/* Badge de Status */}
                <div className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusInfo.className}`}>
                    {statusInfo.text}
                </div>
            </div>

            {/* Coluna da Direita: Ações */}
            <div className="ml-auto flex flex-col items-center gap-2">
                <AcoesDoCard />
            </div>
        </div>
    )
}
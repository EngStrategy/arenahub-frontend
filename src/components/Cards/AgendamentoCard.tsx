import React from 'react';
import { PictureOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { App, Flex, Popconfirm, Tooltip } from 'antd';
import Image from 'next/image';

const statusMap = {
    pendente: { text: 'Pendente', className: 'bg-sky-100 text-sky-500' },
    solicitado: { text: 'Solicitado', className: 'bg-gray-100 text-gray-500' },
    aceito: { text: 'Aceito', className: 'bg-green-100 text-green-500' },
    ausente: { text: 'Ausente', className: 'bg-red-100 text-red-500' },
    cancelado: { text: 'Cancelado', className: 'bg-red-100 text-red-500' },
    pago: { text: 'Pago', className: 'bg-green-100 text-green-500' },
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
    status: 'pendente' | 'solicitado' | 'aceito' | 'ausente' | 'cancelado' | 'pago';
};

type CardProps = {
    readonly agendamento: Agendamento;
};

const formatarDataAmigavel = (dateString: string) => {
    const data = new Date(dateString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export function CardAgendamento({ agendamento }: CardProps) {
    const statusInfo = statusMap[agendamento.status];

    const valorFormatado = agendamento.valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    const DataNaAcao = () => {
        const data = new Date(agendamento.date + 'T00:00:00');
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = data.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
        const ano = data.getFullYear();

        return (
            <div className="w-16 text-center font-bold text-gray-500">
                <p className="text-xl">{dia}</p>
                <p className="text-xs uppercase">{mes}</p>
                <p className="text-xs">{ano}</p>
            </div>
        );
    };

    const AcoesDoCard = () => {
        switch (agendamento.status) {
            case 'pendente':
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
                                onConfirm={() => console.log("Agendamento cancelado:", agendamento.id)}
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
                        <Tooltip title="Solicitações" placement="bottom">
                            <button
                                className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 
                                text-green-500 hover:bg-green-200 transition-colors cursor-pointer"
                                aria-label="Convidar amigo"
                            >
                                <UserAddOutlined style={{ fontSize: '20px' }} />
                                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-600" />
                            </button>
                        </Tooltip>
                    </>
                );
            case 'aceito':
                return (
                    <Tooltip title="Sair" placement="top">
                        <Popconfirm
                            title="Sair de Jogo Aberto"
                            description="Tem certeza que deseja sair deste jogo aberto?"
                            okText="Sim"
                            cancelText={"Não"}
                            icon={null}
                            okButtonProps={{ type: 'text', className: '!bg-red-500 !text-white' }}
                            cancelButtonProps={{ type: 'text', className: '!text-gray-600' }}
                            onConfirm={() => console.log("Agendamento cancelado:", agendamento.id)}
                        >
                            <button
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-500 
                            hover:bg-red-200 transition-colors cursor-pointer"
                                aria-label="Cancelar agendamento"
                            >
                                <DeleteOutlined style={{ fontSize: '20px' }} />
                            </button>
                        </Popconfirm>
                    </Tooltip>
                );
            case 'ausente':
            case 'cancelado':
            case 'pago':
                return <DataNaAcao />;
            case 'solicitado':
            default:
                return <div className="w-16" />;
        }
    };

    return (
        <Flex align='center' className="gap-4 rounded-lg border border-gray-200 !p-3 shadow-sm hover:shadow-md transition-shadow">
            <Flex vertical align='center' justify='start' className="text-center w-24">
                {agendamento.localImageUrl ? (
                    <Image
                        src={agendamento.localImageUrl}
                        alt={`Logo de ${agendamento.arenaName}`}
                        fill
                        className='text-6xl rounded-lg'
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <PictureOutlined className='text-6xl' />
                )}
                <p className="mt-2 font-semibold text-gray-800 text-sm break-words">{agendamento.arenaName}</p>
            </Flex>

            <div className="w-px self-stretch bg-gray-200" />
            <div className="flex-grow space-y-1">
                <p className="text-sm font-semibold text-gray-900">{agendamento.date === '2025-05-07' ? '07 de maio 2025' : formatarDataAmigavel(agendamento.date)}</p>
                <p className="text-sm text-gray-600">
                    {agendamento.startTime} às {agendamento.endTime} ({agendamento.durationHours} hora)
                </p>
                <p className="text-sm text-gray-600">{agendamento.quadraName}</p>
                <p className={`font-bold text-lg ${['ausente', 'cancelado'].includes(agendamento.status) ? 'text-gray-400 line-through' : 'text-green-600'}`}>
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
    )
}
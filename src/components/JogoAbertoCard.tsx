import { PictureOutlined, UserAddOutlined } from '@ant-design/icons';
import { Button, App, Popconfirm } from 'antd';
import Image from 'next/image';
import React from 'react';
import { formatarData } from '@/context/functions/formatarData';

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

type JogoAbertoCardProps = {
    readonly jogoAberto: JogoAberto;
};

export function JogoAbertoCard({ jogoAberto }: JogoAbertoCardProps) {
    const { notification } = App.useApp();
    return (
        <div className="flex w-full max-w-md gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:scale-105 transition-all hover:shadow-md cursor-pointer">

            {/* Coluna da Esquerda: Informações do Local */}
            <div className="flex flex-col items-center text-center w-24">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 overflow-hidden">
                    {jogoAberto.localImageUrl ? (
                        <Image
                            src={jogoAberto.localImageUrl}
                            alt={`Logo de ${jogoAberto.arenaName}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <PictureOutlined style={{ fontSize: '24px' }} />
                    )}
                </div>
                <p className="mt-2 font-semibold text-gray-800 text-sm break-words">
                    {jogoAberto.arenaName}
                </p>
                <p className="text-xs text-gray-500 break-words">{jogoAberto.quadraName}</p>
            </div>

            <div className="w-px self-stretch bg-gray-200" />

            {/* Coluna Central: Detalhes da jogoAberto */}
            <div className="flex-grow space-y-1 self-center">
                <p className="text-sm text-gray-700">{formatarData(jogoAberto.date)}</p>

                <p className="text-sm text-gray-700">
                    {jogoAberto.startTime} às {jogoAberto.endTime} ({jogoAberto.durationHours} {jogoAberto.durationHours === 1 ? 'hora' : 'horas'})
                </p>
                <p className="font-semibold text-green-600">{jogoAberto.sport}</p>
                <div className="inline-block rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-sky-500">
                    {jogoAberto.vagasDisponiveis} vagas
                </div>
            </div>

            {/* Coluna da Direita: Botão de Ação */}
            <div className="ml-auto self-center">
                <Popconfirm
                    title="Confirmar entrada no jogo?"
                    description={`Verifique os detalhes antes de confirmar.`}
                    okText="Sim, entrar"
                    cancelText="Cancelar"
                    cancelButtonProps={{ type: 'text', className: '!text-gray-600' }}
                    okButtonProps={{ type: 'primary' }}
                    onConfirm={() => notification.success({
                        message: 'Solicitação Enviada!',
                        description: `Seu pedido para entrar no jogo de ${jogoAberto.sport} foi enviado.`,
                        duration: 8,
                    })}
                    placement="topLeft"
                    icon={null}
                >
                    <Button
                        aria-label="Entrar no jogo"
                        className="!flex !h-10 !w-10 !items-center !justify-center !border-none !rounded-lg !bg-green-100 !text-green-600 hover:scale-110 !transition-colors hover:!bg-green-200"
                    >
                        <UserAddOutlined style={{ fontSize: '20px' }} />
                    </Button>
                </Popconfirm>
            </div>
        </div>
    )
}
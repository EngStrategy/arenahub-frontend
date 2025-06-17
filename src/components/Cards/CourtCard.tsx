import React from 'react';
import { Button, Image, Tooltip, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { Quadra } from '@/app/api/entities/quadra';

interface CourtCardProps {
    court: Quadra;
    onDelete: (id: number) => void;
}

const CourtCard: React.FC<CourtCardProps> = ({ court, onDelete }) => {

    const amenities = [];
    if (court.cobertura) {
        amenities.push('Cobertura');
    }
    if (court.iluminacaoNoturna) {
        amenities.push('Iluminação');
    }

    return (
        <div className="flex w-full max-w-lg gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:scale-105 transition-all hover:shadow-md cursor-pointer">

            {/* Coluna da Esquerda: Informações do Local */}
            <div className="flex flex-col items-center justify-center text-center w-24">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 overflow-hidden">
                    <Image
                        src={court.urlFotoQuadra || '/images/imagem-default.png'}
                        alt={`Logo de ${court.nomeQuadra}`}
                        width={64}
                        height={64}
                        style={{ objectFit: 'cover' }}
                        fallback='/images/imagem-default.png'
                        preview={false}
                    />
                </div>
                <p className="mt-2 font-semibold text-gray-800 text-sm break-words">
                    {court.nomeQuadra}
                </p>
            </div>

            <div className="w-px self-stretch" />

            {/* Coluna Central: Detalhes da jogoAberto */}
            <div className="w-40 flex-grow space-y-1 self-center">
                <p className="text-sm text-gray-700">
                    {court.tipoQuadra.map(sport => <Tag key={sport} color="green">{sport}</Tag>)}
                </p>
                <p className="text-sm text-gray-700">
                    {court.materiaisFornecidos?.map(item => <Tag key={item} color="default">{item}</Tag>)}
                </p>
                <p className="text-sm text-gray-700">
                    {amenities.map(item => <Tag key={item} color="cyan">{item}</Tag>)}
                </p>
            </div>

            {/* Coluna da Direita: Botão de Ação */}
            <div className="w-10 flex-col self-center space-y-3">
                <Tooltip title="Excluir" trigger={['hover']} placement="top" >
                    <Popconfirm
                        title="Remover quadra"
                        description={`Tem certeza que deseja excluir esta quadra permanentemente?`}
                        okText='Sim'
                        cancelText="Não"
                        cancelButtonProps={{ type: 'text', className: '!text-gray-600' }}
                        okButtonProps={{ type: 'primary', className: '!bg-red-500 hover:!bg-red-600 !shadow-none' }}
                        onConfirm={() => onDelete(court.id)}
                        placement="topLeft"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button
                            shape="circle"
                            icon={<DeleteOutlined />}
                            className="!bg-red-100 !text-red-600 !border-none hover:!bg-red-200"
                        />
                    </Popconfirm>
                </Tooltip>
                <Tooltip
                    title="Editar"
                    trigger={['hover']}
                    placement="bottom"
                >
                    <Link href={`/perfil/arena/minhas-quadras/editar/${court.id}`}>
                        <Button
                            shape="circle"
                            icon={<EditOutlined />}
                            className="!bg-blue-100 !text-blue-600 !border-none hover:!bg-blue-200"
                        />
                    </Link>
                </Tooltip>
            </div>
        </div>
    );
};

export default CourtCard;
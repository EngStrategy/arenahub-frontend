import React from 'react';
import {
    Button, Tooltip, Tag, Popconfirm, Flex, Divider,
    Typography, Avatar, Card, Space
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    PictureOutlined,
    CheckCircleOutlined,
    TagOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { Quadra, TipoQuadra } from '@/app/api/entities/quadra';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';
import { formatarDiaSemanaAbreviado } from '@/context/functions/mapeamentoDiaSemana';
import { MdOutlineSports } from "react-icons/md";

interface CourtCardProps {
    court: Quadra;
    onDelete: (id: number) => void;
}

const CourtCard: React.FC<CourtCardProps> = ({ court, onDelete }) => {

    const amenities = [];
    if (court.cobertura) amenities.push('Coberta');
    if (court.iluminacaoNoturna) amenities.push('Iluminação Noturna');

    const diasFuncionamento = court.horariosFuncionamento
        ?.filter(h => h.intervalosDeHorario?.length > 0 && h.intervalosDeHorario.some(i => i.inicio && i.fim))
        .map(h => formatarDiaSemanaAbreviado(h.diaDaSemana))
        .join(', ');

    const TagSection = ({ title, icon, tags, color, formatter }: { title: string, icon: React.ReactNode, tags?: string[], color: string, formatter?: (tag: any) => string }) => {
        if (!tags || tags.length === 0) return null;
        return (
            <Flex vertical align="start">
                <Space size="small" align="center">
                    {icon}
                    <Typography.Text type="secondary" strong>{title}</Typography.Text>
                </Space>
                <Flex wrap="wrap" gap={4} className="!mt-1">
                    {tags.map(item => (
                        <Tag key={item} color={color}>
                            {formatter ? formatter(item) : item}
                        </Tag>
                    ))}
                </Flex>
            </Flex>
        );
    };

    return (
        <Card
            hoverable
            style={{ height: '100%' }}
            styles={{ body: { padding: 16, height: '100%', display: 'flex', flexDirection: 'column' } }}
        >
            <Flex vertical flex={1}>
                <Flex gap="middle" align="start">
                    <Avatar shape="square" size={64} src={court.urlFotoQuadra || undefined} icon={<PictureOutlined />} />
                    <Flex vertical>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                            {court.nomeQuadra}
                        </Typography.Title>

                        {diasFuncionamento && (
                            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', marginTop: 4 }}>
                                <CalendarOutlined style={{ marginRight: 6 }} />
                                {diasFuncionamento}
                            </Typography.Text>
                        )}
                    </Flex>
                </Flex>

                <Divider style={{ margin: '12px 0' }} />

                <Flex vertical gap="middle">
                    <TagSection
                        title="Esportes"
                        icon={<MdOutlineSports />}
                        tags={court.tipoQuadra}
                        color="green"
                        formatter={(sport) => formatarEsporte(sport as TipoQuadra)}
                    />
                    <TagSection
                        title="Materiais Inclusos"
                        icon={<TagOutlined />}
                        tags={court.materiaisFornecidos}
                        color="default"
                    />
                    <TagSection
                        title="Comodidades"
                        icon={<CheckCircleOutlined />}
                        tags={amenities}
                        color="cyan"
                    />
                </Flex>
            </Flex>

            <Divider style={{ margin: '12px 0' }} />

            <Flex justify="end" align="center">
                <Space>
                    <Tooltip title="Excluir">
                        <Popconfirm
                            title="Remover quadra?"
                            description="Esta ação não pode ser desfeita."
                            okText='Sim, excluir'
                            cancelText="Cancelar"
                            cancelButtonProps={{ style: { border: 0 } }}
                            okButtonProps={{ danger: true }}
                            onConfirm={() => onDelete(court.id)}
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        >
                            <Button
                                shape="circle"
                                icon={<DeleteOutlined />}
                                className="!bg-red-100 !text-red-600 !border-none hover:!bg-red-200"
                            />
                        </Popconfirm>
                    </Tooltip>
                    <Tooltip title="Editar">
                        <Link href={`/perfil/arena/quadras/editar/${court.id}`}>
                            <Button
                                shape="circle"
                                icon={<EditOutlined />}
                                className="!bg-blue-100 !text-blue-600 !border-none hover:!bg-blue-200"
                            />
                        </Link>
                    </Tooltip>
                </Space>
            </Flex>
        </Card>
    );
};

export default CourtCard;
import React from 'react';
import {
    Button, Tooltip, Tag, Popconfirm, Flex, Divider,
    Typography, Avatar, Card, Space,
    Rate
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    PictureOutlined,
    CheckCircleOutlined,
    TagOutlined,
    CalendarOutlined,
    StarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { Quadra, TipoQuadra } from '@/app/api/entities/quadra';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';
import { formatarDiaSemanaAbreviado } from '@/context/functions/mapeamentoDiaSemana';
import { MdOutlineSports } from "react-icons/md";
import { useRouter } from 'next/navigation';

interface CourtCardProps {
    court: Quadra;
    onDelete: (id: number) => void;
}

const CourtCard: React.FC<CourtCardProps> = ({ court, onDelete }) => {
    const navigate = useRouter();

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
            onClick={() => navigate.push(`/perfil/arena/quadras/editar/${court.id}`)}
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

            {court.quantidadeAvaliacoes > 0 && (
                <>
                    <Divider style={{ margin: '12px 0' }} />
                    <Flex align="center" gap="small">
                        <Rate disabled allowHalf defaultValue={court.notaMedia} style={{ fontSize: 16 }} />
                        <Typography.Text type="secondary">
                            {court.notaMedia.toFixed(1)} ({court.quantidadeAvaliacoes} avaliações)
                        </Typography.Text>
                    </Flex>
                </>
            )}

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
                            onConfirm={(e) => {
                                e?.stopPropagation();
                                onDelete(court.id)
                            }}
                            onCancel={(e) => {
                                e?.stopPropagation();
                            }}
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        >
                            <Button
                                shape="circle"
                                icon={<DeleteOutlined />}
                                className="!bg-red-100 !text-red-600 !border-none hover:!bg-red-200"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Popconfirm>
                    </Tooltip>

                    <Tooltip title="Ver Avaliações">
                        <Link
                            href={`/perfil/arena/quadras/${court.id}/avaliacoes`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                shape="circle"
                                icon={<StarOutlined />}
                                className="!bg-yellow-100 !text-yellow-600 !border-none hover:!bg-yellow-200"
                            />
                        </Link>
                    </Tooltip>


                    <Tooltip title="Editar">
                        <Link
                            href={`/perfil/arena/quadras/editar/${court.id}`}
                            onClick={(e) => e.stopPropagation()}
                        >
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
import React from 'react';
import { Button, App, Popconfirm, Card, Flex, Avatar, Typography, Tag, Divider } from 'antd';
import { PictureOutlined, UserAddOutlined } from '@ant-design/icons';
import { formatarData } from '@/context/functions/formatarData';

const { Text, Title } = Typography;

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
        <Card
            hoverable
            style={{ height: '100%' }}
            styles={{ body: { padding: 16, height: "100%" } }}
        >
            <Flex vertical justify="space-between" className="h-full">

                <Flex vertical>
                    <Flex gap="middle" align="start">
                        <Avatar shape="square" size={64} src={jogoAberto.localImageUrl} icon={<PictureOutlined />} />
                        <Flex vertical>
                            <Title level={5} style={{ margin: 0 }}>{jogoAberto.arenaName}</Title>
                            <Text type="secondary">{jogoAberto.quadraName}</Text>
                        </Flex>
                    </Flex>

                    <Divider style={{ margin: '12px 0' }} />

                    <Flex vertical gap={4}>
                        <Text strong>{formatarData(jogoAberto.date)}</Text>
                        <Text type="secondary">
                            {`${jogoAberto.startTime} às ${jogoAberto.endTime} (${jogoAberto.durationHours}h)`}
                        </Text>
                        <Text strong className="text-green-600">{jogoAberto.sport}</Text>
                    </Flex>
                </Flex>

                <Flex justify="space-between" align="center" className="mt-4">
                    <Tag color="blue" style={{ fontWeight: 'bold' }}>
                        {jogoAberto.vagasDisponiveis} vagas
                    </Tag>
                    <Popconfirm
                        title="Confirmar solicitação?"
                        description="Deseja solicitar entrada neste jogo?"
                        okText='Confirmar'
                        cancelText="Cancelar"
                        cancelButtonProps={{ style: { border: 0 } }}
                        onConfirm={() => notification.success({
                            message: 'Solicitação Enviada!',
                            description: `Seu pedido para o jogo de ${jogoAberto.sport} foi enviado.`,
                            duration: 5,
                        })}
                        placement="topRight"
                    >
                        <Button type="primary" ghost icon={<UserAddOutlined />} className='hover:!bg-green-500 hover:!text-green-50 hover:!border-green-500'>
                            Entrar
                        </Button>
                    </Popconfirm>
                </Flex>
            </Flex>
        </Card>
    )
}
import React from 'react';
import { Card, Avatar, Typography, Rate, Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AvaliacaoResponse } from '@/app/api/entities/agendamento';

const { Text, Paragraph } = Typography;

interface AvaliacaoCardProps {
    avaliacao: AvaliacaoResponse;
}

const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({ avaliacao }) => {
    const dataFormatada = new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <Card>
            <Flex gap="middle">
                <Avatar src={avaliacao.urlFotoAtleta} icon={<UserOutlined />} />
                <Flex vertical style={{ width: '100%' }}>
                    <Flex justify="space-between">
                        <Text strong>{avaliacao.nomeAtleta}</Text>
                        <Text type="secondary">{dataFormatada}</Text>
                    </Flex>
                    <Rate disabled defaultValue={avaliacao.nota} style={{ fontSize: 14, marginBottom: 8 }} />
                    {avaliacao.comentario && <Paragraph type="secondary">{avaliacao.comentario}</Paragraph>}
                </Flex>
            </Flex>
        </Card>
    );
};

export default AvaliacaoCard;
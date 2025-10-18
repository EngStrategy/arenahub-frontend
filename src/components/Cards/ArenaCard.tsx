"use client";

import React, { useState } from 'react';
import { Card, Flex, Typography, Avatar } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { Arena } from '@/app/api/entities/arena';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';
import { TipoQuadra } from '@/app/api/entities/quadra';

const { Title, Text, Paragraph } = Typography;

interface ArenaCardProps {
  arena: Arena;
  showDescription?: boolean;
  showHover?: boolean;
  showEsportes?: boolean;
  diasFuncionamento?: string[];
}

export const ArenaCard = ({ arena, showDescription, showHover = true, showEsportes = true, diasFuncionamento = []}: ArenaCardProps) => {
  const fallbackSrc = '/images/imagem-default.png';
  const [imgSrc, setImgSrc] = useState(arena.urlFoto || fallbackSrc);

  const esportesFormatados = arena.esportes
    ? (arena.esportes as any[]).map(esporte => formatarEsporte(esporte as TipoQuadra))
    : [];

  const listFormatter = new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' });

  return (
    <Card
      hoverable={showHover}
      style={{ height: '100%', border: 'none', overflow: 'hidden' }}
      styles={{ body: { padding: '0.75rem', height: '100%' } }}
    >
      <Flex gap="middle" align="stretch">
        <Avatar
          shape="square"
          size={120}
          src={imgSrc}
          onError={() => {
            setImgSrc(fallbackSrc);
            return true;
          }}
          style={{ flexShrink: 0 }}
        />

        <Flex vertical justify="space-between" className="flex-1 min-w-0">
          <Flex vertical>
            <Title level={5} ellipsis={{ tooltip: arena.nome }} style={{ marginBottom: '0.25rem' }}>
              {arena.nome}
            </Title>
            <Text type="secondary">
              {arena.endereco.cidade} - {arena.endereco.estado} <br />
              {arena.endereco.rua}, {arena.endereco.numero} - {arena.endereco.bairro} - {arena.endereco.cep}
            </Text>
            {(esportesFormatados.length > 0 && showEsportes) && (
              <Text strong className="!text-green-600 !mt-1" style={{ fontSize: '0.8rem' }}>
                {listFormatter.format(esportesFormatados)}
              </Text>
            )}
          </Flex>

          {diasFuncionamento.length > 0 && (
            <Text type="secondary" className="!text-green-600 mt-1 mb-1" style={{ fontSize: '0.8rem' }}>
              {listFormatter.format(diasFuncionamento)}
            </Text>
          )}

          {showDescription && arena.descricao &&
            <Paragraph ellipsis={{ rows: 2 }} type="secondary" className="!my-1">
              {arena.descricao}
            </Paragraph>
          }

          <Flex align="center">
            <StarFilled className="!text-yellow-500 mr-1 " />
            <Text strong>{arena.notaMedia?.toFixed(1)}</Text>
            <Text type="secondary" className="ml-1">({arena.quantidadeAvaliacoes} avaliações)</Text>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default ArenaCard;
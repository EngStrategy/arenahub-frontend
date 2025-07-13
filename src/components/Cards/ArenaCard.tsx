"use client";

import React, { useState } from 'react';
import { Card, Flex, Typography } from 'antd';
import { StarFilled } from '@ant-design/icons';
import Image from 'next/image';
import { Arena } from '@/app/api/entities/arena';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';
import { TipoQuadra } from '@/app/api/entities/quadra';

const { Title, Text, Paragraph } = Typography;

interface ArenaCardProps {
  arena: Arena;
  showDescription?: boolean;
  showHover?: boolean;
  showEsportes?: boolean;
}

export const ArenaCard = ({ arena, showDescription, showHover = true, showEsportes = true }: ArenaCardProps) => {
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
        <div className="relative w-1/3 max-w-[120px] flex-shrink-0 aspect-square rounded-md overflow-hidden">
          <Image
            src={imgSrc}
            alt={`Imagem da ${arena.nome}`}
            fill
            sizes="(max-width: 768px) 33vw, 120px"
            className="object-cover"
            onError={() => setImgSrc(fallbackSrc)}
          />
        </div>

        <Flex vertical justify="space-between" className="flex-1 min-w-0">
          <Flex vertical>
            <Title level={5} ellipsis={{ tooltip: arena.nome }} style={{ marginBottom: '0.25rem' }}>
              {arena.nome}
            </Title>
            <Text type="secondary">
              {arena.endereco.cidade} - {arena.endereco.estado} <br />
              {arena.endereco.rua}, {arena.endereco.numero} - {arena.endereco.bairro} - CEP {arena.endereco.cep}
            </Text>
            {(esportesFormatados.length > 0 && showEsportes) && (
              <Text strong className="!text-green-600 !mt-1" style={{ fontSize: '0.8rem' }}>
                {listFormatter.format(esportesFormatados)}
              </Text>
            )}
          </Flex>

          {showDescription && arena.descricao &&
            <Paragraph ellipsis={{ rows: 2 }} type="secondary" className="!my-1">
              {arena.descricao}
            </Paragraph>
          }

          <Flex align="center">
            <StarFilled className="!text-yellow-500 mr-1" />
            <Text strong>{arena.avaliacao?.toFixed(1)}</Text>
            <Text type="secondary" className="ml-1">({arena.numeroAvaliacoes} avaliações)</Text>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default ArenaCard;
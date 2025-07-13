"use client";

import React, { useState } from 'react';
import { Card, Flex, Typography } from 'antd'; // Componentes importados do Ant Design
import { PictureOutlined, StarFilled } from '@ant-design/icons';
import Image from 'next/image';
import { Arena } from '@/app/api/entities/arena';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';

const { Title, Text, Paragraph } = Typography; // Desestruturando os componentes de Typography

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
    ? (arena.esportes as any[]).map(esporte => formatarEsporte(esporte as any))
    : [];

  const listFormatter = new Intl.ListFormat('pt-BR', {
    style: 'long',
    type: 'conjunction'
  });

  return (
    <Card
      {...showHover ? { hoverable: true } : {}}
      style={{ height: '100%', border: 'none' }}
      styles={{ body: { padding: 6, height: '100%', display: 'flex', flexDirection: 'column' } }}
    >
      <Flex gap="large" align="start">
        {/* Imagem da Arena */}
        <div className="rounded-lg relative h-36 min-w-[144px] w-45 xs:w-20 sm:w-24 md:w-34 
        lg:w-45 xl:w-45 overflow-hidden border border-gray-200 shadow-sm bg-white 
        hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer
        overflow-hidden bg-gray-300 flex-shrink-0">
          <Image
            src={imgSrc}
            alt={`Imagem da ${arena.nome}`}
            fill
            className="object-cover"
            onError={() => setImgSrc(fallbackSrc)}
          />
        </div>

        {/* Container de Informações */}
        <Flex vertical justify="space-between" className="!flex-1 !h-36">
          {/* Informações superiores */}
          <Flex justify="space-between" vertical>
            <Title level={5}>
              {arena.nome}
            </Title>
            <Text type="secondary">
              {arena.endereco.cidade} - {arena.endereco.estado} <br />
              {arena.endereco.rua}, {arena.endereco.numero} - {arena.endereco.bairro} - CEP {arena.endereco.cep}
            </Text>
            {(esportesFormatados.length > 0 && showEsportes) && (
              <Text strong className="!text-green-600 !mt-2">
                {listFormatter.format(esportesFormatados)}
              </Text>
            )}
          </Flex>

          {/* Descrição opcional */}
          {showDescription && arena.descricao &&
            <Paragraph ellipsis={{ rows: 2 }} type="secondary" className="!my-1">
              {arena.descricao}
            </Paragraph>
          }

          {/* Parte inferior (Avaliações) */}
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
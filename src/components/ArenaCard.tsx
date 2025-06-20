"use client";

import React, { useState } from 'react';
import { StarFilled } from '@ant-design/icons';
import Image from 'next/image';
import { Arena } from '@/app/api/entities/arena';

interface ArenaCardProps {
  arena: Arena;
  showDescription?: boolean;
  showHover?: boolean;
}

export const ArenaCard = ({ arena, showDescription, showHover = true }: ArenaCardProps) => {
  const fallbackSrc = '/images/imagem-default.png';
  const [imgSrc, setImgSrc] = useState(arena.urlFoto || fallbackSrc);

  return (
    <div
      className={`
        flex rounded-lg overflow-hidden gap-4
        transition-all duration-200 ease-in-out
        ${showHover ? 'hover:shadow-xl hover:scale-105 cursor-pointer': ''}
      `}
    >
      <div className="rounded-lg relative h-36 min-w-[144px] w-45 overflow-hidden bg-gray-300 flex-shrink-0">
        <Image
          src={imgSrc}
          alt={`Imagem da ${arena.nome}`}
          fill
          className="object-cover"
          onError={() => setImgSrc(fallbackSrc)}
        />
      </div>

      <div className="flex flex-col col-span-8 justify-between">
        {/* Informações superiores */}
        <h3 className="text-lg font-semibold text-gray-900">{arena.nome}</h3>
        <div>
          <p className="text-sm text-gray-600">{arena.endereco.cidade} - {arena.endereco.estado}</p>
          <p className="text-sm text-gray-500">{arena.endereco.rua}, {arena.endereco.numero} - {arena.endereco.bairro} - CEP {arena.endereco.cep}</p>
        </div>
        <p className="font-semibold text-green-600">
          {arena.sports && new Intl.ListFormat('pt-BR', { style: 'long', type: 'conjunction' }).format(arena.sports)}
        </p>
        {/* Parte inferior */}
        <div className="mb-2 flex items-center">
          <StarFilled className="!text-yellow-500 mr-1" />
          <span className="text-sm text-gray-800 font-medium">{arena.avaliacao?.toFixed(1)}</span>
          <span className="text-sm text-gray-500 ml-1">({arena.numeroAvaliacoes} avaliações)</span>
        </div>
        {/* Descrição opcional */}
        {showDescription && arena.descricao &&
          <p className="text-sm text-gray-500 line-clamp-2">{arena.descricao}</p>
        }
      </div>
    </div>
  );
};

export default ArenaCard;
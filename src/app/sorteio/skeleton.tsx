'use client';

import React from 'react';

const CardSkeleton = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        {children}
    </div>
);

const ListItemSkeleton = () => (
    <div className="flex items-center gap-4 py-2">
        <div className="h-10 w-10 bg-gray-300 rounded-full flex-shrink-0"></div>
        <div className="flex-grow space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-6 bg-gray-300 rounded-md"></div>
    </div>
);

export const SorteadorPageSkeleton = () => {
    return (
        <div className="animate-pulse max-w-4xl mx-auto">
            {/* Cabeçalho */}
            <div className="h-8 bg-gray-300 rounded-md w-1/2 max-w-xs mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded-md w-3/4 max-w-md mx-auto mt-4 mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna Esquerda: Adicionar Jogadores */}
                <CardSkeleton>
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                        </div>
                        <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                    </div>
                    <div className="h-px bg-gray-200 my-6"></div>
                    <div className="h-5 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                        <ListItemSkeleton />
                        <ListItemSkeleton />
                        <ListItemSkeleton />
                    </div>
                </CardSkeleton>

                {/* Coluna Direita: Configurar e Sortear */}
                <CardSkeleton>
                    <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
                    </div>
                    <div className="h-12 bg-green-300 rounded-lg w-full mt-6"></div>
                </CardSkeleton>
            </div>
        </div>
    );
};
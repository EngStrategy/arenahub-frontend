'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Cta({ isDarkMode }: { readonly isDarkMode: boolean }) {
    return (
        <section
            id="cta"
            className={`relative py-20 ${!isDarkMode && '!bg-gradient-to-br !from-green-100 !to-white'}`}
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark-secondary)' : '' }}
        >
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-green-500/10 via-white to-white"></div>

            <div className="max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    className="rounded-3xl bg-green-600 text-white p-10 sm:p-14 shadow-lg"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <h2 className="text-3xl sm:text-4xl font-extrabold">
                        Pronto para agendar sua próxima partida?
                    </h2>
                    <p className="mt-3 text-white/90 max-w-2xl mx-auto">
                        Junte-se a milhares de atletas e organize seus jogos com poucos cliques.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/arenas"
                            className="!inline-flex !items-center !gap-2 !px-6 !py-3 !rounded-full !bg-white !text-green-600 !font-semibold !shadow hover:!bg-gray-200 !transition !duration-300 focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-white"
                        >
                            Encontrar uma Quadra
                        </Link>
                        <Link
                            href="/planos"
                            className="!inline-flex !items-center !px-6 !py-3 !rounded-full !border !border-white/70 !text-white font-semibold hover:!bg-white/10 !transition !duration-300 focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-white"
                        >
                            Ver Planos para Arenas
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
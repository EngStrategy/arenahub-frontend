'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from "@/context/ThemeProvider";

export function Cta() {
    const { isDarkMode } = useTheme();
    return (
        <section
            id="cta"
            className={`relative py-20 ${!isDarkMode && '!bg-gradient-to-br !from-green-100 !to-white'}`}
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark-secondary)' : '' }}
        >
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-green-500/10 via-white to-white"></div>

            <div className="max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    className="rounded-3xl bg-green-600 text-white p-10 sm:p-14 shadow-2xl relative overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

                    <h2 className="text-3xl sm:text-4xl font-extrabold relative z-10">
                        Pronto para lotar a sua agenda e automatizar sua arena?
                    </h2>
                    <p className="mt-3 text-white/90 max-w-2xl mx-auto text-lg relative z-10">
                        Junte-se a dezenas de gestores e transforme a maneira como você administra o seu negócio.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 relative z-10">
                        <Link
                            href="/registro?aba=arena"
                            className="!inline-flex !items-center !gap-2 !px-8 !py-4 !rounded-full !bg-white !text-green-700 !text-lg !font-bold !shadow-xl hover:!scale-105 hover:!bg-gray-100 !transition-all !duration-300 focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-white"
                        >
                            Quero 30 Dias Grátis para minha Arena
                        </Link>
                        <a
                            href="https://github.com/EngStrategy/arenahub-frontend/releases/download/arenahub/ArenaHub.apk"
                            download="ArenaHub.apk"
                            className="!inline-flex !items-center !px-6 !py-3 !rounded-full !border-2 !border-white/70 !text-white font-semibold hover:!bg-white/10 hover:!border-white !transition-colors !duration-300 focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-white"
                        >
                            Sou Atleta (Baixar App)
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
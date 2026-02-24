'use client';

import Link from "next/link";
import { motion } from "framer-motion";

import { useTheme } from "@/context/ThemeProvider";

export function Hero() {
    const { isDarkMode } = useTheme();
    return (
        <motion.section
            className={`relative overflow-hidden`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
        >
            <section
                className={`relative overflow-hidden pt-6 opacity-0 animate-fadeIn`}
                style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark-secondary)' : 'var(--cor-fundo-light)' }}
            >

                <div aria-hidden="true" className="absolute inset-0 -z-10">
                    <div className={`absolute -right-24 h-72 w-72 rounded-full bg-green-200 blur-3xl`}></div>
                    <div className="hidden md:block absolute top-48 -left-16 h-56 w-56 rounded-full bg-green-200 blur-2xl"></div>
                </div>

                {/* Container principal com layout de grelha */}
                <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">

                    {/* Coluna de Texto (Esquerda) */}
                    <div>
                        <h1
                            className={`text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight
                                ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                        >
                            A plataforma definitiva para <span className="text-green-600">Arenas</span> e <span className="text-green-600">Atletas</span>.
                        </h1>

                        <div className={`mt-8 p-1 rounded-2xl bg-gradient-to-r from-green-500 to-green-400 shadow-lg shadow-green-500/30 transform hover:scale-[1.02] transition-transform duration-300`}>
                            <div className={`p-4 rounded-xl h-full w-full ${isDarkMode ? 'bg-neutral-800' : 'bg-white'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Sua arena aberta para reservas 24h por dia.
                                        </p>
                                        <p className={`mt-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Comece a usar o ArenaHub sem custo de implementação.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="mt-8">
                            <div className="flex flex-wrap items-center gap-4">
                                <Link
                                    href="/registro?aba=arena"
                                    className="!inline-flex !items-center !gap-2 !px-8 !py-4 !rounded-full !bg-green-600 !text-white 
                                    !text-lg !font-bold !shadow-xl !shadow-green-600/30 hover:!bg-green-700 hover:!scale-105 
                                    hover:-translate-y-1 !transition-all !duration-300 focus:!outline-none focus:!ring-2 
                                    focus:!ring-offset-2 focus:!ring-green-500 relative overflow-hidden group"
                                >
                                    {/* <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b 
                                    from-transparent via-transparent to-black"></span> */}
                                    <span className="relative">Sou uma Arena</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <a
                                    href="https://github.com/EngStrategy/arenahub-frontend/releases/download/arenahub/ArenaHub.apk"
                                    download="ArenaHub.apk"
                                    className={`!inline-flex !items-center !gap-2 !px-6 !py-3 !rounded-full !border !font-semibold !transition-all !duration-300 focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-gray-500
                                    ${isDarkMode
                                            ? '!border-gray-600 !text-gray-300 hover:!bg-gray-800'
                                            : '!border-gray-300 !text-gray-600 hover:!bg-gray-100'}`}
                                >
                                    Baixar App (Atletas)
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                            <div className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                                ✨ Crie sua conta de Arena e ganhe 30 dias grátis!
                            </div>
                        </div>
                    </div>

                    {/* Coluna da Imagem (Direita) */}
                    <div className="relative">
                        <img
                            src="/images/peoples_and_system.png"
                            alt="Gestão de ArenaHub"
                            className={`rounded-2xl shadow-2xl border-4 border-white w-full ${isDarkMode ? 'border-gray-800' : ''}`}
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className={`absolute -bottom-6 -left-6 sm:-left-12 rounded-2xl shadow-lg p-4 border z-10 w-64
                                ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-green-600 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className={`font-semibold text-sm sm:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Gestão Automatizada</div>
                                    <div className={`text-xs sm:text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Poupe horas de trabalho</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className={`absolute -top-6 -right-6 sm:-right-8 rounded-2xl shadow-lg p-4 border z-10 w-56
                                ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className={`font-semibold text-sm sm:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Agenda Lotada</div>
                                    <div className={`text-xs sm:text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>+ Receita Mensal</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </section>
        </motion.section>
    );
}
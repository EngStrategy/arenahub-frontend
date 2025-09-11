'use client';

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero({ isDarkMode }: { readonly isDarkMode: boolean }) {
    return (
        <motion.section
            className={`relative overflow-hidden`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
        >
            <section
                className={`relative overflow-hidden pt-14 opacity-0 animate-fadeIn`}
                style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark-secondary)' : 'var(--cor-fundo-light)' }}
            >

                <div aria-hidden="true" className="absolute inset-0 -z-10">
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-green-100 blur-3xl"></div>
                    <div className="absolute top-48 -left-16 h-56 w-56 rounded-full bg-emerald-100 blur-2xl"></div>
                </div>

                {/* Container principal com layout de grelha */}
                <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">

                    {/* Coluna de Texto (Esquerda) */}
                    <div>
                        <h1
                            className={`text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight
                                ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                        >
                            Agende quadras esportivas <span className="text-green-600">rápido</span> e <span className="text-green-600">fácil</span>.
                        </h1>
                        <p className={`mt-5 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Com o ArenaHub, você encontra quadras, faz reservas, encontra jogos abertos e organiza partidas em segundos — tudo direto do navegador, sem precisar baixar nada.
                        </p>

                        {/* Botões de Ação */}
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                href="/arenas"
                                className="!inline-flex !items-center !gap-2 !px-6 !py-3 !rounded-full !bg-green-600 !text-white !font-semibold !shadow-lg hover:!bg-green-700 !transition !duration-300 focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-green-500"
                            >
                                Acessar Plataforma
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.75 3.5a.75.75 0 00-1.5 0v8.69L6.3 9.25a.75.75 0 10-1.06 1.06l4.25 4.25a.75.75 0 001.06 0l4.25-4.25a.75.75 0 10-1.06-1.06l-2.95 2.94V3.5z" />
                                </svg>
                            </Link>
                            <Link
                                href="#features"
                                className={`!inline-flex !items-center !gap-2 !px-6 !py-3 !rounded-full !border  
                                 !font-semibold hover:!border-green-600 hover:!text-green-600 !transition !duration-300 
                                focus:!outline-none focus:!ring-2 focus:!ring-offset-2 focus:!ring-green-500 
                                ${isDarkMode ? '!border-gray-400 !text-gray-300 hover:!border-green-500 hover:!text-green-500 focus:!ring-gray-700'
                                        : '!border-gray-300 !text-gray-700'}`}
                            >
                                Ver funcionalidades
                            </Link>
                        </div>

                        {/* Selos de Confiança */}
                        <div className="mt-8 flex items-center gap-5 text-sm text-gray-600">
                            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs"
                                >✓</span>{" "}
                                Sem burocracia
                            </div>
                            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs">✓</span>{" "}
                                Pagamento seguro
                            </div>
                            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs">✓</span>{" "}
                                100% responsivo
                            </div>
                        </div>
                    </div>

                    {/* Coluna da Imagem (Direita) */}
                    <div className="relative">
                        <img
                            src="/images/peoples_and_system.png"
                            alt="Jogo de futebol society ao pôr do sol"
                            className="rounded-2xl shadow-2xl border-4 border-white w-full"
                        />
                        <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                            <div className="font-semibold text-gray-800">+3.200 partidas marcadas</div>
                            <div className="text-sm text-gray-500">nos últimos 30 dias</div>
                        </div>
                    </div>

                </div>
            </section>
        </motion.section>
    );
}
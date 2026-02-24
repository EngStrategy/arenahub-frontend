'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';

export default function SmartAppBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        // Verifica se é mobile (Android, iOS)
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Verifica se o usuário já fechou o banner nesta sessão
        const bannerClosed = sessionStorage.getItem('smartAppBannerClosed');

        // Mostra o banner se for dispositivo móvel e não tiver sido fechado
        if (isMobile && !bannerClosed) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('smartAppBannerClosed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative z-[100] w-full flex items-center justify-between p-3 md:hidden shadow-md
                        ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b border-gray-200'}`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <button
                            onClick={handleClose}
                            className={`p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
                            aria-label="Fechar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white p-1">
                            <img src="/icons/logo_arenahub_icone.svg" alt="ArenaHub Logo" className="w-full h-full object-cover" />
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ArenaHub - Atletas</span>
                            <span className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Baixe o app oficial</span>
                        </div>
                    </div>

                    <a
                        href="https://github.com/EngStrategy/arenahub-frontend/releases/download/arenahub/ArenaHub.apk"
                        download="ArenaHub.apk"
                        onClick={handleClose}
                        className="ml-3 shrink-0 !bg-green-600 hover:!bg-green-700 !text-white text-xs font-bold py-1.5 px-3 rounded-full 
                            uppercase tracking-wide transition-colors"
                    >
                        Instalar
                    </a>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

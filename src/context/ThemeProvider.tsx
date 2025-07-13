// src/context/ThemeProvider.tsx

"use client";

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ConfigProvider, App, theme as antdTheme } from 'antd';
import '@ant-design/v5-patch-for-react-19';

// 1. Definição do Contexto - ADICIONADO isDarkMode
interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
    isDarkMode: boolean; // <-- Adicionado para saber o estado real
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    }
    return context;
};

// 2. Componente Provedor
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        return localStorage.getItem('theme') || 'system';
    });

    const [mounted, setMounted] = useState(false);

    // O useMemo agora calcula o isDarkMode, que será usado em toda a aplicação
    const isDarkMode = useMemo(() => {
        if (!mounted) return false;
        if (theme === 'dark') return true;
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    }, [theme, mounted]);

    useEffect(() => {
        setMounted(true);
        // Listener para quando o tema do sistema muda enquanto a página está aberta
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            if (localStorage.getItem('theme') === null) { // Só muda se o tema for 'system'
                document.documentElement.classList.toggle('dark', e.matches);
            }
        };

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    const setTheme = (newTheme: string) => {
        const root = document.documentElement;
        setThemeState(newTheme); // Atualiza o estado do React

        if (newTheme === 'dark') {
            localStorage.setItem('theme', 'dark');
            root.classList.add('dark');
        } else if (newTheme === 'light') {
            localStorage.setItem('theme', 'light');
            root.classList.remove('dark');
        } else { // 'system'
            localStorage.removeItem('theme');
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    // O valor do contexto agora inclui isDarkMode
    const contextValue = useMemo(() => ({ theme, setTheme, isDarkMode }), [theme, isDarkMode]);

    const primary = "#15a01a";

    return (
        <ThemeContext.Provider value={contextValue}>
            <ConfigProvider
                theme={{
                    token: { colorPrimary: primary, borderRadius: 5 },
                    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                }}
            >
                <App style={{ height: '100%' }}>{children}</App>
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};
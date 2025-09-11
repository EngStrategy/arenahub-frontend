"use client";

import {
    useSession,
    signOut as nextAuthSignOut,
    signIn,
    getSession,
} from 'next-auth/react';

/**
 * Hook centralizado para gerenciamento de autenticação.
 * Fornece acesso fácil ao status da sessão, dados do usuário e funções de autenticação.
 * * @returns {object} Um objeto contendo o status da sessão, dados do usuário,
 * booleanos de verificação e a função de logout.
 */
export const useAuth = () => {
    const { data: session, status, update } = useSession();

    const user = session?.user;

    const isAuthenticated = status === 'authenticated';
    const isLoadingSession = status === 'loading';

    const signOut = ({ redirect }: { redirect?: string }) => {
        const callbackUrl = redirect || `${process.env.NEXTAUTH_URL || window.location.origin}/`;
        nextAuthSignOut({ callbackUrl });
    };

    return {
        session,
        statusSession: status,
        user,
        isAuthenticated,
        isLoadingSession,
        signOut,
        signIn,
        getSession,
        updateSession: update,
        isUserArena: user?.role === 'ARENA',
        isUserAtleta: user?.role === 'ATLETA',
        isUserAdmin: user?.role === 'ADMIN',
    };
};
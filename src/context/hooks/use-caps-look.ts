import { useState, useEffect, useCallback } from 'react';

/**
 * Hook customizado que detecta e retorna o estado do Caps Lock.
 * @returns {boolean} `true` se o Caps Lock estiver ativado, `false` caso contrário.
 */
export function useCapsLock(): boolean {
    const [capsLockLigado, setCapsLockLigado] = useState(false);

    const checarEstadoCapsLock = useCallback((event: KeyboardEvent) => {
        const estaAtivado = event.getModifierState('CapsLock');
        setCapsLockLigado(estaAtivado);
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', checarEstadoCapsLock);
        window.addEventListener('keyup', checarEstadoCapsLock);

        return () => {
            window.removeEventListener('keydown', checarEstadoCapsLock);
            window.removeEventListener('keyup', checarEstadoCapsLock);
        };
    }, [checarEstadoCapsLock]);

    return capsLockLigado;
}
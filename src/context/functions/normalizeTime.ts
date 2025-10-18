export const normalizeTime = (time: string | Array<number> | undefined): string => {
    if (Array.isArray(time)) {
        // Se for um array (ex: [19, 0] ou [19, 0, 0])
        const [hora, minuto] = time;
        if (hora === undefined || minuto === undefined) return '00:00';

        // Formata para HH:MM
        const horaStr = String(hora).padStart(2, '0');
        const minutoStr = String(minuto).padStart(2, '0');
        return `${horaStr}:${minutoStr}`;
    }

    if (typeof time === 'string') {
        // Se for uma string (HH:MM:SS ou HH:MM)
        return time.slice(0, 5);
    }

    return 'Erro'; // Caso seja nulo ou inesperado
};
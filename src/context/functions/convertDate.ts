// Função auxiliar para converter [ano, mes, dia] em string ISO 'YYYY-MM-DD'
export const convertArrayOrStringDateToDatePortuguese = (dataArray: Array<number> | string): string => {
    if (typeof dataArray === 'string') {
        return dataArray;
    }
    
    const [ano, mes, dia] = dataArray;
    return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
};
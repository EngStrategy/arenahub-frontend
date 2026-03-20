export const parseDateToLocal = (dateInput: string | Array<number>): Date => {
    if (Array.isArray(dateInput)) {
        const [ano, mes, dia] = dateInput;
        return new Date(ano, mes - 1, dia);
    }
    if (typeof dateInput === 'string') {
        if (dateInput.includes('-') && dateInput.length <= 10) {
            const [ano, mes, dia] = dateInput.split('-').map(Number);
            return new Date(ano, mes - 1, dia);
        }
        const parsed = new Date(dateInput);
        return Number.isNaN(parsed.getTime()) ? new Date() : new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000);
    }
    return new Date();
};
export function formatarCPF(cpf: string): string {
    const cpfLimpo = cpf.replace(/\D/g, "").slice(0, 11);

    if (cpfLimpo.length <= 3) {
        return cpfLimpo;
    } else if (cpfLimpo.length <= 6) {
        return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`;
    } else if (cpfLimpo.length <= 9) {
        return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6)}`;
    } else {
        return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9, 11)}`;
    }
}
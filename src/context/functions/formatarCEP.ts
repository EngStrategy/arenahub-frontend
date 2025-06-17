export function formatarCEP(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, "").slice(0, 8);
    if (cepLimpo.length <= 5) {
        return cepLimpo;
    } else {
        return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
    }    
}
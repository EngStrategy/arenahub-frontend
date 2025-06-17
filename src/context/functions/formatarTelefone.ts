export function formatarTelefone(telefone: string): string {
    const apenasDigitos = telefone.replace(/\D/g, "").slice(0, 11);
    let valorFormatado = apenasDigitos;
    if (apenasDigitos.length > 2) {
        valorFormatado = `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2)}`;
    }
    if (apenasDigitos.length > 7) {
        valorFormatado = `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2, 7)}-${apenasDigitos.slice(7)}`;
    }
    return valorFormatado;
};
import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

// Tipo para a resposta dos detalhes da assinatura
export type AssinaturaDetalhes = {
    status: 'ATIVA' | 'INATIVA' | 'CANCELADA' | 'ATRASADA';
    planoNome: string;
    proximaCobranca: string; // Formato de data ex: '2025-10-25'
    valor: number;
    dataCancelamento?: string; // Formato de data ex: '2025-10-25', opcional
};

// Retorna um sessionId para o checkout
export const createCheckoutSession = async (priceId: string) => {
    return await httpRequests.postMethod<{ sessionId: string }>(
        `${URLS.SUBSCRIPTION}/create-checkout-session`, 
        { priceId }
    );
};

// Busca os detalhes da assinatura da arena logada
export const getMinhaAssinatura = async (): Promise<AssinaturaDetalhes[]> => {
    return await httpRequests.getMethod<AssinaturaDetalhes[]>(`${URLS.SUBSCRIPTION}/me`);
};

// Cria uma sessão para o portal do cliente do Stripe
export const createCustomerPortalSession = async (): Promise<{ url: string }> => {
    return await httpRequests.postMethod<{ url: string }>(`${URLS.SUBSCRIPTION}/customer-portal`);
};
import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export type FeedbackCreate = {
    nome: string;
    email: string;
    tipo: "ELOGIO" | "SUGESTAO_MELHORIA" | "RELATORIO_BUG" | "DUVIDA" | "OUTRO";
    mensagem: string;
};

export const createFeedback = async (data: FeedbackCreate) => {
    return httpRequests.postMethod(URLS.FEEDBACK, data);
};

import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";
import { TipoQuadra } from "./quadra";

export type JogosAbertos = {
    agendamentoId: number;
    data: string;
    horarioInicio: string;
    horarioFim: string;
    vagasDisponiveis: number;
    esporte: TipoQuadra;
    nomeArena: string;
    nomeQuadra: string;
    cidade: string;
    urlFotoArena: string;
};

export type JogosAbertosQueryParams = {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "asc" | "desc";
    cidade?: string;
    esporte?: TipoQuadra;
    latitude?: number;
    longitude?: number;
    raioKm?: number;
};

// Busca todos os jogos abertos
export const getAllJogosAbertos = async (
    params: JogosAbertosQueryParams = {}
): Promise<httpRequests.PaginatedResponse<JogosAbertos>> => {
    return httpRequests.getMethod<httpRequests.PaginatedResponse<JogosAbertos>>(
        `${URLS.JOGOS_ABERTOS}`, 
        // params
    );
};

// Solicitar entrada em um jogo aberto
export const solicitarEntrada = async (agendamentoId: number): Promise<void> => {
    return httpRequests.postMethod<void>(
        `${URLS.JOGOS_ABERTOS}/${agendamentoId}/solicitar-entrada`,
        {}
    );
};

// Aceitar ou recusar entrada em um jogo aberto
export const aceitarOuRecusarEntrada = async (solicitacaoId: number, aceitar: boolean): Promise<void> => {
    return httpRequests.patchMethod<void>(`${URLS.JOGOS_ABERTOS}/solicitacoes/${solicitacaoId}`, { aceitar });
};

export type SolicitacaoJogoAberto = {
    id: number;
    agendamentoId: number;
    solicitanteId: string;
    nomeSolicitante: string;
    telefoneSolicitante: string;
    fotoSolicitante: string;
    status: "PENDENTE" | "ACEITO" | "RECUSADO";
};

// Lista solicitações de um jogo aberto criado pelo usuário
export const listarSolicitacoesJogoAbertoMe = async (agendamentoId: number): Promise<SolicitacaoJogoAberto[]> => {
    return httpRequests.getMethod<SolicitacaoJogoAberto[]>(`${URLS.JOGOS_ABERTOS}/${agendamentoId}/solicitacoes`);
};

export type JogoAbertoMeSolicitado = {
    solicitacaoId: number;
    agendamentoId: number;
    nomeArena: string;
    nomeQuadra: string;
    urlFotoArena: string;
    data: string;
    horarioInicio: string;
    horarioFim: string;
    esporte: TipoQuadra;
    status: "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO";
};

// Lista todos os jogos abertos que o usuário solicitou para participar
export const listarJogosAbertosSolicitadosMe = async (): Promise<JogosAbertos[]> => {
    return httpRequests.getMethod<JogosAbertos[]>(`${URLS.JOGOS_ABERTOS}/minhas-participacoes`);
};

// Sair de um jogo aberto que o usuário foi aceito
export const sairJogoAberto = async (solicitacaoId: number): Promise<void> => {
    return httpRequests.deleteMethod<void>(`${URLS.JOGOS_ABERTOS}/solicitacoes/${solicitacaoId}/sair`);
};
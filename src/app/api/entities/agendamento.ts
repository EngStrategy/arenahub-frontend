import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export type StatusAgendamento = "PENDENTE" | "AUSENTE" | "CANCELADO" | "PAGO";

export type PeriodoAgendamentoFixo = "UM_MES" | "TRES_MESES" | "SEIS_MESES";

export type Agendamento = {
    id: number;
    dataAgendamento: string;
    inicio: string;
    fim: string;
    status: StatusAgendamento;
    quadraId: number;
    nomeQuadra: string;
    atletaId: number;
    nomeAtleta: string;
    numeroJogadoresNecessarios: number;
    publico: boolean;
};


export type AgendamentoCreate = {
    quadraId: number;
    dataAgendamento: string;
    intervaloHorarioId: number;
    esporte: number;
    periodoAgendamentoFixo?: boolean;
    inicio: string;
    fim: string;
    numeroJogadoresNecessarios: number;
    publico?: boolean;
    fixo?: boolean;
};

export type AgendamentoQueryParams = {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "asc" | "desc";
};

export const getAllAgendamentosAtleta = async (
    params: AgendamentoQueryParams = {}
): Promise<httpRequests.PaginatedResponse<Agendamento>> => {
    return httpRequests.getMethod<httpRequests.PaginatedResponse<Agendamento>>(
        `${URLS.AGENDAMENTOS}`,
        params
    );
};

export const getMyAgendamentos = async (
    id: number
): Promise<Agendamento | undefined> => {
    if (!id) {
        console.error("ID do agendamento não fornecido.");
        return undefined;
    }
    return httpRequests.getMethod<Agendamento>(`${URLS.AGENDAMENTOS}/meus-agendamentos`);
};
import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";
import { TipoQuadra } from "./quadra";

export type StatusAgendamento = "PENDENTE" | "AUSENTE" | "CANCELADO" | "PAGO" | "ACEITO" | "RECUSADO" | "FINALIZADO";

export type PeriodoAgendamentoFixo = "UM_MES" | "TRES_MESES" | "SEIS_MESES";

export type StatusDisponibilidade = "DISPONIVEL" | "INDISPONIVEL" | "MANUTENCAO";

export type SlotsHoraio = {
    id: number;
    horarioInicio: string;
    horarioFim: string;
    valor: number;
    statusDisponibilidade: StatusDisponibilidade;
};

export type AgendamentoNormal = {
    id: number;
    dataAgendamento: string;
    horarioInicio: string;
    horarioFim: string;
    valorTotal: number;
    esporte: TipoQuadra;
    status: StatusAgendamento;
    numeroJogadoresNecessarios: number;
    slotsHorario: Array<SlotsHoraio>;
    quadraId: number;
    nomeQuadra: string;
    nomeArena: string;
    urlFotoQuadra: string;
    urlFotoArena: string;
    fixo: boolean;
    publico: boolean;
    possuiSolicitacoes: boolean;
};

export type AgendamentoCreate = {
    quadraId: number;
    dataAgendamento: string;
    slotHorarioIds: Array<number>
    esporte: TipoQuadra;
    periodoFixo?: PeriodoAgendamentoFixo;
    numeroJogadoresNecessarios: number;
    isFixo?: boolean;
    isPublico?: boolean;
};


export type AgendamentoQueryParams = {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "asc" | "desc";
    dataInicio?: string;
    dataFim?: string;
    tipoAgendamento?: "NORMAL" | "FIXO" | "AMBOS";
    status?: StatusAgendamento;
};

export const createAgendamento = async (
    newAgendamento: AgendamentoCreate
): Promise<AgendamentoNormal> => {
    if (!newAgendamento.quadraId || !newAgendamento.dataAgendamento || !newAgendamento.slotHorarioIds || newAgendamento.slotHorarioIds.length === 0) {
        console.warn("Dados insuficientes para criar agendamento.");
        return Promise.reject(new Error("Dados insuficientes para criar agendamento."));
    }
    return httpRequests.postMethod<AgendamentoNormal>(
        URLS.AGENDAMENTOS,
        newAgendamento
    );
};

export const getAllAgendamentosNormalAtleta = async (
    params: AgendamentoQueryParams = {}
): Promise<httpRequests.PaginatedResponse<AgendamentoNormal>> => {
    return httpRequests.getMethod<httpRequests.PaginatedResponse<AgendamentoNormal>>(
        `${URLS.AGENDAMENTOS}/meus-agendamentos`,
        params
    );
}

export const cancelarAgendamentoNormal = async (id: number): Promise<void> => {
    if (!id) {
        console.warn("ID do agendamento não fornecido.");
        return Promise.reject(new Error("ID do agendamento não fornecido."));
    }
    return httpRequests.deleteMethod(`${URLS.AGENDAMENTOS}/${id}`);
}

export const cancelarAgendamentoFixo = async (agendamentoFixoId: number): Promise<void> => {
    if (!agendamentoFixoId) {
        console.warn("ID do agendamento fixo não fornecido.");
        return Promise.reject(new Error("ID do agendamento fixo não fornecido."));
    }
    return httpRequests.deleteMethod(`${URLS.AGENDAMENTOS}/fixo/${agendamentoFixoId}`);
}

// ================================== Agendamentos Arena ==================================

export type StatusAgendamentoArena = "PENDENTE" | "PAGO" | "CANCELADO" | "AUSENTE" | "FINALIZADO";

export type AgendamentoArenaQueryParams = {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "asc" | "desc";
    dataInicio?: string;
    dataFim?: string;
    status?: StatusAgendamentoArena;
    quadraId?: number;
};

export type AgendamentoArena = {
    id: number;
    dataAgendamento: string;
    horarioInicio: string;
    horarioFim: string;
    valorTotal: number;
    status: StatusAgendamentoArena;
    vagasDisponiveis: number;
    esporte: TipoQuadra;
    quadraId: number;
    nomeQuadra: string;
    atletaId: number;
    nomeAtleta: string;
    emailAtleta: string;
    telefoneAtleta: string;
    urlFotoAtleta: string;
    totalParticipantes: number;
    participantes: Array<{
        id: number;
        nome: string;
        email: string;
        telefone: string;
        dataEntrada: string;
    }>;
    slotsHorario: Array<{
        id: number;
        horarioInicio: string;
        horarioFim: string;
        valor: number;
        statusDisponibilidade: "DISPONIVEL" | "INDISPONIVEL";
    }>;
    fixo: boolean;
    publico: boolean;
};

export const getAllAgendamentosArena = async (
    params: AgendamentoArenaQueryParams = {}
): Promise<httpRequests.PaginatedResponse<AgendamentoArena>> => {
    return httpRequests.getMethod<httpRequests.PaginatedResponse<AgendamentoArena>>(
        `${URLS.ARENAAGENDAMENTOS}`,
        params
    );
}
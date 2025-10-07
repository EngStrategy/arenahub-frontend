import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";
import { TipoQuadra } from "./quadra";

export type StatusAgendamento = "PENDENTE" | "AUSENTE" | "CANCELADO" | "PAGO" | "ACEITO" | "RECUSADO" | "FINALIZADO" | "AGUARDANDO_PAGAMENTO";

export type PeriodoAgendamentoFixo = "UM_MES" | "TRES_MESES" | "SEIS_MESES";

export type StatusDisponibilidade = "DISPONIVEL" | "INDISPONIVEL" | "MANUTENCAO";

export type SlotsHoraio = {
    id: number;
    horarioInicio: string;
    horarioFim: string;
    valor: number;
    statusDisponibilidade: StatusDisponibilidade;
};

export type PixPagamentoResponse = {
    agendamentoId: number;
    statusAgendamento: string;
    qrCodeData: string;
    copiaECola: string;
    expiraEm: string;
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
    avaliacao: { idAvaliacao: number, nota: number; comentario?: string } | null;
    avaliacaoDispensada: boolean;
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
    cpfCnpjPagamento?: string;
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

export const getAgendamentosAvaliacoesPendentes = async (): Promise<AgendamentoNormal[]> => {
    return httpRequests.getMethod<AgendamentoNormal[]>(
        `${URLS.AGENDAMENTOS}/avaliacoes-pendentes`
    );
}

export interface AvaliacaoResponse {
    id: number;
    nota: number;
    comentario?: string;
    dataAvaliacao: string;
    nomeAtleta: string;
    urlFotoAtleta: string;
}

export interface AvaliacaoQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "asc" | "desc";
}

export const criarOuDispensarAvaliacao = async (
    agendamentoId: number,
    avaliacao?: { nota?: number; comentario?: string }
): Promise<AvaliacaoResponse> => {
    if (!agendamentoId) {
        console.warn("ID do agendamento não fornecido.");
        return Promise.reject(new Error("ID do agendamento não fornecido."));
    }
    return httpRequests.postMethod(`${URLS.AGENDAMENTOS}/${agendamentoId}/avaliacoes`, avaliacao);
}

export const atualizarAvaliacao = async (
    avaliacaoId: number,
    avaliacao: { nota?: number; comentario?: string }
): Promise<AvaliacaoResponse> => {
    if (!avaliacaoId) {
        console.warn("ID da avaliação não fornecido.");
        return Promise.reject(new Error("ID da avaliação não fornecido."));
    }
    return httpRequests.putMethod(`${URLS.AGENDAMENTOS}/avaliacoes/${avaliacaoId}`, avaliacao);
}

export const criarPagamentoPix = async (
    agendamentoData: AgendamentoCreate
): Promise<PixPagamentoResponse> => {
    return httpRequests.postMethod<PixPagamentoResponse>(
        `${URLS.AGENDAMENTOS}/criar-pagamento-pix`,
        agendamentoData
    );
};

export const getAgendamentoStatus = async (
    agendamentoId: number
): Promise<{ status: StatusAgendamento }> => {
    return httpRequests.getMethod<{ status: StatusAgendamento }>(
        `${URLS.AGENDAMENTOS}/${agendamentoId}/status`
    );
};

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
    atletaId: string;
    nomeAtleta: string;
    emailAtleta: string;
    telefoneAtleta: string;
    urlFotoAtleta: string;
    totalParticipantes: number;
    participantes: Array<{
        id: string;
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

export type AgendamentoExterno = {
    quadraId: number;
    dataAgendamento: string;
    slotHorarioIds: number[];
    esporte: TipoQuadra;
    atletaExistenteId?: string;
    novoAtleta?: {
        nome: string;
        telefone: string;
    };
}

export const createAgendamentoExterno = async (
    agendamento: AgendamentoExterno
): Promise<AgendamentoNormal> => {
    return httpRequests.postMethod<AgendamentoNormal>(
        `${URLS.ARENAAGENDAMENTOS}/externo`,
        agendamento
    );
}

export const getAllAgendamentosArena = async (
    params: AgendamentoArenaQueryParams = {}
): Promise<httpRequests.PaginatedResponse<AgendamentoArena>> => {
    return httpRequests.getMethod<httpRequests.PaginatedResponse<AgendamentoArena>>(
        `${URLS.ARENAAGENDAMENTOS}`,
        params
    );
}

export const updateStatusAgendamentoArena = async (
    agendamentoId: number,
    status: StatusAgendamentoArena
): Promise<void> => {
    if (!agendamentoId) {
        console.warn("ID do agendamento não fornecido.");
        return Promise.reject(new Error("ID do agendamento não fornecido."));
    }
    return httpRequests.patchMethod(`${URLS.ARENAAGENDAMENTOS}/${agendamentoId}/status`, { status });
}

export const getAgendamentosPendentesResolucao = async (): Promise<AgendamentoArena[]> => {
    return httpRequests.getMethod<AgendamentoArena[]>(
        `${URLS.ARENAAGENDAMENTOS}/pendentes-resolucao`
    );
}
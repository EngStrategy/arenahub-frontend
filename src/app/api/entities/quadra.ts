import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";
import { AvaliacaoQueryParams, AvaliacaoResponse } from "./agendamento";

export type TipoQuadra = "FUTEBOL_SOCIETY" | "FUTEBOL_SETE" | "FUTEBOL_ONZE" | "FUTSAL" | "BEACHTENNIS" | "VOLEI" | "FUTEVOLEI" | "BASQUETE" | "HANDEBOL";

export type DiaDaSemana = "DOMINGO" | "SEGUNDA" | "TERCA" | "QUARTA" | "QUINTA" | "SEXTA" | "SABADO";

export type DuracaoReserva = "TRINTA_MINUTOS" | "UMA_HORA" | "UMA_HORA_E_MEIA" | "DUAS_HORAS";

export type MaterialFornecido = "BOLA" | "COLETE" | "LUVA" | "CONE" | "APITO" | "BOMBA" | "MARCADOR_PLACAR" | "BOTAO_GOL";

export type StatusHorario = "DISPONIVEL" | "INDISPONIVEL" | "MANUTENCAO";

export type HorarioFuncionamento = {
    id: number;
    diaDaSemana: DiaDaSemana;
    intervalosDeHorario: Array<{
        id: number;
        inicio: string;
        fim: string;
        valor: number;
        status: StatusHorario;
        slotsDisponiveis: Array<string> | null;
    }>;
};

export type HorarioFuncionamentoCreate = {
    diaDaSemana: DiaDaSemana;
    intervalosDeHorario: Array<{
        inicio: string;
        fim: string;
        valor: number;
        status: StatusHorario;
    }>;
};

export type HorariosDisponiveis = {
    id: number;
    horarioInicio: string;
    horarioFim: string;
    valor: number;
    statusDisponibilidade: StatusHorario;
};


export interface Quadra {
    id: number;
    nomeQuadra: string;
    urlFotoQuadra: string;
    tipoQuadra: Array<TipoQuadra>;
    descricao: string;
    duracaoReserva: DuracaoReserva;
    cobertura: boolean;
    iluminacaoNoturna: boolean;
    materiaisFornecidos: Array<MaterialFornecido>;
    arenaId: string;
    nomeArena: string;
    horariosFuncionamento: Array<HorarioFuncionamento>;
    notaMedia: number;
    quantidadeAvaliacoes: number;
}

export interface QuadraCreate {
    nomeQuadra: string;
    urlFotoQuadra: string;
    tipoQuadra: Array<TipoQuadra>;
    descricao: string;
    duracaoReserva: DuracaoReserva;
    cobertura: boolean;
    iluminacaoNoturna: boolean;
    materiaisFornecidos: Array<MaterialFornecido>;
    arenaId: string;
    horariosFuncionamento: Array<HorarioFuncionamentoCreate>;
}

export interface QuadraUpdate {
    nomeQuadra: string;
    urlFotoQuadra: string;
    tipoQuadra: Array<TipoQuadra>;
    descricao: string;
    cobertura: boolean;
    iluminacaoNoturna: boolean;
    materiaisFornecidos: Array<MaterialFornecido>;
    horariosFuncionamento: Array<HorarioFuncionamentoCreate>;
}


export interface QuadraQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    arenaId?: string;
    esporte?: Array<TipoQuadra>;
}

export const getAllQuadras = async (
    params: QuadraQueryParams = {}
): Promise<httpRequests.PaginatedResponse<Quadra>> => {
    return httpRequests.getMethod<httpRequests.PaginatedResponse<Quadra>>(
        `${URLS.QUADRAS}`,
        params,
    );
};

export const createQuadra = async (newQuadra: QuadraCreate): Promise<Quadra> => {
    return httpRequests.postMethod(URLS.QUADRAS, newQuadra);
};

export const updateQuadra = async (
    id: number,
    updateQuadra: Partial<QuadraUpdate>
): Promise<QuadraUpdate | undefined> => {
    if (!id) {
        console.warn("ID da quadra não fornecido.");
        return undefined;
    }
    return httpRequests.putMethod<QuadraUpdate, Partial<QuadraUpdate>>(
        `${URLS.QUADRAS}/${id}`,
        updateQuadra,
    );
};

export const deleteQuadra = async (id: number): Promise<void> => {
    if (!id) {
        console.warn("ID da quadra não fornecido.");
        return undefined;
    }
    return httpRequests.deleteMethod(`${URLS.QUADRAS}/${id}`,);
};

export const getQuadraById = async (id: number): Promise<Quadra | undefined> => {
    if (!id) {
        console.warn("ID da quadra não fornecido.");
        return undefined;
    }
    return httpRequests.getMethod<Quadra>(`${URLS.QUADRAS}/${id}`);
};

export const getHorariosDisponiveisPorQuadra = async (quadraId: number, data: string): Promise<Array<HorariosDisponiveis>> => {
    if (!quadraId || !data) {
        console.warn("ID da quadra ou data não fornecidos.");
        return [];
    }
    return httpRequests.getMethod<Array<HorariosDisponiveis>>(`${URLS.QUADRAS}/${quadraId}/horarios-disponiveis`, { data });
}

export const getQuadraByIdArena = async (arenaId: string): Promise<Quadra | undefined> => {
    if (!arenaId) {
        console.warn("ID da arena não fornecido.");
        return undefined;
    }
    return httpRequests.getMethod<Quadra>(`${URLS.QUADRAS}/arena/${arenaId}`);
};


export const getAvaliacoesQuadra = async (
    quadraId: number,
    params: AvaliacaoQueryParams = {}
): Promise<httpRequests.PaginatedResponse<AvaliacaoResponse>> => {
    if (!quadraId) {
        console.warn("ID da quadra não fornecido.");
        return Promise.reject(new Error("ID da quadra não fornecido."));
    }
    return httpRequests.getMethod<httpRequests.PaginatedResponse<any>>(
        `${URLS.QUADRAS}/${quadraId}/avaliacoes`,
        params
    );
};
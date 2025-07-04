import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export type TipoQuadra = "FUTEBOL_SOCIETY" | "FUTEBOL_SETE" | "FUTEBOL_ONZE" | "FUTSAL" | "BEACHTENNIS" | "VOLEI" | "FUTEVOLEI" | "BASQUETE" | "HANDEBOL";

export type DiaDaSemana = "DOMINGO" | "SEGUNDA" | "TERCA" | "QUARTA" | "QUINTA" | "SEXTA" | "SABADO";

export type DuracaoReserva = "TRINTA_MINUTOS" | "UMA_HORA" | "UMA_HORA_E_MEIA" | "DUAS_HORAS";

export type MaterialFornecido = "BOLA" | "COLETE" | "LUVA" | "CHUTEIRA" | "CONE";

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
    arenaId: number;
    nomeArena: string;
    horariosFuncionamento: Array<HorarioFuncionamento>;
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
    arenaId: number;
    horariosFuncionamento: Array<HorarioFuncionamentoCreate>;
}

export interface QuadraQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    arenaId?: number;
    esporte?: Array<TipoQuadra>;
    [key: string]: any;
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
    return httpRequests.postMethod(URLS.QUADRAS, newQuadra,);
};

export const updateQuadra = async (
    id: number,
    updateQuadra: Partial<QuadraCreate>
): Promise<QuadraCreate | undefined> => {
    if (!id) {
        console.warn("ID da quadra não fornecido.");
        return undefined;
    }
    return httpRequests.putMethod<QuadraCreate, Partial<QuadraCreate>>(
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

export const getHorariosDisponiveisPorQuadra = async (quadraId: number, data: string): Promise<Array<HorarioFuncionamento>> => {
    if (!quadraId || !data) {
        console.warn("ID da quadra ou data não fornecidos.");
        return [];
    }
    return httpRequests.getMethod<Array<HorarioFuncionamento>>(`${URLS.QUADRAS}/${quadraId}/horarios-disponiveis`, { data });
}

export const getQuadraByIdArena = async (arenaId: number): Promise<Quadra | undefined> => {
    if (!arenaId) {
        console.warn("ID da arena não fornecido.");
        return undefined;
    }
    return httpRequests.getMethod<Quadra>(`${URLS.QUADRAS}/arena/${arenaId}`);
};
import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export interface Arena {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cpfProprietario: string;
    cnpj: string;
    endereco: {
        cep: string;
        estado: string;
        cidade: string;
        bairro: string;
        rua: string;
        numero: string;
        complemento: string;
    };
    descricao: string;
    sports?: string[];
    avaliacao?: number;
    numeroAvaliacoes?: number;
    urlFoto: string;
    role: string;
}

export interface ArenaCreate {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    cpfProprietario: string;
    cnpj: string | null;
    endereco: {
        cep: string;
        estado: string;
        cidade: string;
        bairro: string;
        rua: string;
        numero: string;
        complemento: string | null;
    };
    descricao: string;
    urlFoto: string | null;
}


export interface ArenaQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
    cidade?: string;
    esporte?: "FUTEBOL_SOCIETY" | "FUTEBOL_SETE" | "FUTEBOL_ONZE" | "FUTSAL" | "BEACHTENIS" | "VOLEI" | "FUTEVOLEI" | "BASQUETE" | "HANDEBOL";
    [key: string]: any; // Escolher um tipo melhor
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

/** * Constrói uma string de query URL a partir de um objeto de parâmetros.
 * Filtra valores nulos ou indefinidos.
 * @param params Um objeto com os parâmetros da query.
 * @return Uma string de query (ex: "?page=0&size=10").
 * */
const buildQueryString = (params: ArenaQueryParams = {}): string => {
    const queryParts: string[] = [];
    Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
            queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    });
    return queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
};

/**
 * Busca todas as arenas com filtros opcionais de paginação e ordenação.
 * @param params Parâmetros de query para paginação e ordenação (opcional).
 * @returns Uma promessa que resolve para a resposta paginada de arenas.
 */
const getAllArenas = async (
    accessToken: string,
    params: ArenaQueryParams = {}
): Promise<PaginatedResponse<Arena> | undefined> => {
    try {
        const queryString = buildQueryString(params);
        const response = await httpRequests.getMethod<PaginatedResponse<Arena>>(
            `${URLS.ARENAS}${queryString}`,
            {},
            { Authorization: `Bearer ${accessToken}` }
        );
        return response;
    } catch (error) {
        console.error("Erro ao buscar todas as arenas:", error);
        throw error;
    }
};

/**
 * Busca uma arena específica pelo ID.
 * @param id O ID da arena a ser buscada.
 * @return Uma promessa que resolve para a arena encontrada ou undefined se não encontrada.
 * */
const getArenaById = async (
    accessToken: string,
    id: number
): Promise<Arena | undefined> => {
    if (!id) {
        console.error("ID da arena não fornecido.");
        return undefined;
    }
    try {
        const response = await httpRequests.getMethod<Arena>(
            `${URLS.ARENAS}/${id}`,
            {},
            { Authorization: `Bearer ${accessToken}` }
        );
        return response;
    } catch (error) {
        console.error("Erro ao buscar arena por ID:", error);
        throw error;
    }
};

/** * Cria uma nova arena.
 * @param accessToken O token de acesso do usuário autenticado.
 * @param arena Os dados da arena a serem criados.
 * @return Uma promessa que resolve para a arena criada.
 * */
const createArena = async (
    newArena: ArenaCreate
) => {
    try {
        const response = await httpRequests.postMethod(
            URLS.ARENAS,
            newArena,
        );
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/** * Atualiza uma arena existente.
 * @param accessToken O token de acesso do usuário autenticado.
 * @param id O ID da arena a ser atualizada.
 * @param updatedArena Os dados da arena a serem atualizados (pode ser um objeto parcial ou completo).
 * @return Uma promessa que resolve para a arena atualizada.
 * */
const updateArena = async (
    accessToken: string,
    id: number,
    updatedArena: Partial<Arena>
): Promise<Arena | undefined> => {
    if (!id) {
        console.error("ID da arena não fornecido.");
        return undefined;
    }
    try {
        const response = await httpRequests.putMethod<Arena, Partial<Arena>>(
            `${URLS.ARENAS}/${id}`,
            updatedArena,
            { Authorization: `Bearer ${accessToken}` }
        );
        return response;
    } catch (error) {
        console.error("Erro ao atualizar arena:", error);
        throw error;
    }
};

/** * Exclui uma arena pelo ID.
 * @param accessToken O token de acesso do usuário autenticado.
 * @param id O ID da arena a ser excluída.
 * @return Uma promessa que resolve para o status da exclusão (geralmente um booleano ou void).
 * */
const deleteArena = async (
    accessToken: string,
    id: number
): Promise<void> => {
    if (!id) {
        console.error("ID da arena não fornecido.");
        return;
    }
    try {
        await httpRequests.deleteMethod(
            `${URLS.ARENAS}/${id}`,
            { Authorization: `Bearer ${accessToken}` }
        );
    } catch (error) {
        console.error("Erro ao excluir arena:", error);
        throw error;
    }
};

export {
    getAllArenas,
    getArenaById,
    createArena,
    updateArena,
    deleteArena
};
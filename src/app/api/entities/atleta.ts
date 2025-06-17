import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export interface Atleta {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    urlFoto: string;
    dataCriacao: string;
    role: string;
}

export interface AtletaCreate {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
}

export interface AtletaQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
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

/**
 * Constrói uma string de query URL a partir de um objeto de parâmetros.
 * Filtra valores nulos ou indefinidos.
 * @param params Um objeto com os parâmetros da query.
 * @returns Uma string de query (ex: "?page=0&size=10").
 */
const buildQueryString = (params: AtletaQueryParams = {}): string => {
    const queryParts: string[] = [];
    Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
            queryParts.push(`${key}=${encodeURIComponent(value.toString())}`);
        }
    });

    return queryParts.length ? `?${queryParts.join('&')}` : '';
};

/**
 * Busca todos os atletas com filtros opcionais de paginação e ordenação.
 * @param params Parâmetros de query para paginação e ordenação (opcional).
 * @returns Uma promessa que resolve para a resposta paginada de atletas.
 */
const getAllAtletas = async (
    accessToken: string,
    params: AtletaQueryParams = {}
): Promise<PaginatedResponse<Atleta> | undefined> => {
    try {
        const queryString = buildQueryString(params);
        const response = await httpRequests.getMethod<PaginatedResponse<Atleta>>(
            `${URLS.ATLETAS}${queryString}`,
            {},
            { Authorization: `Bearer ${accessToken}` }
        );
        return response;
    } catch (error) {
        console.error("Erro ao buscar todos os atletas:", error);
        throw error; // Propagar erro para o componente
    }
};

/**
 * Busca um atleta específico pelo seu ID.
 * @param id O ID do atleta a ser buscado.
 * @returns Uma promessa que resolve para o objeto Atleta, ou undefined se não encontrado.
 */
const getAtletaById = async (
    accessToken: string,
    id: number
): Promise<Atleta | undefined> => {
    if (!id) {
        console.error("ID do atleta é obrigatório para buscar por ID.");
        return undefined;
    }
    try {
        const response = await httpRequests.getMethod<Atleta>(
            `${URLS.ATLETAS}/${id}`,
            {},
            { Authorization: `Bearer ${accessToken}` }
        );
        return response;
    } catch (error) {
        console.error(`Erro ao buscar atleta com ID ${id}:`, error);
        throw error;
    }
};
/**
 * Cria um novo atleta.
 * @param newAtleta Os dados do novo atleta (sem o ID, que geralmente é gerado pelo backend).
 * @returns Uma promessa que resolve para o atleta criado (com o ID).
 */
const createAtleta = async (
    newAtleta: AtletaCreate
) => {
    try {
        const response = await httpRequests.postMethod(
            URLS.ATLETAS,
            newAtleta,
        );
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

/**
 * Atualiza um atleta existente.
 * @param id O ID do atleta a ser atualizado.
 * @param updatedAtleta Os dados do atleta a serem atualizados (pode ser um objeto parcial ou completo).
 * @returns Uma promessa que resolve para o atleta atualizado.
 */
const updateAtleta = async (
    accessToken: string,
    id: number,
    updatedAtleta: Partial<Atleta>
): Promise<Atleta | undefined> => {
    if (!id) {
        console.error("ID do atleta não fornecido.");
        return undefined;
    }
    try {
        const response = await httpRequests.putMethod<Atleta, Partial<Atleta>>(
            `${URLS.ATLETAS}/${id}`,
            updatedAtleta,
            { Authorization: `Bearer ${accessToken}` }
        );
        return response;
    } catch (error) {
        console.error("Erro ao atualizar atleta:", error);
        throw error;
    }
};

/**
 * Deleta um atleta pelo seu ID.
 * @param id O ID do atleta a ser deletado.
 * @returns Uma promessa que resolve para `true` se a deleção for bem-sucedida, `false` caso contrário.
 */
const deleteAtleta = async (
    accessToken: string,
    id: number
): Promise<boolean> => {
    if (!id) {
        console.error("ID do atleta é obrigatório para deletar.");
        return false;
    }
    try {
        await httpRequests.deleteMethod(
            `${URLS.ATLETAS}/${id}`,
            { Authorization: `Bearer ${accessToken}` }
        );
        console.log(`Atleta com ID ${id} deletado com sucesso.`);
        return true;
    } catch (error) {
        console.error(`Erro ao deletar atleta com ID ${id}:`, error);
        throw error;
    }
};

export {
    getAllAtletas,
    getAtletaById,
    createAtleta,
    updateAtleta,
    deleteAtleta
};


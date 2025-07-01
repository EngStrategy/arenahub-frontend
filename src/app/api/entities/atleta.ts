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

export const getAllAtletas = async (
    params: AtletaQueryParams = {}
): Promise<httpRequests.PaginatedResponse<Atleta> | undefined> => {
    const queryString = buildQueryString(params);
    return httpRequests.getMethod<httpRequests.PaginatedResponse<Atleta>>(
        `${URLS.ATLETAS}${queryString}`,
        {},
    );
};

export const getAtletaById = async (
    id: number
): Promise<Atleta | undefined> => {
    if (!id) {
        console.error("ID do atleta é obrigatório para buscar por ID.");
        return undefined;
    }
    return httpRequests.getMethod<Atleta>(`${URLS.ATLETAS}/${id}`, {},);
};

export const createAtleta = async (
    newAtleta: AtletaCreate
) => {
    return httpRequests.postMethod(URLS.ATLETAS, newAtleta,);
};

export const updateAtleta = async (
    id: number,
    updatedAtleta: Partial<Atleta>
): Promise<Atleta | undefined> => {
    if (!id) {
        console.error("ID do atleta não fornecido.");
        return undefined;
    }
    return httpRequests.putMethod<Atleta, Partial<Atleta>>(
        `${URLS.ATLETAS}/${id}`,
        updatedAtleta,
    );
};

export const deleteAtleta = async (id: number): Promise<boolean> => {
    if (!id) {
        console.error("ID do atleta é obrigatório para deletar.");
        return false;
    }
    return httpRequests.deleteMethod(`${URLS.ATLETAS}/${id}`,);
};

export const updatePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
): Promise<void> => {
    return httpRequests.patchMethod<void>(
        `${URLS.ATLETAS}/me/alterar-senha`,
        { 
            senhaAtual: currentPassword, 
            novaSenha: newPassword, 
            confirmacaoNovaSenha: confirmNewPassword
        },
    );
}
import { UUID } from "crypto";
import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export interface Atleta {
    id: UUID;
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
    id: UUID
): Promise<Atleta | undefined> => {
    if (!id) {
        console.warn("ID do atleta é obrigatório para buscar por ID.");
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
    id: UUID,
    updatedAtleta: Partial<Atleta>
): Promise<Atleta | undefined> => {
    if (!id) {
        console.warn("ID do atleta não fornecido.");
        return undefined;
    }
    return httpRequests.putMethod<Atleta, Partial<Atleta>>(
        `${URLS.ATLETAS}/${id}`,
        updatedAtleta,
    );
};

export const deleteAtleta = async (id: UUID): Promise<boolean> => {
    if (!id) {
        console.warn("ID do atleta é obrigatório para deletar.");
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

export type AtletaSimple = {
    id: UUID;
    nome: string;
    telefone: string;
    urlFoto: string;
};

export const searchAtletaByNomeOrTelefone = async (
    query: string
): Promise<AtletaSimple[]> => {
    if (!query) {
        console.warn("Consulta é obrigatória para buscar atleta.");
        return [];
    }
    return httpRequests.getMethod<AtletaSimple[]>(
        `${URLS.ATLETAS}/buscar-atleta`,
        { query },
    );
};

export const iniciarProcessoAtivacaoContaAtletaExterno = async (
    telefone: string
): Promise<void> => {
    if (!telefone) {
        console.warn("Telefone do atleta é obrigatório para iniciar o processo de ativação.");
        return;
    }
    return httpRequests.postMethod<void>(
        `${URLS.ATLETAS}/iniciar-ativacao`,
        { telefone }
    );
};

export const ativarContaAtletaExterno = async (
    telefone: string,
    codigo: string,
    email: string,
    senha: string
): Promise<void> => {
    if (!telefone || !codigo || !email || !senha) {
        console.warn("Todos os campos são obrigatórios para ativar a conta.");
        return;
    }
    return httpRequests.postMethod<void>(
        `${URLS.ATLETAS}/ativar-conta`,
        { telefone, codigo, email, senha }
    );
};
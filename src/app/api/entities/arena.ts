import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export interface Arena {
    id: number;
    nome: string;
    email: string;
    telefone: string;
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
    urlFoto: string;
    dataCriacao: string;
    role: string;
    esportes?: string[];
    avaliacao?: number;
    numeroAvaliacoes?: number;
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
    descricao: string | null;
    urlFoto: string | null;
}


export interface ArenaQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
    cidade?: string;
    esporte?: "FUTEBOL_SOCIETY" | "FUTEBOL_SETE" | "FUTEBOL_ONZE" | "FUTSAL" | "BEACHTENNIS" | "VOLEI" | "FUTEVOLEI" | "BASQUETE" | "HANDEBOL";
}

export const getAllArenas = async (
    params: ArenaQueryParams = {}

): Promise<httpRequests.PaginatedResponse<Arena> | undefined> => {
    return httpRequests.getMethod<httpRequests.PaginatedResponse<Arena>>(
        `${URLS.ARENAS}`,
        params,
    );
};

export const getArenaById = async (id: number): Promise<Arena | undefined> => {
    if (!id) {
        console.warn("ID da arena não fornecido.");
        return undefined;
    }
    return httpRequests.getMethod<Arena>(`${URLS.ARENAS}/${id}`,);
};

export const createArena = async (newArena: ArenaCreate) => {
    return httpRequests.postMethod(URLS.ARENAS, newArena,);
};

export const updateArena = async (
    id: number,
    updatedArena: Partial<Arena>
): Promise<Arena | undefined> => {
    if (!id) {
        console.warn("ID da arena não fornecido.");
        return undefined;
    }
    return httpRequests.putMethod<Arena, Partial<Arena>>(
        `${URLS.ARENAS}/${id}`,
        updatedArena,
    );
};

export const deleteArena = async (id: number): Promise<void> => {
    if (!id) {
        console.warn("ID da arena não fornecido.");
        return;
    }
    return httpRequests.deleteMethod(`${URLS.ARENAS}/${id}`,);
};

export const updatePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
): Promise<void> => {
    return httpRequests.patchMethod<void>(
        `${URLS.ARENAS}/me/alterar-senha`,
        { 
            senhaAtual: currentPassword, 
            novaSenha: newPassword, 
            confirmacaoNovaSenha: confirmNewPassword
        },
    );
}
import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export type StatusAssinatura = 'ATIVA' | 'INATIVA' | 'CANCELADA' | 'ATRASADA';
export interface Arena {
    id: string;
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
        latitude?: number | null;
        longitude?: number | null;
    };
    horasCancelarAgendamento: number;
    descricao: string;
    urlFoto: string;
    dataCriacao: string;
    role: string;
    esportes?: string[];
    notaMedia?: number;
    quantidadeAvaliacoes?: number;
    stripeCustomerId?: string | null;
    statusAssinatura?: StatusAssinatura;
}

export interface ArenaCreate {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    cpfProprietario: string;
    cnpj: string | null;
    horasCancelarAgendamento: number;
    endereco: {
        cep: string;
        estado: string;
        cidade: string;
        bairro: string;
        rua: string;
        numero: string;
        complemento: string | null;
        latitude: number | null;
        longitude: number | null;
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
    latitude?: number;
    longitude?: number;
    raioKm?: number;
}

export const getAllArenas = async (
    params: ArenaQueryParams = {}

): Promise<httpRequests.PaginatedResponse<Arena> | undefined> => {
    return httpRequests.getMethod<httpRequests.PaginatedResponse<Arena>>(
        `${URLS.ARENAS}`,
        params,
    );
};

export const getArenaById = async (id: string): Promise<Arena | undefined> => {
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
    id: string,
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

export const deleteArena = async (id: string): Promise<void> => {
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

export type CidadeDTO = {
    nome: string;
    estado: string;
};

export const getCidades = async (): Promise<CidadeDTO[]> => {
    return httpRequests.getMethod<CidadeDTO[]>(`${URLS.ARENAS}/cidades`);
}

export interface DashboardData {
    nomeArena: string;
    receitaDoMes: number;
    percentualReceitaVsMesAnterior: number;
    agendamentosHoje: number;
    taxaOcupacaoHoje: number;
    novosClientes: number;
    diferencaNovosClientesVsSemanaAnterior: number;
    proximosAgendamentos: {
        agendamentoId: number;
        clienteNome: string;
        urlFoto: string;
        quadraNome: string;
        horarioInicio: string;
        horarioFim: string;
        clienteTelefone: string;
    }[];
}

export const getDashboardData = async () => {
    return httpRequests.getMethod<DashboardData>(`${URLS.ARENAS}/dashboard`);
};
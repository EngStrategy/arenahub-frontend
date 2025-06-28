import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { signOut, getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(new Error(error?.message ?? String(error)));
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      console.warn("Interceptor: Recebido 401. Deslogando...");
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        await signOut({ callbackUrl: '/login', redirect: true });
      }
    }
    return Promise.reject(new Error(error?.message ?? String(error)));
  }
);

interface RequestParams {
  [key: string]: any; // Escolher um tipo melhor
}

interface RequestData {
  [key: string]: any; // Escolher um tipo melhor
}

type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

// Escolher um tipo melhor
export const request = async <T = any>(
  method: HttpMethod,
  url: string,
  data: RequestData = {},
  params: RequestParams = {},
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.request({
      method,
      url,
      data,
      params,
      ...config,
    });
    return response.data;
  } catch (error: any) { // Escolher um tipo melhor
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage = error.response.data?.message ?? error.response.data ?? error.response.status;
        console.error("Erro na requisição:", errorMessage);
        throw new Error(`${errorMessage}`);
      }
      if (error.request) {
        throw new Error("Erro de rede: Não foi possível obter uma resposta do servidor.");
      }
    }
    throw new Error(`Erro desconhecido: ${error.message ?? String(error)}`);
  }
};

// Escolher um tipo melhor
export const getMethod = async <T = any>(url: string, params: RequestParams = {}, headers?: Record<string, string>): Promise<T> => {
  return request<T>("get", url, {}, params, { headers });
};

// Escolher um tipo melhor
export const postMethod = async <T = any, D extends RequestData = RequestData>(url: string, data: D = {} as D, headers?: Record<string, string>): Promise<T> => {
  return request<T>("post", url, data, {}, { headers });
};

// Escolher um tipo melhor
export const putMethod = async <T = any, D extends RequestData = RequestData>(url: string, data: D = {} as D, headers?: Record<string, string>): Promise<T> => {
  return request<T>("put", url, data, {}, { headers });
};

// Escolher um tipo melhor
export const deleteMethod = async <T = any>(url: string, headers?: Record<string, string>): Promise<T> => {
  return request<T>("delete", url, {}, {}, { headers });
};

// Escolher um tipo melhor
export const patchMethod = async <T = any, D extends RequestData = RequestData>(url: string, data: D = {} as D, headers?: Record<string, string>): Promise<T> => {
  return request<T>("patch", url, data, {}, { headers });
};
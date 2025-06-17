import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
        // O servidor respondeu com um status de erro
        const errorMessage = error.response.data?.message ?? error.response.data ?? error.response.status;
        throw new Error(`${errorMessage}`);
      }
      if (error.request) {
        // A requisição foi feita, mas não houve resposta
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
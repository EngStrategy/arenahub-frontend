import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";
import { User } from 'next-auth';

export const getMe = async (): Promise<User | undefined> => {
    return httpRequests.getMethod<User>(`${URLS.AUTENTICACAO}/me`);
};
import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export interface VerifyEmailPayload {
    email: string;
    code: string;
}

export interface ResetPasswordPayload {
    email: string;
    newPassword: string;
    confirmation: string;
    passwordMatch: boolean;
}

// Verifica o código no email do usuário após o cadastro
export const verifyEmail = async (data: VerifyEmailPayload): Promise<void> => {
    return httpRequests.postMethod(URLS.VERIFY_EMAIL, data);
};

// Verifica o código de redefinição de senha de forgotPassword
export const verifyResetCode = async (data: VerifyEmailPayload): Promise<void> => {
    return httpRequests.postMethod(URLS.VERIFY_RESET_CODE, data);
}

// Redefine a senha do usuário após a verificação do código do verifyResetCode
export const resetPassword = async (data: ResetPasswordPayload): Promise<void> => {
    return httpRequests.postMethod(URLS.RESET_PASSWORD, data);
}

// Após o cadastro, solicita o reenvio do email de verificação
export const resendVerificationEmail = async (email: string): Promise<void> => {
    return httpRequests.postMethod(URLS.RESEND_VERIFICATION_EMAIL, { email });
};

// Solicita o envio de um email para redefinição de senha
export const forgotPassword = async (email: string): Promise<void> => {
    return httpRequests.postMethod(URLS.FORGOT_PASSWORD, { email });
}
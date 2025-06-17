import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export interface VerifyEmailPayload {
    email: string;
    code: string;
}

export const verifyEmail = async (data: VerifyEmailPayload): Promise<void> => {
    try {
        await httpRequests.postMethod(URLS.VERIFY_EMAIL, data);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
        await httpRequests.postMethod(URLS.RESEND_VERIFICATION_EMAIL, { email });
    } catch (error) {
        console.error("API Error in resendVerificationEmail:", error);
        throw error;
    }
};
import * as httpRequests from "../common/api_requests";
import { URLS } from "../common/endpoints";

export interface VerifyEmailPayload {
    email: string;
    code: string;
}

export const verifyEmail = async (data: VerifyEmailPayload): Promise<void> => {
    return httpRequests.postMethod(URLS.VERIFY_EMAIL, data);
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
    return httpRequests.postMethod(URLS.RESEND_VERIFICATION_EMAIL, { email });
};
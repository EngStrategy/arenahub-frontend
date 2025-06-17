"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { Button, Input, App } from "antd";
import Image from "next/image";
import {
    verifyEmail,
    resendVerificationEmail,
    VerifyEmailPayload
} from "../api/entities/verifyEmail";
import Loading from "../loading";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";

function ConfirmEmailComponent() {
    const { message } = App.useApp();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [timer, setTimer] = useState(120);

    useEffect(() => {
        const emailFromUrl = searchParams.get("email");
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        } else {
            message.error("Email não fornecido.", 5);
            router.push("/register");
        }
    }, [searchParams, router, message]);

    useEffect(() => {
        if (timer <= 0) return;

        const intervalId = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timer]);

    const handleVerifyCode = async () => {
        if (code.length !== 6) {
            message.warning("Por favor, insira o código de 6 dígitos.");
            return;
        }

        setLoading(true);
        message.loading({ content: "Verificando código...", key: "verify" });

        try {
            const payload: VerifyEmailPayload = { email, code };
            await verifyEmail(payload);

            message.success({ content: "Email verificado com sucesso!", key: "verify", duration: 2 });
            router.push("/login");

        } catch (error) {
            console.error("Erro ao verificar o código:", error);
            message.error({ content: "Código inválido ou expirado. Tente novamente.", key: "verify", duration: 4 });
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) return;

        setLoading(true);
        message.loading({ content: "Reenviando código...", key: "resend" });

        try {
            await resendVerificationEmail(email);
            message.success({ content: `Um novo código foi enviado para ${email}`, key: "resend", duration: 3 });
            setTimer(120);
        } catch (error) {
            console.error("Erro ao reenviar o código:", error);

            let errorMessage = "Não foi possível reenviar o código. Tente mais tarde.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            message.error({ content: errorMessage, key: "resend", duration: 4 });

        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return <Loading />;
    }

    return (
        <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center">
            <div className="hidden md:block md:w-2/3 p-4">
                <Image src="/icons/beachtenis.svg" alt="Beach Tenis" width={700} height={700} />
            </div>
            <div className="w-full md:w-1/3 p-4">
                <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center justify-center p-3 rounded-full bg-green-primary">
                        <Image
                            src="/icons/email.svg"
                            alt="Email Icon"
                            width={24}
                            height={24}
                        />
                    </div>
                </div>
                <p className="text-center text-gray-800 font-semibold text-2xl mb-2">
                    Confirme seu e-mail
                </p>
                <p className="mb-4 text-center text-gray-600">
                    Um código foi enviado para <b>{email}</b>.
                    <br />
                    Insira-o abaixo:
                </p>

                <div className="flex justify-center mb-4">
                    <Input.OTP
                        length={6}
                        value={code}
                        onChange={setCode}
                        disabled={loading}
                    />
                </div>
                <p className="mb-4 text-center text-sm text-gray-500">
                    Não recebeu o código? Verifique sua caixa de lixo eletrônico (SPAM)
                    ou aguarde para reenviar.
                </p>

                <div className="text-center text-gray-500 mb-4">
                    {timer > 0 ? (
                        <span>{`Aguarde ${String(timer).padStart(2, "0")}s para reenviar`}</span>
                    ) : (
                        <Button
                            type="link"
                            disabled={loading}
                            onClick={handleResendCode}
                            className="!h-auto !align-baseline !text-green-500 hover:!text-green-500 focus:!text-green-500"
                        >
                            Reenviar código
                        </Button>
                    )}
                </div>

                <ButtonPrimary
                    text="Confirmar"
                    type="primary"
                    onClick={handleVerifyCode}
                    loading={loading}
                    disabled={code.length !== 6 || loading}
                    className="w-full"
                />
            </div>
        </div>
    );
}

export default function ConfirmEmailPage() {
    return (
        <Suspense fallback={<Loading />} >
            <ConfirmEmailComponent />
        </Suspense>
    );
}
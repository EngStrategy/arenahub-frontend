"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Input, App, Flex, Typography } from "antd";
import Image from "next/image";
import {
    verifyEmail,
    resendVerificationEmail,
    VerifyEmailPayload
} from "@/app/api/entities/verifyEmail";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { useTheme } from "@/context/ThemeProvider";

const ConfirmEmailSkeleton = () => (
    <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center animate-pulse">
        <div className="hidden md:block md:w-2/3 p-4">
            <div className="h-[300px] w-[300px] bg-gray-300 rounded-full mx-auto"></div>
        </div>
        <div className="w-full md:w-1/3 p-4">
            <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-300 rounded-md w-3/4 mx-auto mb-3"></div>
            <div className="space-y-2 text-center mx-auto max-w-xs">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="flex justify-center my-8 space-x-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-14 w-12 bg-gray-300 rounded-md"></div>
                ))}
            </div>
            <div className="h-4 bg-gray-300 rounded w-full max-w-xs mx-auto mb-4"></div>
            <div className="h-5 bg-gray-300 rounded w-32 mx-auto mb-4"></div>
            <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
        </div>
    </div>
);

export default function ConfirmEmailPage() {
    const { message } = App.useApp();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isDarkMode } = useTheme();

    const [pageLoading, setPageLoading] = useState(true);
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
        setPageLoading(false);
    }, [searchParams, router, message]);

    useEffect(() => {
        if (timer <= 0) return;
        const intervalId = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timer]);

    const handleVerifyCode = useCallback(async () => {
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
    }, [code, email, message, router]);

    useEffect(() => {
        if (code.length === 6) {
            handleVerifyCode();
        }
    }, [code, handleVerifyCode]);

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

    if (pageLoading) {
        return <ConfirmEmailSkeleton />;
    }

    return (
        <Flex 
        align="center" 
        justify="center" 
        className="flex-1 sm:!px-10 lg:!px-40"
        style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
        >
            <Flex align="flex-start" justify="center" className="!hidden md:!flex md:!w-2/3">
                <Image
                    src="/icons/beachtenis.svg"
                    alt="Beach Tenis"
                    width={400}
                    height={400}
                    className="!sticky !top-20 !w-full !object-cover"
                />
            </Flex>

            <Flex align="center" vertical justify="center" className="!w-full md:!w-1/3 !p-6">
                <Flex align="center" justify="center" className="!mb-4">
                    <Flex align="center" justify="center" className="!p-2 rounded-full bg-green-primary">
                        <Image
                            src="/icons/email.svg"
                            alt="Email Icon"
                            width={24}
                            height={24}
                        />
                    </Flex>
                </Flex>
                <Typography.Title level={4} className="text-center mb-2">
                    Confirme seu e-mail
                </Typography.Title>
                <Typography.Text type="secondary" className="mb-4 text-center">
                    Um código foi enviado para <Typography.Text strong italic>{email}</Typography.Text>.
                    <br />
                    Insira-o abaixo:
                </Typography.Text>

                <Flex justify="center" className="!mb-4">
                    <Input.OTP
                        length={6}
                        value={code}
                        onChange={setCode}
                        disabled={loading}
                    />
                </Flex>
                <Typography.Text type="secondary" className="mb-4 text-center">
                    Não recebeu o código? Verifique sua caixa de lixo eletrônico (SPAM)
                    ou aguarde para reenviar.
                </Typography.Text>

                <div className="text-center text-gray-500 mb-4">
                    {timer > 0 ? (
                        <Typography.Text >{`Aguarde ${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')} para reenviar`}</Typography.Text>
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
            </Flex>
        </Flex>
    );
}
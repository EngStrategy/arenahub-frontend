"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, App, Grid } from "antd";
// 1. Importado o ícone de Check (V)
import { GrSecure } from "react-icons/gr";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { resetPassword } from "@/app/api/entities/verifyEmail";
import { CheckOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

export default function RedefinirSenha() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const emailFromQuery = searchParams.get("email");
        if (emailFromQuery) {
            setUserEmail(decodeURIComponent(emailFromQuery));
        } else {
            message.error({
                content: "Email não encontrado. Você será redirecionado.",
                duration: 3,
            });
            router.push("/login");
        }
    }, [searchParams, router, message]);

    useEffect(() => {
        if (isSuccess) {
            if (countdown === 0) {
                router.push("/login");
                return;
            }

            const intervalId = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [isSuccess, countdown, router]);

    const handleResetPassword = useCallback(
        async (values: any) => {
            setLoading(true);
            message.loading({
                content: "Atualizando sua senha...",
                key: "resetPassword",
            });
            try {
                await resetPassword({
                    email: userEmail,
                    newPassword: values.password,
                    confirmation: values.confirmPassword,
                    passwordMatch: values.password === values.confirmPassword
                });

                setIsSuccess(true);
                message.success({
                    content: "Senha redefinida com sucesso!",
                    key: "resetPassword",
                    duration: 3,
                });

            } catch (error: any) {
                const errorMessage = error.message ?? "Não foi possível redefinir sua senha. Tente novamente.";
                message.error({
                    content: errorMessage,
                    key: "resetPassword",
                    duration: 4,
                });
            } finally {
                setLoading(false);
            }
        },
        [userEmail, router, message] // Removido router daqui, pois não é mais usado diretamente
    );

    return (
        <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center">
            {screens.md && (
                <div className="w-2/3 p-4">
                    <Image
                        src="/icons/beachtenis.svg"
                        alt="Beach Tenis"
                        width={700}
                        height={700}
                        priority
                    />
                </div>
            )}
            <div className="w-full md:w-1/3 p-4">
                {isSuccess ? (
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex items-center justify-center p-3 rounded-full bg-green-primary">
                                <CheckOutlined className="!text-white text-xl" />
                            </div>
                        </div>
                        <p className="text-center text-gray-600 font-semibold text-lg mb-2">
                            Senha alterada com sucesso!
                        </p>
                        <p className="text-center text-gray-500 mb-4 text-md">
                            Lembre-se: senhas iguais em vários lugares podem ser um risco. Crie combinações únicas!
                        </p>
                        <p className="text-center text-gray-500 mb-6 text-md">
                            Redirecionando em <strong>{countdown}</strong> segundos.
                        </p>
                        <Link href="/login" className="text-green-primary hover:!text-green-500 mb-4">
                            <ButtonPrimary
                                text="Continuar para o Login"
                                type="primary"
                                htmlType="button"
                                className="w-full"
                            />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex items-center justify-center p-3 rounded-full bg-green-primary">
                                <GrSecure className="text-xl text-white" />
                            </div>
                        </div>
                        <p className="text-center text-gray-600 font-medium text-lg mb-4">
                            Redefinir Senha
                        </p>
                        <p className="text-center text-gray-500 mb-4 text-md">
                            Escolha uma nova senha para sua conta.
                        </p>
                        <Form
                            form={form}
                            layout="vertical"
                            name="reset_password"
                            onFinish={handleResetPassword}
                            autoComplete="off"
                            className="w-full"
                        >
                            <Form.Item
                                name="password"
                                label="Nova Senha"
                                rules={[
                                    { required: true, message: "Por favor, insira sua nova senha!" },
                                    { min: 8, message: "A senha deve ter no mínimo 8 caracteres." },
                                ]}
                                hasFeedback
                            >
                                <Input.Password placeholder="Digite a nova senha" />
                            </Form.Item>
                            <Form.Item
                                name="confirmPassword"
                                label="Confirmar Nova Senha"
                                dependencies={["password"]}
                                hasFeedback
                                rules={[
                                    { required: true, message: "Confirme sua nova senha!" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue("password") === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("As senhas não coincidem!"));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Confirme a nova senha" />
                            </Form.Item>
                            <ButtonPrimary
                                text="Confirmar e Salvar"
                                type="primary"
                                htmlType="submit"
                                className="w-full"
                                loading={loading}
                            />
                            <p className="text-gray-800 text-sm mt-4">
                                <Link
                                    href="/login"
                                    className="flex flex-row items-center gap-1 text-green-primary hover:!text-green-500"
                                >
                                    <IoArrowBackOutline /> Voltar para a página de login
                                </Link>
                            </p>
                        </Form>
                    </>
                )}
            </div>
        </div>
    );
}
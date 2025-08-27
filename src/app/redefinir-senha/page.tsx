"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, App, Grid, Flex, Typography, Popover, Progress } from "antd";
import { GrSecure } from "react-icons/gr";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { resetPassword } from "@/app/api/entities/verifyEmail";
import { CheckOutlined } from "@ant-design/icons";
import { useCapsLock } from "@/context/hooks/use-caps-look";
import CapsLock from "@/components/Alerts/CapsLock";
import { useTheme } from "@/context/ThemeProvider";

const { useBreakpoint } = Grid;

const PasswordStrengthIndicator = ({ password = '' }: { password?: string }) => {
    const evaluatePassword = () => {
        let score = 0;
        if (password.length >= 8) score += 25;
        if (/\d/.test(password)) score += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;
        return score;
    };

    const score = evaluatePassword();
    let color = 'red';
    let text = 'Fraca';

    if (score >= 75) {
        color = 'green';
        text = 'Forte';
    } else if (score >= 50) {
        color = 'orange';
        text = 'Média';
    }

    return (
        <div className="w-full">
            <p className="mb-2 font-medium">Força da senha: {text}</p>
            <Progress percent={score} showInfo={false} strokeColor={color} />
            <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                <li className={password.length >= 8 ? 'text-green-600' : ''}>
                    Pelo menos 8 caracteres
                </li>
                <li className={/\d/.test(password) ? 'text-green-600' : ''}>
                    Pelo menos um número
                </li>
                <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-600' : ''}>
                    Letras maiúsculas e minúsculas
                </li>
                <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>
                    Pelo menos um caractere especial
                </li>
            </ul>
        </div>
    );
};

const RedefinirSenhaSkeleton = () => (
    <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center animate-pulse">
        <div className="hidden md:block md:w-2/3 p-4">
            <div className="h-[300px] w-[300px] bg-gray-300 rounded-full mx-auto"></div>
        </div>
        <div className="w-full md:w-1/3 p-4">
            <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-7 bg-gray-300 rounded-md w-1/2 mx-auto mb-4"></div>
            <div className="h-5 bg-gray-300 rounded-md w-3/4 mx-auto mb-6"></div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                </div>
            </div>
            <div className="h-12 bg-gray-300 rounded-lg w-full mt-6"></div>
            <div className="h-5 bg-gray-300 rounded w-1/2 mx-auto mt-4"></div>
        </div>
    </div>
);

export default function RedefinirSenha() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const screens = useBreakpoint();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isDarkMode } = useTheme();

    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const capsLockEstaAtivado = useCapsLock();

    const [password, setPassword] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    useEffect(() => {
        const emailFromQuery = searchParams.get("email");
        if (emailFromQuery) {
            setUserEmail(decodeURIComponent(emailFromQuery));
        } else {
            message.error({ content: "Email não encontrado. Você será redirecionado.", duration: 3 });
            router.push("/login");
        }
        setPageLoading(false);
    }, [searchParams, router, message]);

    useEffect(() => {
        if (isSuccess && countdown > 0) {
            const intervalId = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
            return () => clearInterval(intervalId);
        } else if (isSuccess && countdown === 0) {
            router.push("/login");
        }
    }, [isSuccess, countdown, router]);

    const handleResetPassword = useCallback(async (values: any) => {
        setLoading(true);
        message.loading({ content: "Atualizando sua senha...", key: "resetPassword" });
        try {
            await resetPassword({
                email: userEmail,
                newPassword: password,
                confirmation: values.confirmPassword,
                passwordMatch: values.password === values.confirmPassword
            });
            setIsSuccess(true);
            message.success({ content: "Senha redefinida com sucesso!", key: "resetPassword", duration: 3 });
        } catch (error: any) {
            const errorMessage = error.message ?? "Não foi possível redefinir sua senha.";
            message.error({ content: errorMessage, key: "resetPassword", duration: 4 });
        } finally {
            setLoading(false);
        }
    }, [userEmail, message]);

    if (pageLoading) {
        return <RedefinirSenhaSkeleton />;
    }

    return (
        <Flex
            align="center"
            justify="center"
            className={`sm:!px-10 lg:!px-40 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}
        >
            {
                screens.md && (
                    <div className="w-2/3 p-4">
                        <Image src="/icons/beachtenis.svg" alt="Beach Tenis" width={700} height={700} priority />
                    </div>
                )
            }
            < div className="w-full md:w-1/3 p-4" >
                {
                    isSuccess ? (
                        <div className="text-center" >
                            <Flex align="center" justify="center" className="!mb-4">
                                <Flex align="center" justify="center" className="!p-2 rounded-full bg-green-primary">
                                    <CheckOutlined className="!text-white text-xl" />
                                </Flex>
                            </Flex>
                            <Typography.Title level={4} className="mb-2">Senha alterada com sucesso!</Typography.Title>

                            <Flex align="center" justify="center" vertical className="!mb-4">
                                <Typography.Text type="secondary">Lembre-se: senhas iguais em vários lugares podem ser um risco.</Typography.Text>
                                <Typography.Text>Redirecionando em <strong>{countdown}</strong> segundos.</Typography.Text>
                            </Flex>

                            <Link href="/login" className="text-green-primary hover:!text-green-500">
                                <ButtonPrimary text="Continuar para o Login" htmlType="button" className="w-full" size="large" />
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Flex align="center" justify="center" className="!mb-4">
                                <Flex align="center" justify="center" className="!p-2 rounded-full bg-green-primary">
                                    <GrSecure className="text-xl text-white" />
                                </Flex>
                            </Flex>
                            <Flex align="center" justify="center" vertical className="!mb-4">
                                <Typography.Title level={4}>Redefinir Senha</Typography.Title>
                                <Typography.Text type="secondary">Escolha uma nova senha para sua conta.</Typography.Text>
                            </Flex>
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
                                        { required: password == '', message: "Por favor, insira sua nova senha!" },
                                        { min: 8, message: "A senha deve ter no mínimo 8 caracteres." },
                                    ]}
                                    hasFeedback
                                    className="sem-asterisco"
                                >
                                    <Popover
                                        content={<PasswordStrengthIndicator password={password} />}
                                        placement="top"
                                        open={isPasswordFocused}
                                        getPopupContainer={triggerNode => triggerNode.parentNode as HTMLElement}
                                    >
                                        <Input.Password
                                            placeholder="Digite a nova senha"
                                            onFocus={() => setIsPasswordFocused(true)}
                                            onBlur={() => setIsPasswordFocused(false)}
                                            onChange={(e) => {
                                                const newPassword = e.target.value;
                                                setPassword(newPassword);
                                                form.setFieldsValue({ senha: newPassword });
                                            }}
                                            onCopy={(e) => {
                                                e.preventDefault();
                                                message.warning("Copiar senha não é permitido!");
                                            }}
                                        />
                                    </Popover>
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
                                                if (!value || password === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error("As senhas não coincidem!"));
                                            },
                                        }),
                                    ]}
                                    className="sem-asterisco"
                                >
                                    <Input.Password
                                        placeholder="Confirme a nova senha"
                                        onCopy={(e) => {
                                            e.preventDefault();
                                            message.warning("Copiar senha não é permitido!");
                                        }}
                                    />
                                </Form.Item>

                                {capsLockEstaAtivado && (
                                    <CapsLock />
                                )}

                                <ButtonPrimary text="Confirmar e Salvar" type="primary" htmlType="submit" className="w-full" loading={loading} />
                                <p className="text-gray-800 text-sm mt-4">
                                    <Link href="/login" className="flex flex-row items-center gap-1 text-green-primary hover:!text-green-500">
                                        <IoArrowBackOutline /> Voltar para a página de login
                                    </Link>
                                </p>
                            </Form>
                        </div>
                    )
                }
            </div >
        </Flex >
    );
}
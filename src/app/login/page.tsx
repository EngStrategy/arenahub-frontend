"use client";

import { useAuth } from "@/context/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Checkbox, Form, Input, App, Flex, Typography, type AutoCompleteProps, AutoComplete } from 'antd';
import Link from "next/link"
import Image from "next/image";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { useCapsLock } from "@/context/hooks/use-caps-look";
import CapsLock from "@/components/Alerts/CapsLock";
import { useTheme } from "@/context/ThemeProvider";

const LoginSkeleton = () => (
    <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center animate-pulse">
        <div className="hidden md:block md:w-2/3 p-4">
            <div className="h-[300px] w-[300px] bg-gray-300 rounded-full mx-auto"></div>
        </div>
        <div className="w-full md:w-1/3 p-4">
            <div className="h-6 bg-gray-300 rounded-md w-3/4 mx-auto mb-8"></div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                <div className="h-5 bg-gray-300 rounded w-4/5 mx-auto"></div>
            </div>
        </div>
    </div>
);

export default function Login() {
    const { signIn, getSession } = useAuth();
    const { message } = App.useApp();
    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isDarkMode } = useTheme();
    const [options, setOptions] = React.useState<AutoCompleteProps['options']>([]);

    const capsLockEstaAtivado = useCapsLock();
    const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/confirm-email", "redefinir-senha"];
    const callbackUrl = searchParams.get("callbackUrl");

    const handleSearch = (value: string) => {
        setOptions(() => {
            if (!value || value.includes('@')) {
                return [];
            }
            return ['gmail.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'yahoo.com', 'live.com', 'aol.com', 'protonmail.com', 'zoho.com', 'gmx.com'].map((domain) => ({
                label: `${value}@${domain}`,
                value: `${value}@${domain}`,
            }));
        });
    };

    useEffect(() => {
        setPageLoading(false);
    }, []);

    const onFinishFailed = (): void => {
        message.error("Por favor, corrija os erros no formulário.");
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const responseNextAuth = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (responseNextAuth?.error) {
                message.error(responseNextAuth.error);
                return;
            }

            if (responseNextAuth?.ok) {
                const session = await getSession();
                let destination = "/";

                if (session?.user?.role === "ARENA") {
                    destination = "/dashboard";
                } else if (callbackUrl) {
                    try {
                        const callbackPathname = new URL(callbackUrl, window.location.origin).pathname;

                        if (!authRoutes.includes(callbackPathname)) {
                            destination = callbackUrl;
                        }
                    } catch (e) {
                        console.error("URL de callback inválida, usando destino padrão.", e);
                    }
                }

                router.push(destination);

            } else {
                message.error("Ocorreu um erro inesperado. Por favor, tente novamente.");
            }
        } catch (error) {
            console.error("Falha no processo de login:", error);
            message.error("Falha ao tentar fazer login. Verifique sua conexão.");
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <LoginSkeleton />;
    }

    return (
        <Flex
            align="center"
            justify="center"
            className={`flex-1 sm:!px-10 lg:!px-40 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}
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

            <Flex align="center" justify="center" className="!w-full md:!w-1/3">
                <div className="p-6 sm:p-8 w-full">
                    <Flex justify="center" vertical>
                        <Typography.Title level={4} className="text-center !mb-4">
                            Faça login para continuar acessando
                        </Typography.Title>
                        <Form
                            layout="vertical"
                            name="login"
                            style={{ maxWidth: 600 }}
                            initialValues={{ remember: false }}
                            onFinish={handleSubmit}
                            onFinishFailed={onFinishFailed}
                        >
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: "Insira seu email!" },
                                    { type: "email", message: "Insira um email válido!" },
                                ]}
                                className="sem-asterisco"
                            >
                                <AutoComplete
                                    onSearch={handleSearch}
                                    placeholder="Insira seu email"
                                    options={options}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Senha"
                                name="password"
                                rules={[{ required: true, message: 'Insira sua senha!' }]}
                                className="sem-asterisco !mb-2"
                            >
                                <Input.Password
                                    placeholder="Insira sua senha"
                                    onCopy={(e) => {
                                        e.preventDefault();
                                        message.warning("Copiar senha não é permitido!");
                                    }}
                                />
                            </Form.Item>

                            {capsLockEstaAtivado && (
                                <CapsLock />
                            )}

                            <Form.Item name="remember" valuePropName="checked" label={null} className="!my-2">
                                <Flex align="center" justify="space-between">
                                    <Checkbox className="custom-green-checkbox">
                                        Lembrar de mim
                                    </Checkbox>
                                    <Link
                                        href="/forgot-password"
                                        className="text-green-primary hover:!underline hover:!underline-offset-4 hover:!text-green-500"
                                    >
                                        Esqueceu sua senha?
                                    </Link>
                                </Flex>
                            </Form.Item>

                            <ButtonPrimary
                                text="Entrar"
                                htmlType="submit"
                                loading={loading}
                                disabled={loading}
                                className="w-full mb-4"
                            />
                            <Typography.Text>
                                Não tem uma conta?{" "}
                                <Link
                                    href="/register"
                                    className="!underline !underline-offset-4 !text-green-500 hover:!text-green-500 ">
                                    Cadastre-se
                                </Link>
                            </Typography.Text>
                        </Form>
                    </Flex>
                </div>
            </Flex>
        </Flex>
    )
}
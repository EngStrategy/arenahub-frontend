"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Checkbox, Form, Input, App } from 'antd';
import Link from "next/link"
import Image from "next/image";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { useCapsLock } from "@/context/hooks/useCapsLook";
import { ExclamationCircleFilled } from "@ant-design/icons";

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
    const { message } = App.useApp();
    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const capsLockEstaAtivado = useCapsLock();
    const authRoutes = ["/login", "/register", "/forgot-password"];
    const callbackUrl = searchParams.get("callbackUrl");

    useEffect(() => {
        setPageLoading(false);
    }, []);

    const onFinishFailed = (): void => {
        message.error("Por favor, corrija os erros no formulário.");
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        const responseNextAuth = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        });
        setLoading(false);

        if (responseNextAuth?.error) {
            message.error(responseNextAuth.error);
            return;
        }

        if (responseNextAuth?.ok) {
            if (callbackUrl && !authRoutes.includes(new URL(callbackUrl, 'http://localhost').pathname)) {
                router.push(callbackUrl);
                return;
            }
            const session = await getSession();
            if (session?.user?.role === "ARENA") {
                router.push("/dashboard");
            } else {
                router.push("/");
            }
        } else {
            setLoading(false);
            message.error("Ocorreu um erro inesperado. Por favor, tente novamente.");
        }
    };

    // Renderiza o skeleton durante o carregamento inicial
    if (pageLoading) {
        return <LoginSkeleton />;
    }

    return (
        <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center">
            <div className="hidden md:block md:w-2/3 p-4">
                <Image
                    src="/icons/beachtenis.svg"
                    alt="Beach Tenis"
                    width={700}
                    height={700}
                />
            </div>
            <div className="w-full md:w-1/3 p-4">
                <p className="text-center text-gray-600 font-medium text-lg mb-4">Faça login para continuar acessando</p>
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
                        <Input
                            placeholder="Insira seu email"
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
                        />
                    </Form.Item>

                    {capsLockEstaAtivado && (
                        <div role="alert" className="flex items-center gap-2 text-orange-600 mb-4 transition-opacity duration-300 animate-pulse">
                            <ExclamationCircleFilled />
                            <span className="text-sm font-medium">CapsLock está ativado</span>
                        </div>
                    )}

                    <Form.Item name="remember" valuePropName="checked" label={null} className="!my-2">
                        <div className="flex flex-row flex-wrap justify-between items-center gap-x-4 gap-y-2">
                            <Checkbox className="custom-green-checkbox">
                                Lembrar de mim
                            </Checkbox>
                            <Link
                                href="/forgot-password"
                                className="text-green-primary hover:!underline hover:!underline-offset-4 hover:!text-green-500"
                            >
                                Esqueceu sua senha?
                            </Link>
                        </div>
                    </Form.Item>

                    <ButtonPrimary
                        text="Entrar"
                        htmlType="submit"
                        loading={loading}
                        disabled={loading}
                        className="w-full"
                    />
                    <p className="text-gray-800 text-sm mt-4">
                        Não tem uma conta? <Link href="/register" className="!underline underline-offset-4 text-green-primary hover:!text-green-500 ">Cadastre-se</Link>
                    </p>
                </Form>
            </div>
        </div>
    )
}
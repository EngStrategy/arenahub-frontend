"use client";

import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Checkbox, Form, Input, App } from 'antd';
import Link from "next/link"
import Image from "next/image";
import { ButtonPrimary } from "@/components/ButtonPrimary";

export default function Login() {
    const { data: session, status } = useSession();
    const { message } = App.useApp();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);


    const authRoutes = ["/login", "/register", "/forgot-password"];

    const callbackUrl = searchParams.get("callbackUrl");

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "ARENA") {
            router.push("/dashboard");
        }
    }, [status, router, session?.user?.role]);

    const onFinishFailed = (): void => {
        message.error("Por favor, corrija os erros no formulário.");
    };

    const handleSubmit = async (values: any) => { // Escolher um tipo melhor
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
            const session = await getSession();

            if (session?.user?.role === "ARENA") {
                router.push("/dashboard");
                return;
            }

            if (callbackUrl && !authRoutes.includes(new URL(callbackUrl).pathname)) {
                router.push(callbackUrl);
            } else {
                router.push("/");
            }
        } else {
            setLoading(false);
            message.error("Ocorreu um erro inesperado. Por favor, tente novamente.");
        }
    };

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
"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Button, Form, Input, App } from "antd";
import { GrSecure } from "react-icons/gr";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPassword() {
    const { message } = App.useApp();
    const [errors, setErrors] = useState<string[]>([]);
    const [form] = Form.useForm();
    const router = useRouter();
    const [isReseted, setIsReseted] = useState(false);
    const [timer, setTimer] = useState(15);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isReseted && timer > 0) {
          interval = setInterval(() => {
            setTimer((prev) => prev - 1);
          }, 1000);
        }
        if (timer === 0) {
            router.push("/");
        }
        return () => {
          if (interval) clearInterval(interval);
        };
    }, [isReseted, timer, router]); 

    const onFinishFailed = (errorInfo: any) => { // Escolher um tipo melhor
        console.log("Failed:", errorInfo);
    };

     interface Formprops {
        password: string;
        confirmPassword: string;
      }

    const handleConfirmPassword = async (props: Formprops) => {
        if (props.password !== props.confirmPassword) {
          message.error("As senhas não coincidem!", 5);
          return;
        }
    
        if (props.password.length < 8) {
          message.error("A senha deve ter pelo menos 8 caracteres!", 5);
          return;
        }
        setErrors([]);

        setIsReseted(true);
        message.success("Senha alterada com sucesso!", 5);
    
        // const payload = {
        //   password: props.password,
        // };
    
        // try {
        //   const res = await fetch(
        //     `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
        //     {
        //       method: "POST",
        //       headers: { "Content-Type": "application/json" },
        //       body: JSON.stringify(payload),
        //     }
        //   );
    
        //   const responseAPI = await res.json();
    
        //   if (!res.ok) {
        //     setErrors([responseAPI.message].flat());
        //     return;
        //   }
    
        //   const responseNextAuth = await signIn("credentials", {
        //     email: props.email,
        //     password: props.password,
        //     redirect: false,
        //   });
    
        //   if (responseNextAuth?.error) {
        //     setErrors(responseNextAuth.error.split(","));
        //     return;
        //   }
    
        // //   router.push("/home-atleta");
        // } catch (error) {
        //   console.error("Erro:", error);
        //   setErrors(["Não tem back nessa porra, não foi possível cadastrar!"]);
        // }
      };

      const endResetPassword = () => {
        router.push("/");
      }


    return (
        <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center ">
            <div className="hidden md:block md:w-2/3 p-4">
                <Image src="/icons/beachtenis.svg" alt="Beach Tenis" width={700} height={700} />
            </div>
            <div className="w-full md:w-1/3 p-4">

                {!isReseted && (
                    <>
                    <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center justify-center p-3 rounded-full bg-green-primary">
                        <GrSecure className="text-xl text-white" />
                    </div>
                </div>
                <p className="text-center text-gray-600 font-medium text-lg mb-4">
                    Redefinir senha
                </p>
                <p className="text-center text-gray-500 mb-4 text-md">
                    Escolha uma nova senha para sua conta.
                </p>
                    <Form
                        form={form}
                        layout="vertical"
                        name="forgot_password"
                        onFinish={handleConfirmPassword}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        className="w-full"
                    >
                        <Form.Item
                            label="Nova senha"
                            name="password"
                            rules={[{ required: true, message: "Insira sua nova senha!" }]}
                            className="sem-asterisco flex-1"
                        >
                            <Input.Password placeholder="Insira sua nova senha" />
                        </Form.Item>

                        <Form.Item
                            label="Confirme sua nova senha"
                            name="confirmPassword"
                            dependencies={["password"]}
                            rules={[{ required: true, message: "Confirme sua nova senha!" }]}
                            className="sem-asterisco flex-1"
                        >
                            <Input.Password placeholder="Confirme sua nova senha" />
                        </Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="!py-4 w-full bg-green-primary hover:!bg-green-500"
                        >
                            Redefinir
                        </Button>

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

                {isReseted && (
                     <>
                    <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center justify-center p-3 rounded-full bg-green-primary">
                            <FaCheck className="text-xl text-white" />
                        </div>
                    </div>
                    <p className="text-center text-gray-600 font-medium text-lg mb-4">
                        Senha alterada com sucesso
                    </p>
                    <p className="text-center text-gray-500 mb-4 text-md">
                        Lembre-se: senhas iguais em vários lugares podem ser um risco. Crie combinações únicas!
                    </p>

                     <span className="flex flex-row justify-center items-center text-gray-500 mb-4">
                                  {`Redirecionando ${String(timer).padStart(2, "0")}s`}
                    </span>
                    
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="!py-4 w-full bg-green-primary hover:!bg-green-500"
                        onClick={endResetPassword}
                    >
                        Continuar
                    </Button>
                    </>
                )}

                
                
                {errors.length > 0 && (
                    <div className="alert alert-danger mt-4 text-red-500">
                        <ul className="list-disc list-inside">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

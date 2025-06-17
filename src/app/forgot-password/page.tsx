"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Button, Form, Input, App } from "antd";
import { GrSecure } from "react-icons/gr";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPassword() {
  const { message } = App.useApp();
  const [errors, setErrors] = useState<string[]>([]);
  const [form] = Form.useForm();
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [code, setCode] = useState<string[]>([]);
  const [timer, setTimer] = useState(45);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (emailSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [emailSent, timer]);

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  
  interface Formprops {
    email: string;
  }

  const handleSendEmail = async (props: Formprops) => {
    setErrors([]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Email enviado com sucesso!", 3);
      setEmailSent(true);
      setUserEmail(props.email || "");
    } catch (error) {
      console.error("Erro:", error);
      setErrors(["Erro inesperado ao enviar o email."]);
    }
  };


  const handleVerifyCode = () => {
    setErrors([]);
    const typedCode = code.join("");

    if (typedCode === "123456") {
      message.success("Código verificado com sucesso!", 5);
      router.push("/reset-password");
    } else {
      setErrors(["Código inválido. Tente novamente."]);
    }
  };

  return (
    <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center ">
      <div className="hidden md:block md:w-2/3 p-4">
        <Image src="/icons/beachtenis.svg" alt="Beach Tenis" width={700} height={700} />
      </div>
      <div className="w-full md:w-1/3 p-4">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center p-3 rounded-full bg-green-primary">
            <GrSecure className="text-xl text-white" />
          </div>
        </div>
        <p className="text-center text-gray-600 font-medium text-lg mb-4">
          Esqueceu sua senha?
        </p>
        {!emailSent && (
          <p className="text-center text-gray-500 mb-4 text-md">
            Insira seu email abaixo para receber um código de verificação!
          </p>)}
        {!emailSent && (
          <Form
            form={form}
            layout="vertical"
            name="forgot_password"
            onFinish={handleSendEmail}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="w-full"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Insira seu email!" },
                { type: "email", message: "O email inserido não é válido!" },
              ]}
              className="sem-asterisco"
            >
              <Input placeholder="Insira seu email" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className="!py-4 w-full bg-green-primary hover:!bg-green-500"
            >
              Confirmar
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
        )}

        {emailSent && (
          <>
            <p className="mb-4 text-center text-gray-600">
              Um código foi enviado para <b>{userEmail}</b>. Insira-o abaixo:
            </p>

            <Form.Item
              hasFeedback
              validateStatus="success"
              className="flex flex-1 justify-center"
            >
              <Input.OTP
                length={6}
                onChange={(value: string) => {
                  setCode(value.split(""));
                }}
              />

            </Form.Item>

            <span className="flex flex-row justify-center items-center text-gray-500 mb-3">
              {`Reenviar código em ${String(timer).padStart(2, "0")}s`}
              <Button
                type="link"
                disabled={timer > 0}
                onClick={async () => {
                  setTimer(45);
                  await handleSendEmail({ email: userEmail });
                }}
                className={` !h-auto !align-baseline ${timer > 0 ? "!text-gray-500" : "!text-green-500 hover:!text-green-500 focus:!text-green-500"
                  }`}
              >
                Reenviar código
              </Button>
            </span>

            <Button
              type="primary"
              onClick={handleVerifyCode}
              className="!py-4 w-full bg-green-primary hover:!bg-green-500"
            >
              Confirmar código
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

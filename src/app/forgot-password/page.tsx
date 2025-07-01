"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Form, Input, App, Grid } from "antd";
import { GrSecure } from "react-icons/gr";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { forgotPassword, verifyResetCode } from "../api/entities/verifyEmail";

const { useBreakpoint } = Grid;

export default function ForgotPassword() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [timer, setTimer] = useState(45);

  useEffect(() => {
    if (!emailSent || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [emailSent, timer]);

  const handleSendEmail = useCallback(async ({ email }: { email: string }) => {
    setLoading(true);
    message.loading({ content: "Enviando email...", key: "sendEmail" });
    try {
      await forgotPassword(email);
      message.success({
        content: "Email enviado com sucesso!",
        key: "sendEmail",
        duration: 3,
      });
      setUserEmail(email);
      setEmailSent(true);
      setTimer(45);
    } catch (err: any) {
      const errorMessage =
        err.response ?? "Erro inesperado ao enviar o email.";
      message.error({
        content: errorMessage,
        key: "sendEmail",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  }, [message]);

  const handleVerifyCode = useCallback(async (code: string) => {
    if (code.length !== 6) {
      message.warning("Por favor, insira o código de 6 dígitos.");
      return;
    }
    setLoading(true);
    message.loading({ content: "Verificando código...", key: "verifyCode" });

    try {
      await verifyResetCode({ email: userEmail, code });
      message.success({
        content: "Código verificado com sucesso!",
        key: "verifyCode",
        duration: 2,
      });
      router.push(`/redefinir-senha?email=${encodeURIComponent(userEmail)}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ??
        "Código inválido ou expirado. Tente novamente.";
      console.error("Erro ao verificar o código:", err);
      message.error({
        content: errorMessage,
        key: "verifyCode",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  }, [userEmail, message, router]);

  const resendCode = useCallback(async () => {
    await handleSendEmail({ email: userEmail });
  }, [handleSendEmail, userEmail]);

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
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center p-3 rounded-full bg-green-primary">
            <GrSecure className="text-xl text-white" />
          </div>
        </div>
        <p className="text-center text-gray-600 font-medium text-lg mb-4">
          Esqueceu sua senha?
        </p>

        {!emailSent ? (
          <>
            <p className="text-center text-gray-500 mb-4 text-md">
              Insira seu email abaixo para receber um código de verificação!
            </p>
            <Form
              form={form}
              layout="vertical"
              name="forgot_password"
              onFinish={handleSendEmail}
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
              >
                <Input placeholder="Insira seu email" size="large" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="!py-4 w-full bg-green-primary hover:!bg-green-500"
                loading={loading}
                size="large"
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
          </>
        ) : (
          <>
            <p className="mb-4 text-center text-gray-600">
              Um código foi enviado para <b>{userEmail}</b>. Insira-o abaixo:
            </p>
            <Form onFinish={({ code }) => handleVerifyCode(code)}>
              <Form.Item
                name="code"
                rules={[{ required: true, message: "Por favor, insira o código." }]}
                className="flex flex-1 justify-center"
              >
                <Input.OTP length={6} />
              </Form.Item>

              <div className="flex flex-col items-center mb-3">
                <span className="text-gray-500">
                  {timer > 0
                    ? `Reenviar código em ${String(timer).padStart(2, "0")}s`
                    : "Não recebeu o código?"}
                </span>
                <Button
                  type="link"
                  disabled={timer > 0 || loading}
                  onClick={resendCode}
                  className={`!h-auto !align-baseline ${timer > 0
                      ? "!text-gray-500"
                      : "!text-green-500 hover:!text-green-500 focus:!text-green-500"
                    }`}
                >
                  Reenviar código
                </Button>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="!py-4 w-full bg-green-primary hover:!bg-green-500"
                size="large"
              >
                Confirmar código
              </Button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
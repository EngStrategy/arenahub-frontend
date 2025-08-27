"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { Button, Form, Input, App, Flex, Typography } from "antd";
import { GrSecure } from "react-icons/gr";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { forgotPassword, verifyResetCode } from "@/app/api/entities/verifyEmail";
import { useTheme } from "@/context/ThemeProvider";

export default function ForgotPassword() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [timer, setTimer] = useState(10);

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
      message.error({
        content: err.message,
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
    message.info({
      content: "Reenviando código...",
      key: "resendCode",
      duration: 2,
    });
    setLoading(true);
  }, [message]);

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

      <Flex align="center" justify="center" vertical className="w-full md:w-1/3 !p-6">
        <Flex justify="center" align="center" className="!mb-4">
          <Flex justify="center" align="center" className="!p-3 rounded-full bg-green-primary">
            <GrSecure className="text-xl text-white" />
          </Flex>
        </Flex>
        <Typography.Title level={4} className="text-center mb-4">
          Esqueceu sua senha?
        </Typography.Title>

        {!emailSent ? (
          <>
            <Typography.Text className="text-center mb-4">
              Insira seu email abaixo para receber um código de verificação!
            </Typography.Text>
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
            <Typography.Text type="secondary" className="mb-4 text-center">
              Um código foi enviado para <Typography.Text strong italic>{userEmail}</Typography.Text>. Insira-o abaixo:
            </Typography.Text>
            <Form onFinish={({ code }) => handleVerifyCode(code)}>
              <Form.Item
                name="code"
                rules={[{ required: true, message: "Por favor, insira o código." }]}
                className="flex flex-1 justify-center"
              >
                <Input.OTP
                  length={6}
                  onChange={(code) => {
                    if (code.length === 6) {
                      handleVerifyCode(code);
                    }
                  }}
                />
              </Form.Item>

              <Flex justify="space-between" align="center" className="!mb-4">
                <Typography.Text type="secondary">
                  {timer > 0
                    ? `Reenviar código em ${String(timer).padStart(2, "0")}s`
                    : "Não recebeu o código?"}
                </Typography.Text>
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
              </Flex>

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
      </Flex>
    </Flex>
  );
}
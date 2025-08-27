'use client';

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Form, Input, App, Flex, Typography } from "antd";
import { GrSecure } from "react-icons/gr";
import { IoArrowBackOutline } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { iniciarProcessoAtivacaoContaAtletaExterno, ativarContaAtletaExterno } from "@/app/api/entities/atleta";
import { useTheme } from "@/context/ThemeProvider";
import { formatarTelefone } from "@/context/functions/formatarTelefone";
import type { InputRef } from "antd";

interface NumericOtpInputProps {
    length?: number;
    value?: string;
    onChange?: (value: string) => void;
}

const NumericOtpInput: React.FC<NumericOtpInputProps> = ({ length = 6, value = '', onChange }) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    
    const inputRefs = useRef<(InputRef | null)[]>([]);

    useEffect(() => {
        // Sincroniza o estado interno com o valor vindo do Form
        const valueArray = value.split('');
        const newOtp = new Array(length).fill('').map((_, i) => valueArray[i] || '');
        setOtp(newOtp);
    }, [value, length]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        const newValue = element.value.replace(/\D/g, ''); // Aceita apenas números
        if (newValue.length > 1) return; // Impede mais de um dígito por campo

        const newOtp = [...otp];
        newOtp[index] = newValue;
        setOtp(newOtp);

        // Dispara o onChange do Form com a string completa
        onChange?.(newOtp.join(''));

        // Move o foco para o próximo campo se um dígito for inserido
        if (newValue && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        // Move o foco para o campo anterior ao pressionar Backspace em um campo vazio
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (pasteData) {
            const newOtp = new Array(length).fill('');
            pasteData.split('').forEach((char, i) => {
                newOtp[i] = char;
            });
            setOtp(newOtp);
            onChange?.(newOtp.join(''));
            // Foca no último campo preenchido
            const lastFilledIndex = Math.min(pasteData.length - 1, length - 1);
            inputRefs.current[lastFilledIndex]?.focus();
        }
    };

    return (
        <Flex justify="center" gap="small">
            {otp.map((data, index) => (
                <Input
                    key={`otp-input-${index}-${data}`}
                    value={data}
                    onChange={e => handleChange(e.target, index)}
                    onKeyDown={e => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={el => inputRefs.current[index] = el}
                    maxLength={1}
                    className="!w-12 !h-12 text-center !text-lg !font-semibold"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                />
            ))}
        </Flex>
    );
};


export default function AtivarContaExterna() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [userTelefone, setUserTelefone] = useState("");
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (step !== 2 || timer <= 0) return;
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleSendCode = useCallback(async ({ telefone }: { telefone: string }) => {
        const telefoneLimpo = telefone;
        setLoading(true);
        message.loading({ content: "Enviando código...", key: "sendCode" });
        try {
            await iniciarProcessoAtivacaoContaAtletaExterno(telefoneLimpo);
            message.success({
                content: "Código de ativação enviado com sucesso!",
                key: "sendCode",
                duration: 3,
            });
            setUserTelefone(telefoneLimpo);
            setStep(2);
            setTimer(60);
        } catch (err: any) {
            message.error({
                content: (err as Error).message || "Falha ao enviar código. Verifique o telefone.",
                key: "sendCode",
                duration: 4,
            });
        } finally {
            setLoading(false);
        }
    }, [message]);

    const handleActivateAccount = useCallback(async (values: any) => {
        const { code, email, senha } = values;
        if (!code || code.length !== 6) {
            message.warning("Por favor, insira o código de 6 dígitos.");
            return;
        }
        setLoading(true);
        message.loading({ content: "Ativando sua conta...", key: "activate" });

        try {
            await ativarContaAtletaExterno(userTelefone, code, email, senha);
            message.success({
                content: "Sua conta foi ativada com sucesso! Você já pode fazer login.",
                key: "activate",
                duration: 4,
            });
            router.push('/login');
        } catch (err: any) {
            const errorMessage = (err as Error).message || "Não foi possível ativar sua conta. Verifique os dados e tente novamente.";
            message.error({
                content: errorMessage,
                key: "activate",
                duration: 4,
            });
        } finally {
            setLoading(false);
        }
    }, [userTelefone, message, router]);

    const resendCode = useCallback(async () => {
        await handleSendCode({ telefone: userTelefone });
    }, [handleSendCode, userTelefone]);

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
                    alt="Ativação de Conta"
                    width={400}
                    height={400}
                    className="!sticky !top-20 !w-full !object-cover"
                />
            </Flex>

            <Flex align="center" justify="center" vertical className="w-full md:w-1/3 !p-6">
                <Flex justify="center" align="center" className="!mb-4 !p-3 rounded-full bg-green-primary">
                    <GrSecure className="text-xl text-white" />
                </Flex>
                <Typography.Title level={4} className="text-center mb-4">
                    {step === 1 ? 'Ative sua Conta' : 'Quase lá!'}
                </Typography.Title>

                {step === 1 && (
                    <>
                        <Typography.Text className="text-center mb-4">
                            Informe o telefone que a arena cadastrou para você. Enviaremos um código de ativação.
                        </Typography.Text>
                        <Form form={form} layout="vertical" name="send_code_form" onFinish={handleSendCode} autoComplete="off" className="w-full">
                            <Form.Item
                                label="Telefone (WhatsApp)"
                                name="telefone"
                                rules={[
                                    { required: true, message: "Insira seu telefone!" },
                                    { pattern: /^\(\d{2}\) \d{5}-\d{4}$/, message: "Formato de telefone inválido." }
                                ]}
                            >
                                <Input 
                                    placeholder="(99) 99999-9999" 
                                    size="large"
                                    onChange={(e) => form.setFieldsValue({ telefone: formatarTelefone(e.target.value)})}
                                />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" className="!py-4 w-full bg-green-primary hover:!bg-green-500" loading={loading} size="large">
                                Enviar Código
                            </Button>
                            <p className="text-gray-800 text-sm mt-4">
                                <Link href="/login" className="flex flex-row items-center gap-1 text-green-primary hover:!text-green-500">
                                    <IoArrowBackOutline /> Já tenho uma conta
                                </Link>
                            </p>
                        </Form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Typography.Text type="secondary" className="mb-4 text-center">
                            Um código foi enviado para o telefone <Typography.Text strong>{formatarTelefone(userTelefone)}</Typography.Text>.
                        </Typography.Text>
                        <Form form={form} onFinish={handleActivateAccount} layout="vertical" className="w-full">
                            <Form.Item label="Código de 6 dígitos" name="code" rules={[{ required: true, message: "Insira o código." }]}>
                                <NumericOtpInput />
                            </Form.Item>
                            
                            <Form.Item label="E-mail" name="email" rules={[{ required: true, message: "Insira seu email!" }, { type: 'email', message: "Email inválido"}]}>
                                <Input placeholder="exemplo@email.com" size="large" />
                            </Form.Item>
                            
                            <Form.Item label="Crie uma Senha" name="senha" rules={[{ required: true, message: "Crie uma senha!" }, {min: 6, message: 'A senha precisa ter no mínimo 6 caracteres'}]}>
                                <Input.Password placeholder="******" size="large" />
                            </Form.Item>

                            <Flex justify="space-between" align="center" className="!mb-4">
                                <Typography.Text type="secondary">
                                    {timer > 0 ? `Reenviar em ${String(timer).padStart(2, "0")}s` : "Não recebeu?"}
                                </Typography.Text>
                                <Button type="link" disabled={timer > 0 || loading} onClick={resendCode} className={`!h-auto !align-baseline ${timer > 0 ? "!text-gray-500" : "!text-green-500 hover:!text-green-500"}`}>
                                    Reenviar código
                                </Button>
                            </Flex>

                            <Button type="primary" htmlType="submit" loading={loading} className="!py-4 w-full bg-green-primary hover:!bg-green-500" size="large">
                                Ativar Conta
                            </Button>
                        </Form>
                    </>
                )}
            </Flex>
        </Flex>
    );
}
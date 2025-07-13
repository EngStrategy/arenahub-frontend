'use client';

import React, { useState } from 'react';
import { Form, Input, App, Flex, Card, Typography, Row, Col, Space, Popover, Progress } from 'antd';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { ButtonCancelar } from '@/components/Buttons/ButtonCancelar';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { updatePassword } from '@/app/api/entities/atleta';
import { useCapsLock } from '@/context/hooks/useCapsLook';
import CapsLock from '@/components/Alerts/CapsLock';
import { useTheme } from '@/context/ThemeProvider';

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

const AlterarSenhaSkeleton = () => (
    <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-start justify-center mt-6">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
            <div className="mt-10 space-y-6">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
                    </div>
                </div>
                <div className="flex justify-end items-center gap-4 pt-4">
                    <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
                    <div className="h-10 w-36 bg-gray-300 rounded-lg"></div>
                </div>
            </div>
        </div>
    </div>
);

export default function AlterarSenha() {
    const { data: session, status } = useSession();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormAltered, setIsFormAltered] = useState(false);
    const capsLockEstaAtivado = useCapsLock();

    const [password, setPassword] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const onFinish = async (values: any) => {
        if (status !== 'authenticated' || !session?.user?.userId || !session?.user?.accessToken) {
            message.error('Você não está autenticado.');
            signOut({ callbackUrl: '/login' });
            return;
        }
        setIsSubmitting(true);
        try {
            const { senhaAtual, confirmarSenha } = values;
            if (password !== confirmarSenha) {
                setIsSubmitting(false);
                message.error('As novas senhas não coincidem.');
                return;
            }
            await updatePassword(senhaAtual, password, confirmarSenha);
            message.success('Senha alterada com sucesso! Você será desconectado.');
            form.resetFields();

            await new Promise(resolve => setTimeout(() => {
                signOut({ callbackUrl: '/login' });
                resolve(null);
            }, 2000));
        } catch (error: any) {
            message.error(`${error instanceof Error ? error.message : 'Ocorreu um erro ao alterar a senha.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onFinishFailed = () => {
        message.error('Falha ao salvar informações. Verifique os campos.');
    };

    const handleValuesChange = (_: any, allValues: any) => {
        const hasValues = Object.values(allValues).some(value => !!value);
        setIsFormAltered(hasValues);
    };

    const handleCancelClick = () => {
        if (isFormAltered) {
            form.resetFields();
            setIsFormAltered(false);
        } else {
            router.back();
        }
    };

    if (status === 'loading') {
        return <AlterarSenhaSkeleton />;
    }

    return (
        <Flex
            justify='center'
            align='start'
            className="sm:!px-10 lg:!px-40 !px-4 !py-6 !flex-1"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
        >
            <Card
                title={
                    <>
                        <Typography.Title level={3} className="!mb-2">
                            Alterar senha
                        </Typography.Title>
                        <Typography.Paragraph type="secondary" style={{ whiteSpace: 'normal' }}>
                            Use pelo menos 8 caracteres. Não use a senha de outro site ou algo muito óbvio, como o nome do seu animal de estimação.
                        </Typography.Paragraph>
                    </>
                }
                className="w-full max-w-2xl shadow-xl !pt-6"
                styles={{ header: { borderBottom: 0 } }}
            >
                <Form
                    form={form}
                    name="alterar-senha"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    onValuesChange={handleValuesChange}
                    autoComplete="off"
                    disabled={isSubmitting || status !== 'authenticated'}
                >
                    <Form.Item
                        label="Senha atual"
                        name="senhaAtual"
                        rules={[{ required: true, message: 'Por favor, insira sua senha atual!' }]}
                        className='sem-asterisco'
                    >
                        <Input.Password placeholder="Digite sua senha atual" />
                    </Form.Item>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Nova senha"
                                name="novaSenha"
                                rules={[
                                    { required: password == '', message: "Por favor, insira sua nova senha!" },
                                    { min: 8, message: "A senha deve ter pelo menos 8 caracteres." },
                                ]}
                                className='sem-asterisco'
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
                                    />
                                </Popover>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Confirmar nova senha"
                                name="confirmarSenha"
                                dependencies={['novaSenha']}
                                rules={[
                                    { required: true, message: "Por favor, digite novamente sua senha!" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || password === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("As senhas não coincidem!"));
                                        }
                                    }),
                                ]}
                                className='sem-asterisco'
                                hasFeedback
                            >
                                <Input.Password placeholder="Confirme a nova senha" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {capsLockEstaAtivado && (
                        <CapsLock />
                    )}

                    <Flex justify="end" className="mt-8">
                        <Space size="middle">
                            <ButtonCancelar
                                text={isFormAltered ? "Cancelar" : "Voltar"}
                                type="default"
                                htmlType="button"
                                onClick={handleCancelClick}
                                disabled={isSubmitting}
                            />
                            <ButtonPrimary
                                text="Alterar senha"
                                type="primary"
                                htmlType="submit"
                                loading={isSubmitting}
                                disabled={isSubmitting || status !== 'authenticated' || !isFormAltered}
                            />
                        </Space>
                    </Flex>
                </Form>
            </Card>
        </Flex>
    );
}
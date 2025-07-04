'use client';

import React, { useState } from 'react';
import { Form, Input, App } from 'antd';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { ButtonCancelar } from '@/components/Buttons/ButtonCancelar';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { updatePassword } from '@/app/api/entities/atleta';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useCapsLock } from '@/context/hooks/useCapsLook';

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
    const [loading, setLoading] = useState(false);
    const [isFormAltered, setIsFormAltered] = useState(false);
    const router = useRouter();

    const capsLockEstaAtivado = useCapsLock();

    const onFinish = async () => {
        if (status !== 'authenticated' || !session?.user?.userId || !session?.user?.accessToken) {
            message.error('Você não está autenticado.');
            signOut({ callbackUrl: '/login' });
            return;
        }
        setLoading(true);
        try {
            const values = form.getFieldsValue();
            const { senhaAtual, novaSenha, confirmarSenha } = values;
            if (novaSenha !== confirmarSenha) {
                setLoading(false);
                message.error('As novas senhas não coincidem.');
                return;
            }
            await updatePassword(senhaAtual, novaSenha, confirmarSenha);
            message.success('Senha alterada com sucesso! Você será desconectado.');
            form.resetFields();

            await new Promise(resolve => setTimeout(() => {
                signOut({ callbackUrl: '/login' });
                resolve(null);
            }, 2000));
        } catch (error: any) {
            message.error(`${error instanceof Error ? error.message : 'Tente novamente.'}`);
        } finally { setLoading(false); }
    };

    const onFinishFailed = () => {
        message.error('Falha ao salvar informações. Verifique os campos.');
    };

    const handleValuesChange = (_: any, allValues: any) => {
        const { senhaAtual, novaSenha, confirmarSenha } = allValues;
        const hasValues = !!(senhaAtual ?? novaSenha ?? confirmarSenha);
        setIsFormAltered(hasValues);
    };

    const handleCancelClick = () => {
        if (isFormAltered) {
            form.resetFields();
        } else {
            router.back();
        }
    };

    if (status === 'loading') {
        return <AlterarSenhaSkeleton />;
    }

    return (
        <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-start justify-center mt-6">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Alterar senha</h1>
                <p className="text-gray-600 mb-8">
                    Use pelo menos 8 caracteres. Não use a senha de outro site ou algo muito óbvio, como o nome do seu animal de estimação.
                </p>
                <Form
                    form={form}
                    name="alterar-senha"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    onValuesChange={handleValuesChange}
                    autoComplete="off"
                    disabled={loading || status !== 'authenticated'}
                >
                    <Form.Item
                        label="Senha atual"
                        name="senhaAtual"
                        rules={[{ required: true, message: 'Por favor, insira sua senha atual!' }]}
                        className='sem-asterisco'
                    >
                        <Input.Password placeholder="***********" />
                    </Form.Item>
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
                        <Form.Item
                            label="Nova senha"
                            name="novaSenha"
                            rules={[
                                { required: true, message: "Por favor, insira sua nova senha!" },
                                { min: 8, message: "A senha deve ter pelo menos 8 caracteres." },
                            ]}
                            className="sem-asterisco"
                            hasFeedback
                        >
                            <Input.Password placeholder="***********" />
                        </Form.Item>
                        <Form.Item
                            label="Confirmar nova senha"
                            name="confirmarSenha"
                            rules={[
                                { required: true, message: "Por favor, digite novamente sua senha!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('novaSenha') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("As senhas não coincidem!"));
                                    }
                                }),
                            ]}
                            className="sem-asterisco"
                            hasFeedback
                        >
                            <Input.Password placeholder="***********" />
                        </Form.Item>
                    </div>

                    {capsLockEstaAtivado && (
                        <div role="alert" className="flex items-center gap-2 text-orange-600 mb-4 transition-opacity duration-300 animate-pulse">
                            <ExclamationCircleFilled />
                            <span className="text-sm font-medium">CapsLock está ativado</span>
                        </div>
                    )}

                    <Form.Item className="mt-8 flex justify-end">
                        <div className='flex items-center gap-4'>
                            <ButtonCancelar
                                text={isFormAltered ? "Cancelar" : "Voltar"}
                                onClick={handleCancelClick}
                            />
                            <ButtonPrimary
                                text='Alterar senha'
                                htmlType="submit"
                                loading={loading}
                                disabled={loading || status !== 'authenticated' || !isFormAltered}
                            />
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}
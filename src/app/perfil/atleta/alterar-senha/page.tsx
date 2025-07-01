'use client';

import React, { useState } from 'react';
import { Form, Input, App } from 'antd';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { ButtonCancelar } from '@/components/Buttons/ButtonCancelar';
import { useSession, signOut } from "next-auth/react";
import { updatePassword } from '@/app/api/entities/atleta';

export default function AlterarSenha() {
    const { data: session, status } = useSession();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

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
                message.error('As novas senhas não coincidem.');
                return;
            }
            await updatePassword(senhaAtual, novaSenha, confirmarSenha);
            message.success('Senha alterada com sucesso!');
            form.resetFields();
            signOut({ callbackUrl: '/login' });            
        } catch (error: any) {
            message.error(`${error instanceof Error ? error.message : 'Tente novamente.'}`);
        } finally { setLoading(false); }
    };

    const onFinishFailed = () => {
        message.error('Falha ao salvar informações. Verifique os campos.');
    };

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
                        >
                            <Input.Password placeholder="***********" />
                        </Form.Item>
                        <Form.Item
                            label="Confirmar nova senha"
                            name="confirmarSenha"
                            rules={[{ required: true, message: "Por favor, digite novamente sua senha!" }]}
                            className="sem-asterisco"
                        >
                            <Input.Password placeholder="***********" />
                        </Form.Item>
                    </div>
                    <Form.Item className="mt-8 flex justify-end">
                        <div className='flex items-center gap-4'>
                            <ButtonCancelar
                                text="Cancelar"
                                onClick={() => form.resetFields()}
                            />
                            <ButtonPrimary
                                text='Alterar senha'
                                htmlType="button"
                                onClick={() => form.submit()}
                                loading={loading}
                                disabled={loading || status !== 'authenticated'}
                            />
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}
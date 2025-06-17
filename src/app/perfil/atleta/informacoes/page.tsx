'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Upload, Avatar, App, Image, Button, Dropdown } from 'antd';
import { UserOutlined, UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { ButtonCancelar } from '@/components/Buttons/ButtonCancelar';
import { useSession } from "next-auth/react";
import type { GetProp, MenuProps, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import {
    getAtletaById,
    updateAtleta,
    Atleta
} from '@/app/api/entities/atleta';
import { useRouter } from 'next/navigation';
import { formatarTelefone } from '@/context/functions/formatarTelefone';

interface PersonalInfoFormValues {
    name: string;
    phone: string;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (img: FileType): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(img);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const uploadToImgur = async (imageFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error ?? 'Falha no upload do arquivo.');
    }
    return data.link;
};

export default function InformacoesPessoaisAtleta() {
    const { data: session, status, update } = useSession();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const router = useRouter();

    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFormAltered, setIsFormAltered] = useState(false);

    const fetchAndSetUserData = useCallback(async () => {
        if (status === 'authenticated' && session?.user?.userId && session?.user?.accessToken) {
            setLoading(true);
            try {
                const userData = await getAtletaById(session.user.userId);
                if (!userData) {
                    return message.warning('Dados do usuário não encontrados.');
                }
                form.setFieldsValue({ name: userData.nome, phone: userData.telefone });
                setImageUrl(userData.urlFoto ?? null);
                setSelectedFile(null);
                setIsFormAltered(false);
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                message.error('Erro ao carregar dados do usuário.');
            } finally {
                setLoading(false);
            }
        }
    }, [status, session, form, message]);

    useEffect(() => {
        fetchAndSetUserData();
    }, [fetchAndSetUserData]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url ?? (file.preview as string));
        setPreviewOpen(true);
    };

    const onFinish = async (values: PersonalInfoFormValues) => {
        if (status !== 'authenticated' || !session?.user?.userId || !session?.user?.accessToken) {
            message.error('Você não está autenticado.'); return;
        }
        setLoading(true);
        try {
            let urlParaSalvar = imageUrl;
            if (selectedFile) {
                const key = 'uploading-image';
                message.loading({ content: 'Enviando nova foto...', key, duration: 0 });
                urlParaSalvar = await uploadToImgur(selectedFile);
                message.destroy(key);
            }
            const updatedData: Partial<Atleta> = {
                nome: values.name,
                telefone: values.phone,
                urlFoto: urlParaSalvar ?? undefined,
            };
            await updateAtleta(session.user.userId, updatedData,);
            message.success('Informações salvas com sucesso!');

            await update({
                name: updatedData.nome,
                picture: updatedData.urlFoto,
            });

            fetchAndSetUserData();
        } catch (error: any) {
            message.error(`${error instanceof Error ? error.message : 'Tente novamente.'}`);
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = () => {
        message.error('Falha ao salvar informações. Verifique os campos.');
    };

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) { message.error('Você só pode fazer upload de arquivos JPG/PNG!'); }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) { message.error('A imagem deve ter no máximo 5MB!'); }
        return isJpgOrPng && isLt5M;
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        const file = info.file.originFileObj;
        if (file) {
            getBase64(file as FileType)
                .then(base64Url => { setImageUrl(base64Url); })
                .catch(() => message.error("Não foi possível gerar o preview da imagem."));
            setSelectedFile(file as FileType);
            setIsFormAltered(true);
        }
    };

    const uploadButton = (<Button loading={loading} > <UploadOutlined className="mr-2" /> Escolher foto </Button>);

    const handleRemoveImage = () => {
        setImageUrl(undefined);
        setSelectedFile(null);
        setIsFormAltered(true);
        message.info('Foto removida. Clique em "Salvar alterações" para confirmar.');
    };

    const menuItems: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <ImgCrop rotationSlider>
                    <Upload
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        onChange={handleChange}
                        maxCount={1}
                        multiple={false}
                        accept="image/jpeg,image/png"
                        disabled={loading || status !== 'authenticated'}
                    >
                        <div className="flex items-center w-full">
                            <UploadOutlined className="mr-2" />
                            <span>Escolher outra foto</span>
                        </div>
                    </Upload>
                </ImgCrop>
            ),
        },
    ];

    if (imageUrl) {
        menuItems.push({
            key: '2',
            label: 'Remover foto',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: handleRemoveImage,
        });
    }

    return (
        <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-start justify-center my-6">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Informações pessoais</h1>
                <p className="text-gray-600 mb-8">
                    Gerencie suas informações pessoais e salve as alterações caso realize alguma mudança.
                </p>
                <Form
                    form={form}
                    name="personal_atleta_info"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    onValuesChange={() => setIsFormAltered(true)}
                    disabled={loading || status !== 'authenticated'}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <Form.Item label="Foto de perfil" className="!mb-2">
                                <div className="flex items-center gap-4">
                                    <Dropdown
                                        menu={{ items: menuItems }}
                                        trigger={['click']}
                                        placement="bottomLeft"
                                        aria-label="Menu de opções para alterar a foto de perfil"
                                    >
                                        <div className="relative group cursor-pointer" title="Clique para alterar a foto">
                                            <Avatar
                                                size={64}
                                                src={imageUrl ?? undefined}
                                                icon={!imageUrl ? <UserOutlined /> : undefined}
                                                className="flex-shrink-0"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300">
                                                <EditOutlined className="!text-white !text-xl !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300" />
                                            </div>
                                        </div>
                                    </Dropdown>
                                    <div className='flex rounded-md flex-col gap-2 w-full'>
                                        <span className="text-gray-500 text-xs">Tamanho máximo: 5MB</span>
                                        <ImgCrop rotationSlider>
                                            <Upload
                                                showUploadList={false}
                                                beforeUpload={beforeUpload}
                                                onChange={handleChange}
                                                onPreview={handlePreview}
                                                maxCount={1}
                                                multiple={false}
                                                accept="image/jpeg,image/png"
                                                disabled={loading || status !== 'authenticated'}
                                            >
                                                {uploadButton}
                                            </Upload>
                                        </ImgCrop>
                                    </div>
                                </div>
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Nome"
                            name="name"
                            rules={[{ required: true, message: 'Por favor, insira seu nome!' }]}
                            className='sem-asterisco'
                        >
                            <Input placeholder="Seu nome completo" />
                        </Form.Item>

                        <Form.Item
                            label="Telefone"
                            name="phone"
                            rules={
                                [{ required: true, message: "Por favor, insira seu telefone!" },
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        const digits = value.replace(/\D/g, "");
                                        if (digits.length !== 11) { return Promise.reject("Telefone inválido"); }
                                        return Promise.resolve();
                                    },
                                }]
                            }
                            className="sem-asterisco"
                        >
                            <Input
                                placeholder="(99) 99999-9999"
                                onChange={(e) => {
                                    form.setFieldsValue({ phone: formatarTelefone(e.target.value) });
                                }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item className="mt-8 flex justify-end">
                        <div className='flex items-center gap-4'>
                            <ButtonCancelar
                                text="Cancelar"
                                onClick={() => {
                                    fetchAndSetUserData();
                                    router.back();
                                }}
                            />
                            <ButtonPrimary
                                text='Salvar alterações'
                                htmlType="button"
                                onClick={() => form.submit()}
                                loading={loading}
                                disabled={!isFormAltered || loading || status !== 'authenticated'}
                            />
                        </div>
                    </Form.Item>
                </Form>
                {previewImage && (
                    <Image
                        wrapperStyle={{ display: 'none' }}
                        preview={{
                            visible: previewOpen,
                            onVisibleChange: (visible) => setPreviewOpen(visible), afterOpenChange: (visible) => !visible && setPreviewImage(''),
                        }}
                        src={previewImage}
                    />
                )}
            </div>
        </div>
    );
}
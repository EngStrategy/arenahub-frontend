"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Form, Input, Upload,
    Avatar, App, Button,
    Select, Dropdown, Flex,
    Col, Row, Card, Typography,
    Space, type MenuProps, type GetProp,
    type UploadFile, type UploadProps
} from 'antd';
import { PictureOutlined, UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { ButtonCancelar } from '@/components/Buttons/ButtonCancelar';
import { useSession } from "next-auth/react";
import ImgCrop from 'antd-img-crop';
import {
    getArenaById,
    updateArena,
    Arena
} from '@/app/api/entities/arena';
import { useRouter } from 'next/navigation';
import { formatarTelefone } from '@/context/functions/formatarTelefone';
import { formatarCEP } from '@/context/functions/formatarCEP';
import axios from 'axios';
import { Estados } from '@/data/Estados'
import { useTheme } from '@/context/ThemeProvider';

type CITYResponse = {
    id: number;
    nome: string;
};

interface PersonalInfoFormValues {
    nome: string;
    telefone: string;
    cep: string;
    estado: string;
    cidade: string;
    bairro: string;
    rua: string;
    numero: string;
    complemento?: string;
    descricao: string;
    urlFoto: string;
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

const InformacoesPessoaisArenaSkeleton = () => (
    <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-start justify-center my-6">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-3"></div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>

            <div className="mt-10 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-10 bg-gray-300 rounded-lg w-1/2"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="space-y-2"><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-10 bg-gray-300 rounded-lg"></div></div>
                        <div className="space-y-2"><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-10 bg-gray-300 rounded-lg"></div></div>
                        <div className="space-y-2"><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-10 bg-gray-300 rounded-lg"></div></div>
                        <div className="space-y-2"><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-10 bg-gray-300 rounded-lg"></div></div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2"><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-10 bg-gray-300 rounded-lg"></div></div>
                        <div className="space-y-2"><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-10 bg-gray-300 rounded-lg"></div></div>
                        <div className="space-y-2"><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-10 bg-gray-300 rounded-lg"></div></div>
                        <div className="space-y-2"><div className="h-4 bg-gray-300 rounded w-1/4"></div><div className="h-10 bg-gray-300 rounded-lg"></div></div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-24 bg-gray-300 rounded-lg"></div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
                    <div className="h-10 w-40 bg-gray-300 rounded-lg"></div>
                </div>
            </div>
        </div>
    </div>
);

export default function InformacoesPessoaisArena() {
    const { data: session, status, update } = useSession();
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormAltered, setIsFormAltered] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [cities, setCities] = useState<CITYResponse[]>([]);
    const DEFAULT_AVATAR_URL = "https://i.imgur.com/p0hVrWq.png";

    useEffect(() => {
        const estadoSelecionado = form.getFieldValue("estado")
        if (estadoSelecionado === "0") {
            return;
        }
        axios
            .get(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`
            )
            .then((response) => {
                setCities(response.data);
            });
    });

    const consultarCep = async (cep: string) => {
        message.loading("Consultando CEP...");

        if (!cep || cep === "0") {
            return;
        }

        const cleanCep = cep.replace(/\D/g, "");
        if (cleanCep.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = response.data;

                form.setFieldsValue({
                    estado: data.uf,
                    cidade: data.localidade,
                    bairro: data.bairro,
                    rua: data.logradouro,
                    complemento: data.complemento ?? "",
                });

            } catch {
                message.error("Erro ao buscar informações do CEP.");
            }
        }
    };

    const fetchAndSetUserData = useCallback(async () => {
        if (status === 'authenticated' && session?.user?.userId && session?.user?.accessToken) {
            try {
                const userData = await getArenaById(session.user.userId);
                if (!userData) return message.warning('Dados do usuário não encontrados.');
                form.setFieldsValue({
                    nome: userData.nome,
                    telefone: userData.telefone,
                    email: userData.email,
                    cep: userData.endereco?.cep ?? '',
                    estado: userData.endereco?.estado ?? '',
                    cidade: userData.endereco?.cidade ?? '',
                    bairro: userData.endereco?.bairro ?? '',
                    rua: userData.endereco?.rua ?? '',
                    numero: userData.endereco?.numero ?? '',
                    complemento: userData.endereco?.complemento ?? '',
                    descricao: userData.descricao ?? '',
                    urlFoto: userData.urlFoto ?? null
                });
                setImageUrl(userData.urlFoto ?? null);
                setSelectedFile(null);
                setIsFormAltered(false);
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
                message.error('Erro ao carregar dados do usuário.');
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [status, session, form, message]);

    useEffect(() => {
        if (status !== 'loading') {
            setIsPageLoading(true);
            fetchAndSetUserData().finally(() => {
                setIsPageLoading(false);
            });
        }
    }, [status, fetchAndSetUserData]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
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

    const uploadButton = (<Button loading={isSubmitting} > <UploadOutlined className="mr-2" /> Escolher foto </Button>);

    const handleRemoveImage = () => {
        setImageUrl(DEFAULT_AVATAR_URL);
        setSelectedFile(null);
        setIsFormAltered(true);
        message.info('Foto removida. Clique em "Salvar alterações" para confirmar.');
    };

    const onFinish = async (values: PersonalInfoFormValues) => {
        if (status !== 'authenticated' || !session?.user?.userId || !session?.user?.accessToken) {
            message.error('Você não está autenticado.'); return;
        }
        setIsSubmitting(true);
        try {
            let urlParaSalvar = imageUrl;
            if (selectedFile) {
                const key = 'uploading-image';
                message.loading({ content: 'Carregando...', key, duration: 0 });
                urlParaSalvar = await uploadToImgur(selectedFile);
                message.destroy(key);
            }
            const updatedData: Partial<Arena> = {
                nome: values.nome,
                telefone: values.telefone,
                endereco: {
                    cep: values.cep ?? '',
                    estado: values.estado ?? '',
                    cidade: values.cidade ?? '',
                    bairro: values.bairro ?? '',
                    rua: values.rua ?? '',
                    numero: values.numero ?? '',
                    complemento: values.complemento ?? '',
                },
                descricao: values.descricao ?? '',
                urlFoto: urlParaSalvar ?? undefined,
            };
            await updateArena(session.user.userId, updatedData,);
            await update({
                name: updatedData.nome,
                picture: updatedData.urlFoto,
            });

            message.success('Informações salvas com sucesso!');
            setIsFormAltered(false);
            fetchAndSetUserData();
            await new Promise(resolve => setTimeout(() => {
                router.push('/dashboard');
                resolve(null);
            }, 2000));
        } catch (error: any) {
            message.error(`${error instanceof Error ? error.message : 'Tente novamente.'}`);
        } finally {
            setIsSubmitting(false);
        }
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
                        disabled={isSubmitting ?? status !== 'authenticated'}
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

    if (imageUrl && imageUrl !== DEFAULT_AVATAR_URL) {
        menuItems.push({
            key: '2',
            label: 'Remover foto',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: handleRemoveImage,
        });
    }

    if (isPageLoading) {
        return <InformacoesPessoaisArenaSkeleton />;
    }

    return (
        <Flex
            justify='center'
            align='start'
            className="sm:!px-10 lg:!px-40 !px-4 !pt-6 !pb-14"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
        >
            <Card
                title={
                    <>
                        <Typography.Title level={3} className="!mb-2">
                            Informações da arena
                        </Typography.Title>
                        <Typography.Paragraph type="secondary" style={{ whiteSpace: 'normal' }}>
                            Gerencie suas informações pessoais e salve as alterações caso realize alguma mudança.
                        </Typography.Paragraph>
                    </>
                }
                className="w-full max-w-2xl shadow-xl !pt-6"
                styles={{ header: { borderBottom: 0 } }}
            >
                <Form
                    form={form}
                    name="personal_arena_info"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    onValuesChange={() => setIsFormAltered(true)}
                    disabled={isPageLoading || isSubmitting || status !== 'authenticated'}
                >
                    <Row gutter={[24, 24]} className="!gap-0">
                        <Col xs={24} md={12}>
                            <Form.Item label="Foto ou logomarca da arena" className="!mb-2">
                                <Flex align="center" gap="middle">
                                    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomLeft">
                                        <div className="relative group cursor-pointer" title="Clique para alterar a foto">
                                            <Avatar
                                                size={64}
                                                src={imageUrl ?? undefined}
                                                icon={<PictureOutlined />}
                                                className="flex-shrink-0"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300">
                                                <EditOutlined className="!text-white !text-xl !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300" />
                                            </div>
                                        </div>
                                    </Dropdown>
                                    <Flex vertical>
                                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                            Tamanho máximo: 5MB
                                        </Typography.Text>
                                        <ImgCrop rotationSlider>
                                            <Upload
                                                showUploadList={false}
                                                beforeUpload={beforeUpload}
                                                onChange={handleChange}
                                                onPreview={handlePreview}
                                                maxCount={1}
                                                multiple={false}
                                                accept="image/jpeg,image/png"
                                                disabled={isSubmitting ?? status !== 'authenticated'}
                                            >
                                                {uploadButton}
                                            </Upload>
                                        </ImgCrop>
                                    </Flex>
                                </Flex>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="E-mail"
                                name="email"
                            >
                                <Input
                                    name='email'
                                    disabled
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Nome da Arena"
                                name="nome"
                                rules={[{ required: true, message: "Insira o nome da sua arena" }]}
                            >
                                <Input placeholder="Insira o nome da sua arena" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Telefone"
                                name="telefone"
                                rules={[
                                    { required: true, message: "Insira seu telefone" },
                                    {
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            const digits = value.replace(/\D/g, "");
                                            if (digits.length !== 11) {
                                                return Promise.reject(new Error("Telefone inválido"));
                                            }
                                            return Promise.resolve();
                                        },

                                    },
                                ]}
                            >
                                <Input
                                    placeholder="(99) 99999-9999"
                                    onChange={(e) => {
                                        form.setFieldsValue({ telefone: formatarTelefone(e.target.value) });
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="CEP"
                                name="cep"
                                rules={[
                                    { required: true, message: "Insira o CEP da sua arena" },
                                    {
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            const cep = value.replace(/\D/g, "");
                                            if (cep.length !== 8) {
                                                return Promise.reject(new Error("CEP deve ter 8 dígitos"));
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Insira o CEP da sua arena"
                                    onChange={(e) => {
                                        form.setFieldsValue({ cep: formatarCEP(e.target.value) });
                                    }}
                                    onBlur={e => {
                                        consultarCep(e.target.value);
                                    }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Estado"
                                        name="estado"
                                        rules={[{ required: true, message: "Selecione o estado" }]}
                                    >
                                        <Select placeholder="Estado" options={Estados} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Cidade"
                                        name="cidade"
                                        rules={[{ required: true, message: "Selecione a cidade" }]}
                                    >
                                        <Select
                                            placeholder="Cidade"
                                            options={cities.map(city => ({
                                                label: city.nome,
                                                value: city.nome,
                                                key: city.id
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>


                        <Col xs={24} md={12}>
                            <Form.Item label="Bairro" name="bairro" rules={[{ required: true, message: "Insira o bairro" }]}>
                                <Input placeholder="Insira o bairro da sua arena" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Rua" name="rua" rules={[{ required: true, message: "Insira a rua" }]}>
                                <Input placeholder="Insira a rua da sua arena" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Número" name="numero" rules={[{ required: true, message: "Insira o número" }]}>
                                <Input placeholder="Nº" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Complemento (opcional)" name="complemento">
                                <Input placeholder="Ex: Bloco A, Apto 101" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label="Descrição (opcional)"
                                name="descricao"
                                rules={[{ max: 500, message: 'A descrição deve ter no máximo 500 caracteres.' }]}
                            >
                                <Input.TextArea
                                    placeholder="Digite algo que descreva sua arena e ajude a atrair mais reservas"
                                    autoSize={{ minRows: 3, maxRows: 6 }}
                                    count={{ show: true, max: 500 }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Flex justify="end" className="mt-8">
                        <Space size="middle">
                            <ButtonCancelar
                                text={!isFormAltered ? 'Voltar' : 'Cancelar'}
                                onClick={() => {
                                    if (!isFormAltered || isSubmitting || status !== 'authenticated') {
                                        router.back();
                                        return;
                                    }
                                    fetchAndSetUserData();
                                }}
                            />
                            <ButtonPrimary
                                text='Salvar alterações'
                                type="primary"
                                htmlType="submit"
                                loading={isSubmitting}
                                disabled={!isFormAltered || isSubmitting || status !== 'authenticated'}
                            />
                        </Space>
                    </Flex>
                </Form>
            </Card>
        </Flex>
    )
}

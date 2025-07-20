"use client";

import React, { useEffect, useState } from 'react';
import {
    Form, Input, Select, Button, Typography, Upload,
    Avatar, App, UploadProps, UploadFile, Switch, MenuProps, Dropdown,
    Layout, Card, Row, Col, Flex, List, Tag, Space,
    Tooltip,
} from 'antd';
import {
    PictureOutlined,
    UploadOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useSession } from "next-auth/react";
import ImgCrop from 'antd-img-crop';
import { useRouter, useParams } from 'next/navigation';
import { FileType, getBase64, uploadToImgur } from '@/context/functions/imgur';
import { ButtonCancelar } from '@/components/Buttons/ButtonCancelar';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import ModalCriarHorarios from '@/components/Modais/ModalCriarHorarios';
import {
    updateQuadra, getQuadraById, QuadraCreate, DiaDaSemana,
} from '@/app/api/entities/quadra';
import { formatarDiaSemanaCompleto } from '@/context/functions/mapeamentoDiaSemana';
import { useTheme } from '@/context/ThemeProvider';

const { Title, Text } = Typography;

const horariosDaSemanaCompleta: Array<{ diaDaSemana: DiaDaSemana, intervalosDeHorario: any[] }> = [
    {
        diaDaSemana: 'DOMINGO',
        intervalosDeHorario: [{ inicio: null, fim: null, valor: null, status: null }],
    },
    {
        diaDaSemana: 'SEGUNDA',
        intervalosDeHorario: [{ inicio: null, fim: null, valor: null, status: null }],
    },
    {
        diaDaSemana: 'TERCA',
        intervalosDeHorario: [{ inicio: null, fim: null, valor: null, status: null }],
    },
    {
        diaDaSemana: 'QUARTA',
        intervalosDeHorario: [{ inicio: null, fim: null, valor: null, status: null }],
    },
    {
        diaDaSemana: 'QUINTA',
        intervalosDeHorario: [{ inicio: null, fim: null, valor: null, status: null }],
    },
    {
        diaDaSemana: 'SEXTA',
        intervalosDeHorario: [{ inicio: null, fim: null, valor: null, status: null }],
    },
    {
        diaDaSemana: 'SABADO',
        intervalosDeHorario: [{ inicio: null, fim: null, valor: null, status: null }],
    },
];

const EditarQuadraSkeleton = () => (
    <main className="px-4 sm:px-10 lg:px-40 flex-1 flex items-start justify-center my-6">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-8"></div>
            <div className="space-y-6 mt-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-10 bg-gray-300 rounded-lg w-1/2"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4">
                        </div>
                        <div className="h-10 bg-gray-300 rounded-lg"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4">
                        </div>
                        <div className="h-10 bg-gray-300 rounded-lg"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/3">
                        </div>
                        <div className="h-10 bg-gray-300 rounded-lg"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/2">
                        </div>
                        <div className="h-10 bg-gray-300 rounded-lg"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-14 bg-gray-200 rounded-md"></div>
                    <div className="h-14 bg-gray-200 rounded-md"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-24 bg-gray-300 rounded-lg"></div>
                </div>
                <div className="my-8">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
                    <div className="border border-gray-200 rounded-lg">
                        {Array.from({ length: 7 }).map((_, index) => (
                            <div key={index} className="flex justify-between items-center p-4 border-b border-gray-200 last:border-b-0">
                                <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                                <div className="h-8 w-8 bg-gray-300 rounded-md"></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <div className="h-10 w-28 bg-gray-300 rounded-lg">
                    </div>
                    <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
                </div>
            </div>
        </div>
    </main>
);

export default function EditarQuadra() {
    const params = useParams();
    const quadraId = Number(params?.quadraId as string);
    const { isDarkMode } = useTheme();

    const [form] = Form.useForm();
    const { message } = App.useApp();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [pageLoading, setPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormAltered, setIsFormAltered] = useState(false);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDay, setEditingDay] = useState<any>(null);
    const [horarios, setHorarios] = useState(horariosDaSemanaCompleta);


    useEffect(() => {
        const fetchQuadraData = async () => {
            setPageLoading(true);
            if (status === 'authenticated' && quadraId) {
                try {
                    const quadraData = await getQuadraById(quadraId);
                    if (quadraData) {
                        form.setFieldsValue({
                            nomeQuadra: quadraData.nomeQuadra,
                            tipoQuadra: quadraData.tipoQuadra,
                            materiaisFornecidos: quadraData.materiaisFornecidos,
                            duracaoReserva: quadraData.duracaoReserva,
                            cobertura: quadraData.cobertura,
                            iluminacaoNoturna: quadraData.iluminacaoNoturna,
                            descricao: quadraData.descricao,
                        });

                        setImageUrl(quadraData.urlFotoQuadra || null);

                        const horariosMap = new Map(
                            quadraData.horariosFuncionamento.map(h => [h.diaDaSemana, h.intervalosDeHorario])
                        );

                        const horariosCompletos = horariosDaSemanaCompleta.map(dia => ({
                            ...dia,
                            intervalosDeHorario: horariosMap.get(dia.diaDaSemana) || [],
                        }));

                        setHorarios(horariosCompletos);
                        setIsFormAltered(false);
                    } else {
                        message.error("Quadra não encontrada.");
                        router.back();
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados da quadra:", error);
                    message.error("Não foi possível carregar os dados da quadra.");
                } finally {
                    setPageLoading(false);
                }
            } else if (status === 'unauthenticated') {
                setPageLoading(false);
            }
        };

        if (status !== 'loading') {
            fetchQuadraData();
        }
    }, [status, quadraId, session, form, message, router]);


    const handleSubmit = async (values: any) => {
        if (!session) {
            message.error("Sua sessão expirou. Por favor, faça login novamente.");
            return;
        }
        setIsSubmitting(true);

        try {
            let urlParaSalvar = imageUrl;
            if (selectedFile) {
                const key = 'uploading-image';
                message.loading({ content: 'Carregando...', key, duration: 0 });
                urlParaSalvar = await uploadToImgur(selectedFile);
                console.log("URL da imagem carregada:", urlParaSalvar);
                message.destroy(key);
            }

            const horariosParaEnviar = horarios.map(h => {
                const intervalosValidos = h.intervalosDeHorario.filter(i => i.inicio && i.fim);
                return {
                    diaDaSemana: h.diaDaSemana,
                    intervalosDeHorario: intervalosValidos.map(({ id, ...resto }) => resto)
                };
            });

            const updatePayload: Partial<QuadraCreate> = {
                ...values,
                urlFotoQuadra: urlParaSalvar,
                horariosFuncionamento: horariosParaEnviar,
            };

            const updatedQuadra = await updateQuadra(quadraId, updatePayload);

            if (updatedQuadra) {
                message.success("Quadra atualizada com sucesso!");
                setIsFormAltered(false);
                router.push('/perfil/arena/quadras');
            } else {
                throw new Error("A atualização não retornou dados.");
            }
        } catch (error: any) {
            console.error("Erro ao atualizar quadra:", error.message || error);
            message.error(error.message ?? "Ocorreu um erro ao salvar as alterações.", 7);
        } finally {
            setIsSubmitting(false);
        }
    };

    const showModal = (day: any) => {
        setEditingDay(day);
        setIsModalVisible(true);
    };

    const handleModalSave = (values: { horarios: any[] }) => {
        const novosHorarios = horarios.map(h => {
            if (h.diaDaSemana === editingDay.diaDaSemana) {
                return { ...h, intervalosDeHorario: values.horarios };
            }
            return h;
        });
        setHorarios(novosHorarios);
        setIsModalVisible(false);
        setIsFormAltered(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
    };

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) { message.error('Você só pode fazer upload de arquivos JPG/PNG!'); }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) { message.error('A imagem deve ter no máximo 5MB!'); }
        return isJpgOrPng && isLt5M;
    };

    const handleChange: UploadProps['onChange'] = (info) => {
        setIsFormAltered(true);
        const file = info.file.originFileObj;
        if (file) {
            getBase64(file as FileType)
                .then(base64Url => { setImageUrl(base64Url); })
                .catch(() => message.error("Não foi possível gerar o preview da imagem."));
            setSelectedFile(file as FileType);
        }
    };

    const uploadButton = (<Button > <UploadOutlined className="mr-2" /> Escolher foto </Button>);

    const handleRemoveImage = () => {
        setImageUrl(null);
        setSelectedFile(null);
        message.info('Foto removida.');
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
                        disabled={isSubmitting || status !== 'authenticated'}
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

    if (imageUrl && imageUrl !== null) {
        menuItems.push({
            key: '2',
            label: 'Remover foto',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: handleRemoveImage,
        });
    }

    if (pageLoading || status === 'loading') {
        return <EditarQuadraSkeleton />;
    }

    return (
        <Layout.Content
            className="flex items-start justify-center px-4 sm:px-10 lg:px-40 pt-6 pb-14"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
        >
            <Card
                title={
                    <>
                        <Title level={3} className="!mb-2">Editar quadra</Title>
                        <Typography.Paragraph type="secondary" style={{ whiteSpace: 'normal' }}>
                            Atualize os detalhes da sua quadra e seus horários de funcionamento.
                        </Typography.Paragraph>
                    </>
                }
                className="w-full max-w-3xl mx-auto shadow-xl !pt-6 !mb-2"
                styles={{ header: { borderBottom: 0 } }}
            >
                <Form
                    form={form}
                    name='new_quadra_form'
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete='off'
                    disabled={isSubmitting || status !== 'authenticated'}
                    onValuesChange={() => setIsFormAltered(true)}
                >
                    <Row gutter={[24, 16]}>
                        <Col span={24}>
                            <Form.Item label="Foto da Quadra" className="!mb-2">
                                <div className="flex items-center gap-4">
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
                                    <Flex vertical className='gap-2'>
                                        <Text type="secondary" className="!mb-0 !text-xs">
                                            Recomendamos uma imagem quadrada para melhor visualização
                                        </Text>
                                        <ImgCrop rotationSlider>
                                            <Upload
                                                showUploadList={false}
                                                beforeUpload={beforeUpload}
                                                onChange={handleChange}
                                                onPreview={handlePreview}
                                                maxCount={1}
                                                multiple={false}
                                                accept="image/jpeg,image/png,image/jpg"
                                                disabled={isSubmitting || status !== 'authenticated'}
                                            >
                                                {uploadButton}
                                            </Upload>
                                        </ImgCrop>
                                    </Flex>
                                </div>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Nome da quadra"
                                name="nomeQuadra"
                                rules={[{ required: true, message: 'Por favor, insira o nome da quadra!' }]}
                            >
                                <Input placeholder="Ex: Quadra Principal" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Tipo de quadra"
                                name="tipoQuadra"
                                rules={[{ required: true, message: 'Por favor, selecione o tipo de quadra!' }]}
                            >
                                <Select
                                    placeholder="Selecione um ou vários esportes"
                                    mode="multiple"
                                    allowClear
                                    options={[
                                        { value: 'FUTEBOL_SOCIETY', label: 'Futebol Society' },
                                        { value: 'FUTEBOL_SETE', label: 'Futebol 7' },
                                        { value: 'FUTEBOL_ONZE', label: 'Futebol 11' },
                                        { value: 'FUTSAL', label: 'Futsal' },
                                        { value: 'BEACHTENNIS', label: 'Beach Tennis' },
                                        { value: 'VOLEI', label: 'Vôlei' },
                                        { value: 'FUTEVOLEI', label: 'Futevôlei' },
                                        { value: 'BASQUETE', label: 'Basquete' },
                                        { value: 'HANDEBOL', label: 'Handebol' }


                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Materiais fornecidos" name="materiaisFornecidos">
                                <Select
                                    placeholder="Selecione materiais presentes na quadra"
                                    mode="multiple"
                                    allowClear
                                    options={[
                                        { value: 'BOLA', label: 'Bola' },
                                        { value: 'COLETE', label: 'Colete' },
                                        { value: 'APITO', label: 'Apito' },
                                        { value: 'LUVA', label: 'Luva' },
                                        { value: 'CONE', label: 'Cone' },
                                        { value: 'BOMBA', label: 'Bomba' },
                                        { value: 'MARCADOR_PLACAR', label: 'Marcador de Placar' },
                                        { value: 'BOTAO_GOL', label: 'Botão do Gol' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Duração de cada reserva"
                                name="duracaoReserva"
                                rules={[{ required: true, message: 'Selecione a duração da reserva!' }]}
                            >
                                <Select
                                    placeholder="Selecione uma opção"
                                    options={[
                                        { value: 'TRINTA_MINUTOS', label: '30 minutos' },
                                        { value: 'UMA_HORA', label: '1 hora' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Flex justify="space-between" align="center" className="!px-3 !py-2 border border-gray-200 rounded-md h-full">
                                <Text>Possui cobertura</Text>
                                <Form.Item name="cobertura" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                            </Flex>
                        </Col>
                        <Col xs={24} md={12}>
                            <Flex justify="space-between" align="center" className="!px-3 !py-2 border border-gray-200 rounded-md h-full">
                                <Text>Possui iluminação noturna</Text>
                                <Form.Item name="iluminacaoNoturna" valuePropName="checked" noStyle>
                                    <Switch />
                                </Form.Item>
                            </Flex>
                        </Col>

                        <Col span={24}>
                            <Form.Item label="Descrição" name="descricao" rules={[{ max: 500, message: 'Máximo de 500 caracteres.' }]}>
                                <Input.TextArea
                                    placeholder="Descreva a quadra, suas características e o que a torna especial..."
                                    autoSize={{ minRows: 3, maxRows: 6 }}
                                    count={{ show: true, max: 500 }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className='mt-4 mb-6'>
                        <Title level={5} className="!mb-3">Horários de funcionamento</Title>
                        <List
                            bordered
                            dataSource={horarios}
                            renderItem={(item) => {
                                const isFechado = item.intervalosDeHorario.length === 0 || item.intervalosDeHorario.every(h => !h.inicio && !h.fim);
                                return (
                                    <List.Item
                                        actions={[
                                            <Tooltip key={`edit-tooltip-${item.diaDaSemana}`} title="Editar" placement="top">
                                                <Button
                                                    key={`edit-${item.diaDaSemana}`}
                                                    type="primary"
                                                    shape='circle'
                                                    icon={<EditOutlined />}
                                                    onClick={() => showModal(item)}
                                                    ghost
                                                />
                                            </Tooltip>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={<Text>{formatarDiaSemanaCompleto(item.diaDaSemana)}</Text>}
                                            description={
                                                isFechado ? <Tag color="error">Fechado</Tag> : (
                                                    <Flex wrap="wrap" gap={4}>
                                                        {item.intervalosDeHorario.map((h) => {
                                                            let color: "success" | "processing" | "error" = "success";
                                                            if (h.status === 'INDISPONIVEL') color = "error";
                                                            if (h.status === 'MANUTENCAO') color = "processing";

                                                            const key = `${h.inicio ?? 'null'}-${h.fim ?? 'null'}-${h.valor ?? 'null'}-${h.status ?? 'null'}`;

                                                            return (
                                                                <Tag key={key} color={color} style={{ textDecoration: h.status !== 'DISPONIVEL' ? 'line-through' : 'none' }}>
                                                                    {`${h.inicio} - ${h.fim} | R$ ${h.valor}`}
                                                                </Tag>
                                                            );
                                                        })}
                                                    </Flex>
                                                )
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    </div>

                    <Flex justify="end">
                        <Space size="middle">
                            <ButtonCancelar text='Voltar' onClick={() => router.back()} />
                            <ButtonPrimary
                                text='Salvar alterações'
                                htmlType="submit"
                                loading={isSubmitting}
                                disabled={!isFormAltered || isSubmitting || status !== 'authenticated'}
                            />
                        </Space>
                    </Flex>
                </Form>
            </Card>
            <ModalCriarHorarios
                open={isModalVisible}
                onCancel={handleModalCancel}
                onOk={handleModalSave}
                day={editingDay}
            />
        </Layout.Content>
    );
}
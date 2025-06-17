"use client";

import React, { useEffect, useState } from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Typography,
    Upload,
    Avatar,
    App,
    UploadProps,
    UploadFile,
    Switch,
    MenuProps,
    Dropdown,
} from 'antd';
import {
    PictureOutlined,
    UploadOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import ArenaCard from '@/components/Cards/ArenaCard';
import { Arena, getArenaById } from '@/app/api/entities/arena';
import { useSession } from "next-auth/react";
import ImgCrop from 'antd-img-crop';
import { useRouter, useParams } from 'next/navigation';
import { FileType, getBase64, uploadToImgur } from '@/context/functions/imgur';
import { ButtonCancelar } from '@/components/Buttons/ButtonCancelar';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import ModalCriarHorarios from '@/components/ModalCriarHorarios';
import {
    updateQuadra, getQuadraById, QuadraCreate, DiaDaSemana,
    TipoQuadra, DuracaoReserva, MaterialFornecido,
    StatusHorario
} from '@/app/api/entities/quadra';
import { formatarDiaSemana } from '@/data/mapeamentoDiaSemana';

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

export default function EditarQuadra() {
    const params = useParams();
    const quadraId = Number(params?.quadraId as string);

    const [form] = Form.useForm();
    const { message } = App.useApp();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDay, setEditingDay] = useState<any>(null);
    const [horarios, setHorarios] = useState(horariosDaSemanaCompleta);

    const DEFAULT_AVATAR_URL = "https://i.imgur.com/p0hVrWq.png";

    useEffect(() => {
        const fetchQuadraData = async () => {
            if (status === 'authenticated' && quadraId) {
                setLoading(true);
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

                        setImageUrl(quadraData.urlFotoQuadra || DEFAULT_AVATAR_URL);

                        const horariosMap = new Map(
                            quadraData.horariosFuncionamento.map(h => [h.diaDaSemana, h.intervalosDeHorario])
                        );

                        const horariosCompletos = horariosDaSemanaCompleta.map(dia => ({
                            ...dia,
                            intervalosDeHorario: horariosMap.get(dia.diaDaSemana) || [],
                        }));

                        setHorarios(horariosCompletos);
                    } else {
                        message.error("Quadra não encontrada.");
                        router.back();
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados da quadra:", error);
                    message.error("Não foi possível carregar os dados da quadra.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchQuadraData();
    }, [status, quadraId, session, form, message, router]);


    const handleSubmit = async (values: any) => {
        if (!session) {
            message.error("Sua sessão expirou. Por favor, faça login novamente.");
            return;
        }
        setLoading(true);

        try {
            let urlParaSalvar = imageUrl;
            if (selectedFile) {
                const key = 'uploading-image';
                message.loading({ content: 'Carregando...', key, duration: 0 });
                urlParaSalvar = await uploadToImgur(selectedFile);
                console.log("URL da imagem carregada:", urlParaSalvar);
                message.destroy(key);
            }

            const horariosParaEnviar = horarios
                .filter(h => h.intervalosDeHorario.length > 0 && h.intervalosDeHorario.some(i => i.inicio && i.fim))
                .map(h => ({
                    diaDaSemana: h.diaDaSemana,
                    intervalosDeHorario: h.intervalosDeHorario.map(({ id, ...resto }) => resto)
                }));

            const updatePayload: Partial<QuadraCreate> = {
                ...values,
                urlFotoQuadra: urlParaSalvar,
                horariosFuncionamento: horariosParaEnviar,
            };

            const updatedQuadra = await updateQuadra(quadraId, updatePayload);

            if (updatedQuadra) {
                message.success("Quadra atualizada com sucesso!");
                router.push('/perfil/arena/minhas-quadras');
            } else {
                throw new Error("A atualização não retornou dados.");
            }
        } catch (error) {
            console.error("Erro ao atualizar quadra:", error);
            message.error("Ocorreu um erro ao salvar as alterações. Tente novamente.");
        } finally {
            setLoading(false);
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
        setImageUrl(DEFAULT_AVATAR_URL);
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

    if (imageUrl && imageUrl !== DEFAULT_AVATAR_URL) {
        menuItems.push({
            key: '2',
            label: 'Remover foto',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: handleRemoveImage,
        });
    }

    return (
        <main className="px-4 sm:px-10 lg:px-40 flex-1 flex items-start justify-center my-6">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <Title level={3} className="!mb-2">Editar quadra</Title>
                <Text type="secondary" className="block mb-8">
                    Atualize os detalhes da sua quadra e seus horários de funcionamento.
                </Text>

                <Form
                    form={form}
                    name='new_quadra_form'
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete='off'
                    className="!mt-4"
                    disabled={loading || status !== 'authenticated'}
                >
                    <div className="col-span-1 md:col-span-2">
                        <Form.Item label="Foto ou logomarca da arena" className="!mb-2">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Form.Item
                            label="Nome da quadra"
                            name="nomeQuadra"
                            rules={[{ required: true, message: 'Por favor, insira o nome da quadra!' }]}
                        >
                            <Input placeholder="Campo society" />
                        </Form.Item>
                        <Form.Item
                            label="Tipo de quadra"
                            name="tipoQuadra"
                            rules={[{ required: true, message: 'Por favor, selecione o tipo de quadra!' }]}
                        >
                            <Select
                                placeholder="Selecione um ou vários esportes" mode="multiple" allowClear
                                options={[
                                    { value: 'FUTEBOL_SOCIETY', label: 'Futebol Society' },
                                    { value: 'FUTEBOL_SETE', label: 'Futebol 7' },
                                    { value: 'FUTEBOL_ONZE', label: 'Futebol 11' },
                                    { value: 'FUTSAL', label: 'Futsal' },
                                    { value: 'BEACHTENIS', label: 'Beach Tennis' },
                                    { value: 'VOLEI', label: 'Vôlei' },
                                    { value: 'FUTEVOLEI', label: 'Futevôlei' },
                                    { value: 'BASQUETE', label: 'Basquete' },
                                    { value: 'HANDEBOL', label: 'Handebol' }
                                ]} />

                        </Form.Item>
                        <Form.Item
                            label="Materiais fornecidos"
                            name="materiaisFornecidos"
                        >
                            <Select
                                placeholder="Selecione materiais presentes na quadra"
                                mode="multiple"
                                allowClear
                                options={[
                                    { value: 'BOLA', label: 'Bola' },
                                    { value: 'COLETE', label: 'Colete' },
                                    { value: 'LUVA', label: 'Luva' },
                                    { value: 'CHUTEIRA', label: 'Chuteira' },
                                    { value: 'CONE', label: 'Cone' },
                                ]} />
                        </Form.Item>
                        <Form.Item
                            label="Duracao de cada reserva"
                            name="duracaoReserva"
                            rules={[{ required: true, message: 'Por favor, selecione a duração de cada reserva!' }]}
                        >
                            <Select placeholder="Selecione uma opcao"
                                options={
                                    [
                                        { value: 'TRINTA_MINUTOS', label: '30 minutos' },
                                        { value: 'UMA_HORA', label: '1 hora' },
                                    ]
                                }
                            />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-3 border border-gray-200 rounded-md flex justify-between items-center h-full">
                            <Text>Possui cobertura</Text>
                            <Form.Item
                                name="cobertura"
                                valuePropName="checked"
                                noStyle
                            >
                                <Switch />
                            </Form.Item>
                        </div>

                        <div className="p-3 border border-gray-200 rounded-md flex justify-between items-center h-full">
                            <Text>Possui iluminação</Text>
                            <Form.Item
                                name="iluminacaoNoturna"
                                valuePropName="checked"
                                noStyle
                            >
                                <Switch />
                            </Form.Item>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Form.Item
                            label="Descrição"
                            name="descricao"
                        >
                            <Input.TextArea
                                placeholder="Descreva a quadra, suas características e o que a torna especial..."
                                rows={4}
                                maxLength={500}
                            />
                        </Form.Item>
                    </div>

                    <div className='my-8'>
                        <Title level={5} className="!mb-3">Horários de funcionamento</Title>
                        <div className="border border-gray-200 rounded-lg">
                            {horarios.map((item, index) => (
                                <div key={item.diaDaSemana} className={`flex justify-between items-center p-4 ${index < horarios.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <Text>{formatarDiaSemana(item.diaDaSemana)}</Text>
                                    <div className='flex items-center gap-4'>
                                        <div className="flex flex-col items-end gap-1 text-xs">
                                            {item.intervalosDeHorario.length === 0 || item.intervalosDeHorario.every(h => !h.inicio && !h.fim) ? (
                                                <span className='!text-red-500'>Fechado</span>
                                            ) :
                                                (
                                                    item.intervalosDeHorario.map((h, i) => {
                                                        let statusClass = '';
                                                        if (h.status === 'INDISPONIVEL') {
                                                            statusClass = 'bg-red-100 text-red-600 line-through';
                                                        } else if (h.status === 'MANUTENCAO') {
                                                            statusClass = 'bg-blue-100 text-blue-700 line-through';
                                                        } else {
                                                            statusClass = 'bg-green-100 text-green-700';
                                                        }
                                                        return (
                                                            <React.Fragment key={i}>
                                                                <span className={`py-1 px-2 rounded-md ${statusClass}`}>
                                                                    {`${h.inicio} - ${h.fim} | R$ ${h.valor}`}
                                                                </span>
                                                            </React.Fragment>
                                                        );
                                                    })
                                                )}
                                        </div>
                                        <Button type="text" icon={<EditOutlined className="text-blue-500" />} onClick={() => showModal(item)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <ButtonCancelar text='Cancelar' onClick={router.back} />
                        <ButtonPrimary text='Salvar' type="primary" htmlType="submit" loading={loading} />
                    </div>
                </Form>
            </div>
            <ModalCriarHorarios
                open={isModalVisible}
                onCancel={handleModalCancel}
                onOk={handleModalSave}
                day={editingDay}
            />
        </main>
    );
}
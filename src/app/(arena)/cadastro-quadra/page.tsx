"use client";

import React, { useState } from 'react';
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
} from 'antd';
import {
    PictureOutlined,
    UploadOutlined,
    EditOutlined,
} from '@ant-design/icons';
import ArenaCard from '@/components/ArenaCard';
import { Arena } from '@/app/api/entities/arena';
import ImgCrop from 'antd-img-crop';
import { useRouter } from 'next/navigation';
import { FileType, getBase64, uploadToImgur } from '@/context/functions/imgur';
import { ButtonCancelar } from '@/components/ButtonCancelar';
import { ButtonPrimary } from '@/components/ButtonPrimary';
import ModalCriarHorarios from '@/components/ModalCriarHorarios';

const { Title, Text } = Typography;

const horariosDataInicial = [
    {
        dia: 'Domingo',
        horarios: [
            { inicio: null, fim: null, valor: null, status: null }
        ],
        fechado: true
    },
    {
        dia: 'Segunda-feira',
        horarios: [
            { inicio: '16:00', fim: '19:00', valor: 100, status: "disponivel" },
            { inicio: '19:00', fim: '22:00', valor: 150, status: 'bloqueado' }],
        fechado: false
    },
    {
        dia: 'Terça-feira',
        horarios: [
            { inicio: null, fim: null, valor: null, status: null }
        ],
        fechado: true
    },
    {
        dia: 'Quarta-feira',
        horarios: [
            { inicio: null, fim: null, valor: null, status: null }
        ],
        fechado: true
    },
    {
        dia: 'Quinta-feira',
        horarios: [
            { inicio: '', fim: '', valor: null, status: null }
        ],
        fechado: true
    },
    {
        dia: 'Sexta-feira',
        horarios: [
            { inicio: null, fim: null, valor: null, status: null }
        ],
        fechado: true
    },
    {
        dia: 'Sábado',
        horarios: [
            { inicio: null, fim: null, valor: null, status: null }
        ], fechado: true
    },
];

const arena: Arena = {
    id: 1,
    nome: "Arena A",
    email: "saviosoares0402@gmail.com",
    telefone: "(85) 99999-9999",
    cpfProprietario: "123.456.789-00",
    cnpj: "12.345.678/0001-90",
    endereco: {
        cidade: "Fortaleza",
        estado: "CE",
        rua: "Av. Mister Hull",
        numero: "s/n",
        bairro: "Pici",
        cep: "60455-760",
        complemento: ""
    },
    descricao: "Uma breve descrição da quadra por aqui e estou enchendo linguiça pra completar...",
    urlFoto: "/images/arenaesportes.png",
    role: "ARENA",
};

export default function CadastrarQuadra() {
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDay, setEditingDay] = useState<any>(null);
    const [horarios, setHorarios] = useState(horariosDataInicial);

    const showModal = (day: any) => {
        setEditingDay(day);
        setIsModalVisible(true);
    };

    const handleModalSave = (values: { horarios: any[] }) => {
        const novosHorarios = horarios.map(h =>
            h.dia === editingDay.dia ? { ...h, horarios: values.horarios, fechado: values.horarios.length === 0 } : h
        );
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
        }
    };

    const uploadButton = (<Button loading={loading} > <UploadOutlined className="mr-2" /> Escolher foto </Button>);


    return (
        <main className="px-4 sm:px-10 lg:px-40 flex-1 flex items-start justify-center mt-6">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <Title level={3} className="!mb-2">Cadastrar quadra</Title>
                <Text type="secondary" className="block mb-8">
                    Detalhe sua quadra abaixo e prepare-se para receber novos agendamentos.
                </Text>

                <ArenaCard
                    arena={{
                        ...arena,
                        sports: arena.sports || ["Futebol Society", "Vôlei", "Beach Tennis", "Basquete",],
                        avaliacao: arena.avaliacao ?? 1.0,
                        numeroAvaliacoes: arena.numeroAvaliacoes ?? 10,
                    }}
                    showDescription={false}
                    showHover={false}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => console.log(values)}
                    className="!mt-4"
                >
                    <Form.Item
                        label="Foto da quadra"
                        rules={[{ required: true, message: 'Por favor, faça upload de uma foto da quadra!' }]}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative group cursor-pointer" title="Clique para alterar a foto">
                                <Avatar
                                    size={64}
                                    src={imageUrl ?? undefined}
                                    icon={<PictureOutlined />}
                                    className="flex-shrink-0"
                                />
                            </div>
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
                                        accept="image/jpeg,image/png,image/jpg"
                                        disabled={loading}
                                    >
                                        {uploadButton}
                                    </Upload>
                                </ImgCrop>
                            </div>
                        </div>
                    </Form.Item>

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
                            name="materiais"
                        >
                            <Select
                                placeholder="Selecione materiais presentes na quadra"
                                mode="multiple"
                                allowClear
                                options={[
                                    { value: 'BOLA', label: 'Bola' },
                                    { value: 'REDE', label: 'Rede' },
                                    { value: 'VESTIARIO', label: 'Vestiário' },
                                    { value: 'BANHEIRO', label: 'Banheiro' },
                                    { value: 'ESTACIONAMENTO', label: 'Estacionamento' },
                                    { value: 'AGUA', label: 'Água' },
                                ]} />
                        </Form.Item>
                        <Form.Item
                            label="Duracao de cada reserva"
                            name="duracao"
                            rules={[{ required: true, message: 'Por favor, selecione a duração de cada reserva!' }]}
                        >
                            <Select placeholder="Selecione uma opcao"
                                options={
                                    [
                                        { value: '30', label: '30 minutos' },
                                        { value: '60', label: '1 hora' },
                                    ]
                                }
                            />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-3 border border-gray-200 rounded-md flex justify-between items-center h-full">
                            <Text>Possui cobertura</Text>
                            <Form.Item
                                name="possuiCobertura"
                                valuePropName="checked"
                                noStyle
                            >
                                <Switch />
                            </Form.Item>
                        </div>

                        <div className="p-3 border border-gray-200 rounded-md flex justify-between items-center h-full">
                            <Text>Possui iluminação</Text>
                            <Form.Item
                                name="possuiIluminacao"
                                valuePropName="checked"
                                noStyle
                            >
                                <Switch />
                            </Form.Item>
                        </div>
                    </div>

                    <div className='my-8'>
                        <Title level={5} className="!mb-3">Horários de funcionamento</Title>
                        <div className="border border-gray-200 rounded-lg">
                            {horarios.map((item, index) => (
                                <div key={item.dia} className={`flex justify-between items-center p-4 ${index < horarios.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <Text>{item.dia}</Text>
                                    <div className='flex items-center gap-4'>
                                        <div className="flex items-center gap-1 text-xs">
                                            {item.fechado ? (
                                                <span className='!text-red-500'>Fechado</span>
                                            ) : (
                                                item.horarios.map((h, i) => (
                                                    <React.Fragment key={i}>
                                                        <span className={h.status === 'bloqueado' ? 'text-red-500 line-through' : ''}>
                                                            {`${h.inicio}-${h.fim}`}
                                                        </span>
                                                        {i < item.horarios.length - 1 && <span className="text-gray-400 mx-1">/</span>}
                                                    </React.Fragment>
                                                ))
                                            )}
                                        </div>
                                        <Button type="text" icon={<EditOutlined className="text-blue-500" />} onClick={() => showModal(item)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <ButtonCancelar text='Cancelar' />
                        <ButtonPrimary text='Salvar' type="primary" htmlType="submit" />
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
    )
}
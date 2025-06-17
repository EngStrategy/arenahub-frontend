"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Form, Input, Select, App, Switch, Avatar,
    Upload, GetProp, UploadProps, Button, UploadFile
} from "antd";
import { Estados } from "@/data/Estados";
import Link from "next/link";
import { ButtonPrimary } from "./Buttons/ButtonPrimary";
import { ButtonCancelar } from "./Buttons/ButtonCancelar";
import { validarCPF } from "@/context/functions/validarCPF";
import { formatarTelefone } from "@/context/functions/formatarTelefone";
import { formatarCNPJ } from "@/context/functions/formatarCNPJ";
import { formatarCPF } from "@/context/functions/formatarCPF";
import { formatarCEP } from "@/context/functions/formatarCEP";
import { createArena, ArenaCreate } from "@/app/api/entities/arena";
import { PictureOutlined, UploadOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import { FileType, getBase64, uploadToImgur } from '@/context/functions/imgur';

type CITYResponse = {
    id: number;
    nome: string;
};

export const RegistroArena = ({ className }: { className?: string }) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState<CITYResponse[]>([]);
    const [haveCnpj, setHaveCnpj] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url ?? (file.preview as string));
        setPreviewOpen(true);
    };

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/webp' || file.type === 'image/svg';
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

    const uploadButton = (<Button loading={loading} > <UploadOutlined className="mr-2" /> Escolher foto </Button>);


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

    async function consultarCnpj(cnpj: string) {
        if (!cnpj || cnpj.length < 14) {
            message.error("Por favor, insira um CNPJ válido!", 5);
            return;
        }
        
        message.loading("Consultando CNPJ...");


        const cnpjLimpo = cnpj.replace(/\D/g, "");

        if (cnpjLimpo.length !== 14) {
            message.error("CNPJ deve ter 14 dígitos!", 5);
            return;
        }

        try {
            const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);

            if (!response.ok) {
                throw new Error("CNPJ não encontrado ou inválido.");
            }

            const data = await response.json();
            const estabelecimento = data.estabelecimento;

            form.setFieldsValue({
                nome: data.razao_social,
                estado: estabelecimento.estado.sigla,
                cidade: estabelecimento.cidade.nome,
                rua: estabelecimento.logradouro,
                bairro: estabelecimento.bairro,
                numero: estabelecimento.numero,
                complemento: estabelecimento.complemento,
                cep: estabelecimento.cep,
            });

            message.success("CNPJ consultado com sucesso!", 5);
        } catch (error) {
            console.error("Erro na consulta de CNPJ:", error);
            message.error("Não foi possível consultar o CNPJ. Verifique o número e tente novamente.", 5);
        }
    }

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

    const onFinishFailed = (errorInfo: any) => {
        message.error("Por favor, corrija os erros no formulário.", 5);
        console.log("Failed:", errorInfo);
    };

    const handleSubmit = async (values: any) => {
        console.log("Valores brutos do formulário:", values);

        let urlParaSalvar = imageUrl;
        if (selectedFile) {
            const key = 'uploading-image';
            message.loading({ content: 'Carregando...', key, duration: 0 });
            urlParaSalvar = await uploadToImgur(selectedFile);
            message.destroy(key);
        }

        const {
            nome, email, telefone, senha, cpfProprietario, cnpj, descricao,
            cep, estado, cidade, bairro, rua, numero, complemento
        } = values;

        const payload: ArenaCreate = {
            nome,
            email,
            telefone,
            senha,
            cpfProprietario,
            cnpj: haveCnpj ? cnpj : null,
            descricao,
            urlFoto: urlParaSalvar ?? null,
            endereco: {
                cep: formatarCEP(cep),
                estado,
                cidade,
                bairro,
                rua,
                numero,
                complemento: complemento ?? null,
            },
        };

        console.log("Dados formatados para envio:", payload);

        try {
            setLoading(true);

            if (values.senha !== values.confirmPassword) {
                message.error("As senhas não coincidem.", 5);
                setLoading(false);
                return;
            }

            const response = await createArena(payload);
            setLoading(false);

            if (response) {
                message.success("Conta criada com sucesso!", 5);
                router.push(`/confirm-email?email=${values.email}`);
            } else {
                message.error("Erro ao criar conta. Tente novamente.", 5);
            }
        } catch (error: any) {
            setLoading(false);
            message.error(error.message ?? "Erro ao criar conta. Tente novamente.", 5);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onFinishFailed={onFinishFailed}
            className={className}
        >
            <div className="flex flex-col md:flex-row md:gap-4">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Insira seu email!" },
                        { type: "email", message: "Insira um email válido!" },
                    ]}
                    className="flex-1"
                >
                    <Input placeholder="Insira seu email" />
                </Form.Item>
            </div>

            <div className="flex flex-col md:flex-row md:gap-4">
                <Form.Item
                    label="CPF do proprietário"
                    name="cpfProprietario"
                    rules={[
                        { required: true, message: "Insira seu CPF!" },
                        {
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                if (!validarCPF(value)) {
                                    return Promise.reject("CPF inválido!");
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                    className="flex-1"
                >
                    <Input
                        placeholder="Insira seu CPF"
                        onChange={(e) => {
                            form.setFieldsValue({ cpfProprietario: formatarCPF(e.target.value) });
                        }}
                    />
                </Form.Item>

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
                                    return Promise.reject("Telefone inválido");
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                    className="flex-1"
                >
                    <Input
                        placeholder="(99) 99999-9999"
                        onChange={(e) => {
                            form.setFieldsValue({ telefone: formatarTelefone(e.target.value) });
                        }}
                    />
                </Form.Item>
            </div>

            <div className="flex flex-col md:flex-row md:gap-4">
                <Form.Item
                    label="Senha"
                    name="senha"
                    rules={[
                        { required: true, message: "Insira sua senha!" },
                        { min: 8, message: "Pelo menos 8 caracteres!" },
                    ]}
                    className="flex-1"
                >
                    <Input.Password placeholder="Insira sua senha" />
                </Form.Item>

                <Form.Item
                    label="Confirme sua senha"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                        { required: true, message: "Confirme sua senha!" },
                        { min: 8, message: "Pelo menos 8 caracteres!" },
                    ]}
                    className="flex-1"
                >
                    <Input.Password placeholder="Confirme sua senha" />
                </Form.Item>
            </div>


            <Form.Item
                label="CNPJ"
                name="cnpj"
                rules={[
                    { required: haveCnpj, message: "Insira seu cnpj" },
                    {
                        validator: (_, value) => {
                            if (!haveCnpj || !value) return Promise.resolve();
                            const cnpj = value.replace(/\D/g, "");
                            if (cnpj.length !== 14) {
                                return Promise.reject("CNPJ deve ter 14 dígitos");
                            }
                            let tamanho = cnpj.length - 2;
                            let numeros = cnpj.substring(0, tamanho);
                            const digitos = cnpj.substring(tamanho);
                            let soma = 0;
                            let pos = tamanho - 7;
                            for (let i = tamanho; i >= 1; i--) {
                                soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
                                if (pos < 2) pos = 9;
                            }
                            let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
                            if (resultado !== parseInt(digitos.charAt(0))) {
                                return Promise.reject("CNPJ inválido");
                            }
                            tamanho = tamanho + 1;
                            numeros = cnpj.substring(0, tamanho);
                            soma = 0;
                            pos = tamanho - 7;
                            for (let i = tamanho; i >= 1; i--) {
                                soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
                                if (pos < 2) pos = 9;
                            }
                            resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
                            if (resultado !== parseInt(digitos.charAt(1))) {
                                return Promise.reject("CNPJ inválido");
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
            >
                <Input
                    placeholder="Insira seu CNPJ"
                    disabled={!haveCnpj}
                    onChange={(e) => { form.setFieldsValue({ cnpj: formatarCNPJ(e.target.value) }) }}
                    onBlur={(e) => {
                        if (!haveCnpj) return;
                        consultarCnpj(e.target.value);
                    }}
                />
            </Form.Item>

            <Form.Item className="flex flex-col">
                <div className="flex flex-row flex-wrap justify-between items-center gap-x-4 gap-y-2 bg-gray-200 p-2 rounded-md border border-gray-300">
                    <span>Minha arena não tem CNPJ</span>
                    <Switch
                        size="small"
                        checked={!haveCnpj}
                        onChange={(checked) => setHaveCnpj(!checked)}
                    />
                </div>
                <p className="text-gray-500 mt-1 mb-0">
                    Utilizaremos seu CPF em vez do CNPJ caso selecione esta opção
                </p>
            </Form.Item>

            <Form.Item
                label="Nome da Arena"
                name="nome"
                rules={[
                    { required: true, message: "Insira o nome da sua arena" },
                ]}
                className="flex-1"
            >
                <Input placeholder="Insira o nome da sua arena" />
            </Form.Item>

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
                                return Promise.reject("CEP deve ter 8 dígitos");
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
                className="flex-1"
            >
                <Input
                    placeholder="Insira o CEP da sua arena"
                    onChange={(e) => {
                        form.setFieldsValue({ cep: formatarCEP(e.target.value) });
                    }}
                    onBlur={e => {
                        if (haveCnpj) return;
                        consultarCep(e.target.value);
                    }}
                />
            </Form.Item>

            <div className="flex flex-row gap-4">
                <Form.Item
                    label="Estado"
                    name="estado"
                    rules={[
                        { required: true, message: "Selecione o estado da sua arena" },
                    ]}
                    className="flex-1"
                >
                    <Select placeholder="Estado" options={Estados} />
                </Form.Item>

                <Form.Item
                    label="Cidade"
                    name="cidade"
                    rules={[
                        { required: true, message: "Selecione a cidade da sua arena" },
                    ]}
                    className="flex-1"
                >
                    <Select placeholder="Cidade">
                        <option value="0">Selecione uma cidade</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.nome}>
                                {city.nome}
                            </option>
                        ))}
                    </Select>
                </Form.Item>
            </div>

            <Form.Item
                label="Bairro"
                name="bairro"
                rules={[
                    { required: true, message: "Insira o bairro da sua arena" },
                ]}
                className="flex-1"
            >
                <Input placeholder="Insirao o bairro da sua arena" />
            </Form.Item>

            <Form.Item
                label="Rua"
                name="rua"
                rules={[
                    { required: true, message: "Insira o Rua da sua arena" },
                ]}
                className="flex-1"
            >
                <Input placeholder="Insira o rua da sua arena" />
            </Form.Item>

            <div className="flex flex-row gap-4">
                <Form.Item
                    label="Número"
                    name="numero"
                    rules={[
                        { required: true, message: "Insira o número" },
                    ]}
                    className="flex-1"
                >
                    <Input placeholder="Nº" />
                </Form.Item>

                <Form.Item
                    label="Complemento (opcional)"
                    name="complemento"
                    className="flex-1"
                >
                    <Input placeholder="Insira algo" />
                </Form.Item>
            </div>

            <Form.Item label="Foto ou logomarca da arena" className="!mb-2">
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
                                accept="image/jpeg,image/png/image/jpg"
                                disabled={loading}
                            >
                                {uploadButton}
                            </Upload>
                        </ImgCrop>
                    </div>
                </div>
            </Form.Item>
            <Form.Item label="Foto ou logomarca da arena" className="!mb-2">
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
                                accept="image/jpeg,image/png/image/jpg"
                                disabled={loading}
                            >
                                {uploadButton}
                            </Upload>
                        </ImgCrop>
                    </div>
                </div>
            </Form.Item>

            <Form.Item
                label="Descrição (opcional)"
                name="descricao"
                className="flex-1"
            >
                <Input.TextArea
                    placeholder="Digite algo que descreva sua arena e ajude a atrair mais reservas"
                    autoSize={{ minRows: 3, maxRows: 6 }}
                />
            </Form.Item>
            <div className="flex gap-4 justify-end">
                <ButtonCancelar
                    text="Cancelar"
                    type="primary"
                    onClick={router.back}
                    className="w-50"
                />
                <ButtonPrimary
                    text="Cadastrar arena"
                    type="primary"
                    htmlType="submit"
                    className="w-50"
                    loading={loading}
                    disabled={loading}
                />
            </div>
            <p className="text-gray-800 text-sm mt-4">
                Já possui uma conta?{" "}
                <Link
                    href="/login"
                    className="!underline underline-offset-4 text-green-primary hover:!text-green-500"
                >
                    Entrar
                </Link>
            </p>
        </Form>
    );
};


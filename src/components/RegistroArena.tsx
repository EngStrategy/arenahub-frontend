"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Form, Input, Select, App, Switch, Avatar,
    Upload, UploadProps, Button, UploadFile,
    Progress, Flex, Popover,
    Typography,
    AutoComplete,
    AutoCompleteProps
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
import { useCapsLock } from "@/context/hooks/use-caps-look";
import CapsLock from "./Alerts/CapsLock";
import { useTheme } from "@/context/ThemeProvider";

const { Option } = Select;
const { Text } = Typography;

type CITYResponse = {
    id: number;
    nome: string;
};

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

export const RegistroArena = ({ className }: { className?: string }) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [cities, setCities] = useState<CITYResponse[]>([]);
    const [haveCnpj, setHaveCnpj] = useState(true);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
    const capsLockEstaAtivado = useCapsLock();
    const [options, setOptions] = useState<AutoCompleteProps['options']>([]);


    const handleSearch = (value: string) => {
        setOptions(() => {
            if (!value || value.includes('@')) {
                return [];
            }
            return ['gmail.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'yahoo.com', 'live.com', 'aol.com', 'protonmail.com', 'zoho.com', 'gmx.com'].map((domain) => ({
                label: `${value}@${domain}`,
                value: `${value}@${domain}`,
            }));
        });
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
    };

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/webp' || file.type === 'image/svg';
        if (!isJpgOrPng) { message.error('Você só pode fazer upload de arquivos JPG/PNG/SVG/WEBP!'); }
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
            <Flex vertical className="md:!flex-row" gap="middle">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Insira seu email!" },
                        { type: "email", message: "Insira um email válido!" },
                    ]}
                    className="flex-1"
                >
                    <AutoComplete
                        onSearch={handleSearch}
                        placeholder="Insira seu email"
                        options={options}
                    />
                </Form.Item>
            </Flex>

            <Flex vertical className="md:!flex-row" gap="middle">
                <Form.Item
                    label="CPF do proprietário"
                    name="cpfProprietario"
                    rules={[
                        { required: true, message: "Insira seu CPF!" },
                        {
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                if (!validarCPF(value)) {
                                    return Promise.reject(new Error("CPF inválido!"));
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
                                    return Promise.reject(new Error("Telefone inválido"));
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
            </Flex>

            <Flex vertical className="md:!flex-row" gap="middle">
                <Form.Item
                    label="Senha"
                    name="senha"
                    rules={[
                        { required: password == '', message: "Insira sua senha!" },
                        { min: 8, message: "Pelo menos 8 caracteres!" },
                    ]}
                    className="flex-1"
                >
                    <Popover
                        content={<PasswordStrengthIndicator password={password} />}
                        placement="top"
                        open={isPasswordFocused}
                        getPopupContainer={triggerNode => triggerNode.parentNode as HTMLElement}
                    >
                        <Input.Password
                            placeholder="Insira sua senha"
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

                <Form.Item
                    label="Confirme sua senha"
                    name="confirmPassword"
                    dependencies={["senha"]}
                    hasFeedback
                    rules={[
                        { required: true, message: "Confirme sua senha!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("senha") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("As senhas não coincidem!"));
                            }
                        }),
                    ]}
                    className="flex-1"
                >
                    <Input.Password placeholder="Confirme sua senha" />
                </Form.Item>
            </Flex>

            {capsLockEstaAtivado && (
                <CapsLock />
            )}

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
                                return Promise.reject(new Error("CNPJ inválido"));
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
                                return Promise.reject(new Error("CNPJ inválido"));
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
                <Flex align="center" justify="space-between" className={`w-full !p-2 rounded-md ${isDarkMode ? 'bg-neutral-800' : 'bg-gray-200'}`}>
                    <span>Minha arena não tem CNPJ</span>
                    <Switch
                        size="small"
                        checked={!haveCnpj}
                        onChange={(checked) => setHaveCnpj(!checked)}
                    />
                </Flex>
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

            <Flex vertical className="md:!flex-row" gap="middle">
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
                    <Select placeholder="Cidade" showSearch>
                        {cities.map((city) => (
                            <Option key={city.id} value={city.nome}>
                                {city.nome}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Flex>

            <Form.Item
                label="Bairro"
                name="bairro"
                rules={[
                    { required: true, message: "Insira o bairro da sua arena" },
                ]}
                className="flex-1"
            >
                <Input placeholder="Insira o bairro da sua arena" />
            </Form.Item>

            <Form.Item
                label="Rua"
                name="rua"
                rules={[
                    { required: true, message: "Insira o Rua da sua arena" },
                ]}
                className="flex-1"
            >
                <Input placeholder="Insira a rua da sua arena" />
            </Form.Item>

            <Flex vertical className="md:!flex-row" gap="middle">
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
                    label="Complemento"
                    name="complemento"
                    className="flex-1"
                >
                    <Input placeholder="Insira algo" />
                </Form.Item>
            </Flex>

            <Form.Item label="Foto ou logomarca da arena" className="!mb-2">
                <Flex align="center" className="gap-4">
                    <div className="relative group">
                        <Avatar
                            size={64}
                            src={imageUrl ?? undefined}
                            icon={<PictureOutlined />}
                            className="flex-shrink-0"
                        />
                    </div>
                    <Flex vertical className="gap-2">
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
                                disabled={loading}
                            >
                                {uploadButton}
                            </Upload>
                        </ImgCrop>
                    </Flex>
                </Flex>
            </Form.Item>

            <Form.Item
                label="Descrição (opcional)"
                name="descricao"
                className="!mt-5"
                rules={[{ max: 500, message: 'A descrição deve ter no máximo 500 caracteres.' }]}
            >
                <Input.TextArea
                    placeholder="Digite algo que descreva sua arena e ajude a atrair mais reservas"
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    count={{
                        show: true,
                        max: 500
                    }}
                />
            </Form.Item>

            <Flex className="gap-2 !mb-4">
                <ButtonCancelar
                    text="Cancelar"
                    type="primary"
                    onClick={router.back}
                    className="w-100"
                />

                <ButtonPrimary
                    text="Cadastrar arena"
                    type="primary"
                    htmlType="submit"
                    className="w-100"
                    loading={loading}
                    disabled={loading}
                />
            </Flex>

            <Text>
                Já possui uma conta?{" "}
                <Link
                    href="/login"
                    className="!underline !underline-offset-4 !text-green-500 hover:!text-green-500 ">
                    Entrar
                </Link>
            </Text>
        </Form>
    );
};


"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Form,
  App,
  UploadFile,
  UploadProps,
  Flex,
  Typography,
} from "antd";
import Link from "next/link";
import { ButtonPrimary } from "../../components/Buttons/ButtonPrimary";
import { ButtonCancelar } from "../../components/Buttons/ButtonCancelar";
import { createArena, ArenaCreate } from "@/app/api/entities/arena";
import { FileType, getBase64, uploadToImgur } from "@/context/functions/imgur";
import { useCapsLock } from "@/context/hooks/use-caps-look";
import { formatarCEP } from "@/context/functions/formatarCEP";

import { DadosPessoaisArena } from "./components/DadosPessoaisArena";
import { DadosEnderecoArena } from "./components/DadosEnderecoArena";
import { DadosConfiguracaoArena } from "./components/DadosConfiguracaoArena";

const { Text } = Typography;

type CITYResponse = {
  id: number;
  nome: string;
};

export const RegistroArena = ({ className }: { className?: string }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [cities, setCities] = useState<CITYResponse[]>([]);
  const [haveCnpj, setHaveCnpj] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const capsLockEstaAtivado = useCapsLock();
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [fullAddress, setFullAddress] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<string | null>(null);
  const [tipoChavePix, setTipoChavePix] = useState<
    "EMAIL" | "CPF" | "CNPJ" | "TELEFONE" | "ALEATORIA" | null
  >(null);

  const numero = Form.useWatch("numero", form);
  const rua = Form.useWatch("rua", form);
  const bairro = Form.useWatch("bairro", form);
  const cidade = Form.useWatch("cidade", form);
  const estado = Form.useWatch("estado", form);

  useEffect(() => {
    if (rua && cidade && estado) {
      setFullAddress(
        `${rua}, ${numero || ""}, ${bairro}, ${cidade}, ${estado}`,
      );
    }
  }, [rua, numero, bairro, cidade, estado]);

  const handleCoordinatesChange = useCallback(
    (lat: number, lng: number) => {
      form.setFieldsValue({
        latitude: Number.parseFloat(lat.toFixed(6)),
        longitude: Number.parseFloat(lng.toFixed(6)),
      });
    },
    [form],
  );

  const handleSearch = (value: string) => {
    setOptions(() => {
      if (!value || value.includes("@")) {
        return [];
      }
      return [
        "gmail.com",
        "outlook.com",
        "hotmail.com",
        "icloud.com",
        "yahoo.com",
        "live.com",
        "aol.com",
        "protonmail.com",
        "zoho.com",
        "gmx.com",
      ].map((domain) => ({
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
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg" ||
      file.type === "image/webp" ||
      file.type === "image/svg";
    if (!isJpgOrPng) {
      message.error("Você só pode fazer upload de arquivos JPG/PNG/SVG/WEBP!");
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("A imagem deve ter no máximo 5MB!");
    }
    return isJpgOrPng && isLt5M;
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      getBase64(file as FileType)
        .then((base64Url) => {
          setImageUrl(base64Url);
        })
        .catch(() =>
          message.error("Não foi possível gerar o preview da imagem."),
        );
      setSelectedFile(file as FileType);
    }
  };

  useEffect(() => {
    if (!estado || estado === "0") {
      setCities([]);
      return;
    }
    axios
      .get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`,
      )
      .then((response) => {
        setCities(response.data);
      });
  }, [estado]);

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
      message.error(
        "Não foi possível consultar o CNPJ. Verifique o número e tente novamente.",
        5,
      );
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
        const response = await axios.get(
          `https://viacep.com.br/ws/${cleanCep}/json/`,
        );
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
  };

  const handleSubmit = async (values: any) => {
    let urlParaSalvar = imageUrl;
    if (selectedFile) {
      const key = "uploading-image";
      message.loading({ content: "Carregando...", key, duration: 0 });
      urlParaSalvar = await uploadToImgur(selectedFile);
      message.destroy(key);
    }
    const formaPagamentoFinal =
      formaPagamento === "PIX" || formaPagamento === "AMBOS"
        ? formaPagamento
        : null;

    const {
      nome,
      email,
      telefone,
      senha,
      cpfProprietario,
      cnpj,
      descricao,
      cep,
      estado,
      cidade,
      bairro,
      rua,
      numero,
      complemento,
      horasCancelarAgendamento,
      tipoChavePix,
      chavePix,
      latitude,
      longitude,
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
      horasCancelarAgendamento: horasCancelarAgendamento ?? 2,
      formaPagamento: formaPagamentoFinal,
      tipoChavePix,
      chavePix: chavePix || null,
      endereco: {
        cep: formatarCEP(cep),
        estado,
        cidade,
        bairro,
        rua,
        numero,
        complemento: complemento ?? null,
        latitude: latitude ? Number.parseFloat(latitude) : null,
        longitude: longitude ? Number.parseFloat(longitude) : null,
      },
    };

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
        router.push(`/confirmar-email?email=${values.email}`);
      } else {
        message.error("Erro ao criar conta. Tente novamente.", 5);
      }
    } catch (error: any) {
      setLoading(false);
      message.error(
        error.message ?? "Erro ao criar conta. Tente novamente.",
        5,
      );
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
      <DadosPessoaisArena
        form={form}
        options={options}
        handleSearch={handleSearch}
        password={password}
        setPassword={setPassword}
        isPasswordFocused={isPasswordFocused}
        setIsPasswordFocused={setIsPasswordFocused}
        haveCnpj={haveCnpj}
        setHaveCnpj={setHaveCnpj}
        consultarCnpj={consultarCnpj}
        capsLockEstaAtivado={capsLockEstaAtivado}
      />

      <DadosEnderecoArena
        form={form}
        haveCnpj={haveCnpj}
        consultarCep={consultarCep}
        cities={cities}
        fullAddress={fullAddress}
        handleCoordinatesChange={handleCoordinatesChange}
      />

      <DadosConfiguracaoArena
        form={form}
        imageUrl={imageUrl}
        loading={loading}
        beforeUpload={beforeUpload}
        handleChange={handleChange}
        handlePreview={handlePreview}
        formaPagamento={formaPagamento}
        setFormaPagamento={setFormaPagamento}
        tipoChavePix={tipoChavePix}
        setTipoChavePix={setTipoChavePix}
        options={options}
        handleSearch={handleSearch}
      />

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
          className="!underline !underline-offset-4 !text-green-500 hover:!text-green-500 "
        >
          Entrar
        </Link>
      </Text>
    </Form>
  );
};

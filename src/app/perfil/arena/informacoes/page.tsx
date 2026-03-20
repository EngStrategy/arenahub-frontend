"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  App,
  Button,
  Flex,
  Row,
  Card,
  Typography,
  Space,
  type MenuProps,
  type GetProp,
  type UploadFile,
  type UploadProps,
  Upload,
} from "antd";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { ButtonCancelar } from "@/components/Buttons/ButtonCancelar";
import ImgCrop from "antd-img-crop";
import { getArenaById, updateArena, Arena } from "@/app/api/entities/arena";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/hooks/use-auth";

import { InformacoesPessoaisArenaSkeleton } from "./components/InformacoesPessoaisArenaSkeleton";
import { FotoArenaForm } from "./components/FotoArenaForm";
import { DadosGeraisArenaForm } from "./components/DadosGeraisArenaForm";
import { EnderecoArenaForm } from "./components/EnderecoArenaForm";
import { ConfiguracaoArenaForm } from "./components/ConfiguracaoArenaForm";

const { Text, Title } = Typography;

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
  formaPagamento: "PIX" | "LOCAL" | "AMBOS" | null;
  tipoChavePix: "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "ALEATORIA" | null;
  chavePix: string | null;
  horasCancelarAgendamento: number;
  descricao: string;
  urlFoto: string;
  latitude: number;
  longitude: number;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

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
  formData.append("image", imageFile);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Falha no upload do arquivo.");
  }
  return data.link;
};

export default function InformacoesPessoaisArena() {
  const {
    user,
    statusSession,
    updateSession,
    isAuthenticated,
    isLoadingSession,
  } = useAuth();
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
  const [fullAddress, setFullAddress] = useState("");
  const DEFAULT_AVATAR_URL = "https://i.imgur.com/p0hVrWq.png";
  const [formaPagamento, setFormaPagamento] = useState<
    "PIX" | "LOCAL" | "AMBOS" | null
  >(null);
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
      setIsFormAltered(true); 
    },
    [form],
  );

  useEffect(() => {
    const estadoSelecionado = form.getFieldValue("estado");
    if (estadoSelecionado === "0" || !estadoSelecionado) {
      return;
    }
    axios
      .get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`,
      )
      .then((response) => {
        setCities(response.data);
      });
  }, [form.getFieldValue("estado"), estado]);

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

  const fetchAndSetUserData = useCallback(async () => {
    if (isAuthenticated && user?.userId && user?.accessToken) {
      try {
        const userData = await getArenaById(user.userId);
        if (!userData)
          return message.warning("Dados do usuário não encontrados.");

        const initialLatitude = userData.endereco?.latitude ?? undefined;
        const initialLongitude = userData.endereco?.longitude ?? undefined;

        form.setFieldsValue({
          nome: userData.nome,
          telefone: userData.telefone,
          email: userData.email,
          cep: userData.endereco?.cep ?? "",
          estado: userData.endereco?.estado ?? "",
          cidade: userData.endereco?.cidade ?? "",
          bairro: userData.endereco?.bairro ?? "",
          rua: userData.endereco?.rua ?? "",
          numero: userData.endereco?.numero ?? "",
          complemento: userData.endereco?.complemento ?? "",
          descricao: userData.descricao ?? "",
          horasCancelarAgendamento: userData.horasCancelarAgendamento ?? 2,
          formaPagamento: userData.formaPagamento ?? "",
          tipoChavePix: userData.tipoChavePix ?? null,
          chavePix: userData.chavePix ?? null,
          urlFoto: userData.urlFoto ?? null,
          latitude: initialLatitude,
          longitude: initialLongitude,
        });

        setFormaPagamento(userData.formaPagamento ?? null);
        setTipoChavePix(userData.tipoChavePix ?? null);
        setImageUrl(userData.urlFoto ?? null);
        setSelectedFile(null);
        setIsFormAltered(false);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        message.error("Erro ao carregar dados do usuário.");
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [statusSession, user, form, message, isAuthenticated]);

  useEffect(() => {
    if (!isLoadingSession) {
      setIsPageLoading(true);
      fetchAndSetUserData().finally(() => {
        setIsPageLoading(false);
      });
    }
  }, [statusSession, fetchAndSetUserData, isLoadingSession]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
  };

  const onFinishFailed = () => {
    message.error("Falha ao salvar informações. Verifique os campos.");
  };

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Você só pode fazer upload de arquivos JPG/PNG!");
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
      setIsFormAltered(true);
    }
  };

  const uploadButton = (
    <Button loading={isSubmitting}>
      {" "}
      <UploadOutlined className="mr-2" /> Escolher foto{" "}
    </Button>
  );

  const handleRemoveImage = () => {
    setImageUrl(DEFAULT_AVATAR_URL);
    setSelectedFile(null);
    setIsFormAltered(true);
    message.info(
      'Foto removida. Clique em "Salvar alterações" para confirmar.',
    );
  };

  const onFinish = async (values: PersonalInfoFormValues) => {
    if (!isAuthenticated || !user?.userId || !user?.accessToken) {
      message.error("Você não está autenticado.");
      return;
    }
    setIsSubmitting(true);
    try {
      let urlParaSalvar = imageUrl;
      if (selectedFile) {
        const key = "uploading-image";
        message.loading({ content: "Carregando...", key, duration: 0 });
        urlParaSalvar = await uploadToImgur(selectedFile);
        message.destroy(key);
      }
      const updatedData: Partial<Arena> = {
        nome: values.nome,
        telefone: values.telefone,
        endereco: {
          cep: values.cep ?? "",
          estado: values.estado ?? "",
          cidade: values.cidade ?? "",
          bairro: values.bairro ?? "",
          rua: values.rua ?? "",
          numero: values.numero ?? "",
          complemento: values.complemento ?? "",
          latitude: values.latitude,
          longitude: values.longitude,
        },
        horasCancelarAgendamento: values.horasCancelarAgendamento ?? 2,
        formaPagamento: values.formaPagamento ?? null,
        tipoChavePix: values.tipoChavePix ?? null,
        chavePix: values.chavePix ?? null,
        descricao: values.descricao ?? "",
        urlFoto: urlParaSalvar ?? undefined,
      };
      await updateArena(user.userId, updatedData);
      await updateSession({
        name: updatedData.nome,
        picture: updatedData.urlFoto,
      });

      message.success("Informações salvas com sucesso!");
      setIsFormAltered(false);
      fetchAndSetUserData();
      await new Promise((resolve) =>
        setTimeout(() => {
          router.push("/dashboard");
          resolve(null);
        }, 2000),
      );
    } catch (error: any) {
      message.error(
        `${error instanceof Error ? error.message : "Tente novamente."}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <ImgCrop rotationSlider>
          <Upload
            showUploadList={false}
            beforeUpload={beforeUpload as any}
            onChange={handleChange}
            maxCount={1}
            multiple={false}
            accept="image/jpeg,image/png"
            disabled={isSubmitting ?? !isAuthenticated}
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
      key: "2",
      label: "Remover foto",
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
      justify="center"
      align="start"
      className="sm:!px-10 lg:!px-40 !px-4 !pt-6 !pb-20"
      style={{
        backgroundColor: isDarkMode
          ? "var(--cor-fundo-dark)"
          : "var(--cor-fundo-light)",
      }}
    >
      <Card
        title={
          <>
            <Typography.Title level={3} className="!mb-2">
              Informações da arena
            </Typography.Title>
            <Typography.Paragraph
              type="secondary"
              style={{ whiteSpace: "normal" }}
            >
              Gerencie suas informações pessoais e salve as alterações caso
              realize alguma mudança.
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
          disabled={isPageLoading || isSubmitting || !isAuthenticated}
        >
          <Row gutter={[24, 24]} className="!gap-0">
            <FotoArenaForm
               imageUrl={imageUrl}
               menuItems={menuItems}
               beforeUpload={beforeUpload as any}
               handleChange={handleChange}
               handlePreview={handlePreview as any}
               isSubmitting={isSubmitting}
               isAuthenticated={isAuthenticated}
               uploadButton={uploadButton}
            />

            <DadosGeraisArenaForm form={form} />

            <EnderecoArenaForm
               form={form}
               cities={cities}
               consultarCep={consultarCep}
               fullAddress={fullAddress}
               handleCoordinatesChange={handleCoordinatesChange}
            />

            <ConfiguracaoArenaForm
               form={form}
               formaPagamento={formaPagamento}
               setFormaPagamento={setFormaPagamento}
               tipoChavePix={tipoChavePix}
               setTipoChavePix={setTipoChavePix}
            />
          </Row>

          <Flex justify="end" className="mt-8">
            <Space size="middle">
              <ButtonCancelar
                text={!isFormAltered ? "Voltar" : "Cancelar"}
                onClick={() => {
                  if (!isFormAltered || isSubmitting || !isAuthenticated) {
                    router.back();
                    return;
                  }
                  fetchAndSetUserData();
                }}
              />
              <ButtonPrimary
                text="Salvar alterações"
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={!isFormAltered || isSubmitting || !isAuthenticated}
              />
            </Space>
          </Flex>
        </Form>
      </Card>
    </Flex>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, App, Progress, Popover, Flex, Typography, AutoCompleteProps, AutoComplete } from "antd";
import Link from "next/link";
import { ButtonPrimary } from "@/components/Buttons/ButtonPrimary";
import { createAtleta } from '@/app/api/entities/atleta';
import { formatarTelefone } from "@/context/functions/formatarTelefone";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useCapsLock } from "@/context/hooks/useCapsLook";
import CapsLock from "./Alerts/CapsLock";
import { ButtonCancelar } from "./Buttons/ButtonCancelar";

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


export const RegistroAtleta = ({ className }: { className?: string }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const capsLockEstaAtivado = useCapsLock();

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

  const onFinishFailed = (errorInfo: any) => {
    message.error("Por favor, corrija os erros no formulário.", 5);
    console.log("Failed:", errorInfo);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (values.senha !== values.confirmPassword) {
        message.error("As senhas não coincidem.", 5);
        setLoading(false);
        return;
      }

      const response = await createAtleta(values);
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
  }

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
          label="Nome"
          name="nome"
          rules={[{ required: true, message: "Insira seu nome!" }]}
          className="sem-asterisco flex-1"
        >
          <Input placeholder="Insira o seu nome" />
        </Form.Item>
      </Flex>

      <Flex vertical className="md:!flex-row" gap="middle">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Insira seu email!" },
            { type: "email", message: "Insira um email válido!" },
          ]}
          className="sem-asterisco flex-1"
        >
          <AutoComplete
            onSearch={handleSearch}
            placeholder="Insira seu email"
            options={options}
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
          className="sem-asterisco flex-1"
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
          className="sem-asterisco flex-1"
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
          className="sem-asterisco flex-1"
        >
          <Input.Password placeholder="Confirme sua senha" />
        </Form.Item>
      </Flex>

      {capsLockEstaAtivado && (
        <CapsLock />
      )}

      <Flex className="gap-2 !mb-4">
        <ButtonCancelar
          text="Cancelar"
          type="primary"
          onClick={router.back}
          className="w-100"
        />
        <ButtonPrimary
          text="Criar conta"
          type="primary"
          htmlType="submit"
          className="w-100"
          loading={loading}
          disabled={loading}
        />
      </Flex>

      <Typography.Text>
        Já possui uma conta?{" "}
        <Link
          href="/login"
          className="!underline !underline-offset-4 !text-green-500 hover:!text-green-500 ">
          Entrar
        </Link>
      </Typography.Text>
    </Form>
  );
};
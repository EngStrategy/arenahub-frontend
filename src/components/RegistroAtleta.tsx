"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, App } from "antd";
import Link from "next/link";
import { ButtonPrimary } from "./ButtonPrimary";
import { createAtleta } from '@/app/api/entities/atleta';
import { formatarTelefone } from "@/context/functions/formatarTelefone";

export const RegistroAtleta = ({ className }: { className?: string }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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
      initialValues={{}}
    >
      <div className="flex flex-col md:flex-row md:gap-4">
        <Form.Item
          label="Nome"
          name="nome"
          rules={[{ required: true, message: "Insira seu nome!" }]}
          className="sem-asterisco flex-1"
        >
          <Input placeholder="Insira o seu nome" />
        </Form.Item>
      </div>

      <div className="flex flex-col md:flex-row md:gap-4">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Insira seu email!" },
            { type: "email", message: "Insira um email válido!" },
          ]}
          className="sem-asterisco flex-1"
        >
          <Input placeholder="Insira seu email" />
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
          className="sem-asterisco flex-1"
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
          className="sem-asterisco flex-1"
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
          className="sem-asterisco flex-1"
        >
          <Input.Password placeholder="Confirme sua senha" />
        </Form.Item>
      </div>

      <ButtonPrimary
        text="Criar conta"
        type="primary"
        htmlType="submit"
        className="w-full"
        loading={loading}
        disabled={loading}
      />

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
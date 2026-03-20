import React from "react";
import { Form, Col, Input, FormInstance } from "antd";
import { formatarTelefone } from "@/context/functions/formatarTelefone";

interface DadosGeraisArenaFormProps {
  form: FormInstance;
}

export const DadosGeraisArenaForm = ({ form }: DadosGeraisArenaFormProps) => {
  return (
    <>
      <Col xs={24} md={12}>
        <Form.Item label="E-mail" name="email">
          <Input name="email" disabled />
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
              form.setFieldsValue({
                telefone: formatarTelefone(e.target.value),
              });
            }}
          />
        </Form.Item>
      </Col>
    </>
  );
};

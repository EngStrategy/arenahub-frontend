import React from "react";
import { Form, Col, Row, Select, InputNumber, Input, FormInstance } from "antd";
import { formatarCPF } from "@/context/functions/formatarCPF";
import { formatarCNPJ } from "@/context/functions/formatarCNPJ";
import { formatarTelefone } from "@/context/functions/formatarTelefone";
import { validarCPF } from "@/context/functions/validarCPF";

interface ConfiguracaoArenaFormProps {
  form: FormInstance;
  formaPagamento: "PIX" | "LOCAL" | "AMBOS" | null;
  setFormaPagamento: (val: "PIX" | "LOCAL" | "AMBOS" | null) => void;
  tipoChavePix: "EMAIL" | "CPF" | "CNPJ" | "TELEFONE" | "ALEATORIA" | null;
  setTipoChavePix: (val: "EMAIL" | "CPF" | "CNPJ" | "TELEFONE" | "ALEATORIA" | null) => void;
}

export const ConfiguracaoArenaForm = ({
  form,
  formaPagamento,
  setFormaPagamento,
  tipoChavePix,
  setTipoChavePix,
}: ConfiguracaoArenaFormProps) => {
  return (
    <>
      <Col xs={24} md={12}>
        <Form.Item
          label="Política de Cancelamento"
          name="horasCancelarAgendamento"
          tooltip="Defina o prazo mínimo, em horas, que um atleta pode cancelar um agendamento sem custos."
          rules={[{ required: true, message: "Este campo é obrigatório." }]}
          initialValue={2}
          className="!mt-5"
        >
          <InputNumber
            min={1}
            max={168}
            addonAfter="horas de antecedência"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          label="Métodos de pagamento aceitos"
          name="formaPagamento"
          tooltip="Indique quais métodos de pagamento sua arena aceita"
          rules={[{ required: true, message: "Este campo é obrigatório." }]}
          className="!mt-5"
        >
          <Select
            placeholder="Selecione o método de pagamento"
            onChange={(value) => {
              setFormaPagamento(value);
            }}
          >
            <Select.Option value="LOCAL">Na Arena</Select.Option>
            <Select.Option value="PIX">PIX</Select.Option>
            <Select.Option value="AMBOS">Na Arena e PIX</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      {(formaPagamento === "PIX" || formaPagamento === "AMBOS") && (
        <Col xs={24}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tipo de Chave Pix"
                name="tipoChavePix"
                rules={[
                  {
                    required: true,
                    message: "Selecione o tipo de chave Pix",
                  },
                ]}
              >
                <Select
                  placeholder="Selecione o tipo"
                  onChange={(value) => {
                    setTipoChavePix(value);
                    form.setFieldsValue({ chavePix: "" });
                  }}
                >
                  <Select.Option value="CPF">CPF</Select.Option>
                  <Select.Option value="CNPJ">CNPJ</Select.Option>
                  <Select.Option value="EMAIL">Email</Select.Option>
                  <Select.Option value="TELEFONE">Telefone</Select.Option>
                  <Select.Option value="ALEATORIA">Aleatória</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Chave Pix"
                name="chavePix"
                rules={[
                  { required: true, message: "Insira sua chave Pix" },
                  {
                    validator: (_, value) => {
                      if (!value || !tipoChavePix) return Promise.resolve();

                      const cleanValue = value.replace(/\D/g, "");

                      if (tipoChavePix === "CPF") {
                        if (!validarCPF(value)) {
                          return Promise.reject(new Error("CPF inválido!"));
                        }
                      } else if (tipoChavePix === "CNPJ") {
                        if (cleanValue.length !== 14) {
                          return Promise.reject(new Error("CNPJ deve ter 14 dígitos!"));
                        }
                        let tamanho = cleanValue.length - 2;
                        let numeros = cleanValue.substring(0, tamanho);
                        const digitos = cleanValue.substring(tamanho);
                        let soma = 0;
                        let pos = tamanho - 7;
                        for (let i = tamanho; i >= 1; i--) {
                          soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--;
                          if (pos < 2) pos = 9;
                        }
                        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
                        if (resultado !== Number.parseInt(digitos.charAt(0))) {
                          return Promise.reject(new Error("CNPJ inválido!"));
                        }
                        tamanho = tamanho + 1;
                        numeros = cleanValue.substring(0, tamanho);
                        soma = 0;
                        pos = tamanho - 7;
                        for (let i = tamanho; i >= 1; i--) {
                          soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--;
                          if (pos < 2) pos = 9;
                        }
                        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
                        if (resultado !== Number.parseInt(digitos.charAt(1))) {
                          return Promise.reject(new Error("CNPJ inválido!"));
                        }
                      } else if (tipoChavePix === "EMAIL") {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                          return Promise.reject(new Error("Email inválido!"));
                        }
                      } else if (tipoChavePix === "TELEFONE") {
                        if (cleanValue.length !== 11) {
                          return Promise.reject(new Error("Telefone inválido! (11 dígitos)"));
                        }
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
                hasFeedback
              >
                {tipoChavePix === "CPF" && (
                  <Input
                    placeholder="000.000.000-00"
                    onChange={(e) => {
                      form.setFieldsValue({
                        chavePix: formatarCPF(e.target.value),
                      });
                    }}
                  />
                )}
                {tipoChavePix === "CNPJ" && (
                  <Input
                    placeholder="00.000.000/0000-00"
                    onChange={(e) => {
                      form.setFieldsValue({
                        chavePix: formatarCNPJ(e.target.value),
                      });
                    }}
                  />
                )}
                {tipoChavePix === "EMAIL" && (
                  <Input
                    placeholder="Insira seu email"
                    onChange={(e) => {
                      form.setFieldsValue({ chavePix: e.target.value });
                    }}
                  />
                )}
                {tipoChavePix === "TELEFONE" && (
                  <Input
                    placeholder="(99) 99999-9999"
                    onChange={(e) => {
                      form.setFieldsValue({
                        chavePix: formatarTelefone(e.target.value),
                      });
                    }}
                  />
                )}
                {tipoChavePix === "ALEATORIA" && (
                  <Input
                    placeholder="Insira a chave aleatória"
                    onChange={(e) => {
                      form.setFieldsValue({
                        chavePix: e.target.value,
                      });
                    }}
                  />
                )}
                {!tipoChavePix && (
                  <Input placeholder="Selecione o tipo de chave" disabled />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Col>
      )}

      <Col xs={24} md={12}>
        <Form.Item
          label="Descrição (opcional)"
          name="descricao"
          rules={[
            {
              max: 500,
              message: "A descrição deve ter no máximo 500 caracteres.",
            },
          ]}
        >
          <Input.TextArea
            placeholder="Digite algo que descreva sua arena e ajude a atrair mais reservas"
            autoSize={{ minRows: 3, maxRows: 6 }}
            count={{ show: true, max: 500 }}
          />
        </Form.Item>
      </Col>
    </>
  );
};

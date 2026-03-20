import React from "react";
import { Form, Col, Input, Select, Row, Typography, Alert, FormInstance } from "antd";
import { formatarCEP } from "@/context/functions/formatarCEP";
import { Estados } from "@/data/Estados";
import { MapaInterativoBusca } from "@/components/Mapa/MapaInterativoBusca";

const { Text, Title } = Typography;

interface EnderecoArenaFormProps {
  form: FormInstance;
  cities: { id: number; nome: string }[];
  consultarCep: (cep: string) => Promise<void>;
  fullAddress: string;
  handleCoordinatesChange: (lat: number, lng: number) => void;
}

export const EnderecoArenaForm = ({
  form,
  cities,
  consultarCep,
  fullAddress,
  handleCoordinatesChange,
}: EnderecoArenaFormProps) => {
  return (
    <>
      <Col xs={24} md={12}>
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
                  return Promise.reject(new Error("CEP deve ter 8 dígitos"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            placeholder="Insira o CEP da sua arena"
            onChange={(e) => {
              form.setFieldsValue({ cep: formatarCEP(e.target.value) });
            }}
            onBlur={(e) => {
              consultarCep(e.target.value);
            }}
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Estado"
              name="estado"
              rules={[{ required: true, message: "Selecione o estado" }]}
            >
              <Select placeholder="Estado" options={Estados} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Cidade"
              name="cidade"
              rules={[{ required: true, message: "Selecione a cidade" }]}
            >
              <Select
                placeholder="Cidade"
                options={cities.map((city) => ({
                  label: city.nome,
                  value: city.nome,
                  key: city.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          label="Bairro"
          name="bairro"
          rules={[{ required: true, message: "Insira o bairro" }]}
        >
          <Input placeholder="Insira o bairro da sua arena" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          label="Rua"
          name="rua"
          rules={[{ required: true, message: "Insira a rua" }]}
        >
          <Input placeholder="Insira a rua da sua arena" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          label="Número"
          name="numero"
          rules={[{ required: true, message: "Insira o número" }]}
        >
          <Input placeholder="Nº" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item label="Complemento (opcional)" name="complemento">
          <Input placeholder="Ex: Bloco A, Apto 101" />
        </Form.Item>
      </Col>

      <Col xs={24}>
        <div className="my-6">
          <Title level={5}>Localização no Mapa</Title>
          <Text type="secondary">
            O mapa busca a localização com base no endereço. Você pode
            arrastar o marcador para ajustar a posição exata, atualizando
            as coordenadas.
          </Text>
          <div className="mt-4">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <MapaInterativoBusca
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                addressToSearch={fullAddress}
                onCoordinatesChange={handleCoordinatesChange}
                initialLat={form.getFieldValue("latitude")}
                initialLng={form.getFieldValue("longitude")}
              />
            ) : (
              <div style={{ margin: "16px 0" }}>
                <Alert
                  message="Erro: Chave da API do Google Maps não encontrada."
                  description="Por favor, contate o administrador do sistema para configurar a chave da API do Google Maps."
                  type="error"
                  showIcon
                />
              </div>
            )}
          </div>
        </div>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          label="Latitude"
          name="latitude"
          rules={[
            {
              required: true,
              message: "As coordenadas são obrigatórias.",
            },
          ]}
        >
          <Input placeholder="Selecione no mapa" disabled />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label="Longitude"
          name="longitude"
          rules={[
            {
              required: true,
              message: "As coordenadas são obrigatórias.",
            },
          ]}
        >
          <Input placeholder="Selecione no mapa" disabled />
        </Form.Item>
      </Col>
    </>
  );
};

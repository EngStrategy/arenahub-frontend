import { Form, Input, Select, Flex, Typography, Alert, FormInstance } from "antd";
import { formatarCEP } from "@/context/functions/formatarCEP";
import { Estados } from "@/data/Estados";
import { MapaInterativoBusca } from "@/components/Mapa/MapaInterativoBusca";

const { Option } = Select;
const { Title, Text } = Typography;

interface DadosEnderecoArenaProps {
  form: FormInstance;
  haveCnpj: boolean;
  consultarCep: (cep: string) => Promise<void>;
  cities: { id: number; nome: string }[];
  fullAddress: string;
  handleCoordinatesChange: (lat: number, lng: number) => void;
}

export const DadosEnderecoArena = ({
  form,
  haveCnpj,
  consultarCep,
  cities,
  fullAddress,
  handleCoordinatesChange,
}: DadosEnderecoArenaProps) => {
  return (
    <>
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
        className="flex-1"
      >
        <Input
          placeholder="Insira o CEP da sua arena"
          onChange={(e) => {
            const valorFormatado = formatarCEP(e.target.value);
            form.setFieldsValue({ cep: valorFormatado });

            const cepLimpo = valorFormatado.replace(/\D/g, "");

            if (!haveCnpj && cepLimpo.length === 8) {
              consultarCep(cepLimpo);
            }
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
        rules={[{ required: true, message: "Insira o bairro da sua arena" }]}
        className="flex-1"
      >
        <Input placeholder="Insira o bairro da sua arena" />
      </Form.Item>

      <Form.Item
        label="Rua"
        name="rua"
        rules={[{ required: true, message: "Insira o Rua da sua arena" }]}
        className="flex-1"
      >
        <Input placeholder="Insira a rua da sua arena" />
      </Form.Item>

      <Flex vertical className="md:!flex-row" gap="middle">
        <Form.Item
          label="Número"
          name="numero"
          rules={[{ required: true, message: "Insira o número" }]}
          className="flex-1"
        >
          <Input placeholder="Nº" />
        </Form.Item>

        <Form.Item label="Complemento" name="complemento" className="flex-1">
          <Input placeholder="Insira algo" />
        </Form.Item>
      </Flex>

      <div className="my-6">
        <Title level={5}>Localização no Mapa</Title>
        <Text type="secondary">
          Após preencher o endereço, o mapa buscará a localização. Você pode
          arrastar o marcador para ajustar a posição exata.
        </Text>
        <div className="mt-4">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <MapaInterativoBusca
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              addressToSearch={fullAddress}
              onCoordinatesChange={handleCoordinatesChange}
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

      <Flex vertical className="md:!flex-row" gap="middle">
        <Form.Item
          label="Latitude"
          name="latitude"
          rules={[
            { required: true, message: "As coordenadas são obrigatórias." },
          ]}
        >
          <Input placeholder="Selecione no mapa" disabled />
        </Form.Item>
        <Form.Item
          label="Longitude"
          name="longitude"
          rules={[
            { required: true, message: "As coordenadas são obrigatórias." },
          ]}
        >
          <Input placeholder="Selecione no mapa" disabled />
        </Form.Item>
      </Flex>
    </>
  );
};

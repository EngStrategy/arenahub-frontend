import { Form, Input, InputNumber, Select, Flex, Avatar, Typography, Upload, AutoComplete, FormInstance } from "antd";
import { PictureOutlined, UploadOutlined } from "@ant-design/icons";
import ImgCrop from "antd-img-crop";
import type { UploadProps } from "antd";
import { formatarCPF } from "@/context/functions/formatarCPF";
import { formatarCNPJ } from "@/context/functions/formatarCNPJ";
import { formatarTelefone } from "@/context/functions/formatarTelefone";
import { validarCPF } from "@/context/functions/validarCPF";

const { Option } = Select;
const { Text } = Typography;

interface DadosConfiguracaoArenaProps {
  form: FormInstance;
  imageUrl: string | null;
  loading: boolean;
  beforeUpload: (file: any) => boolean;
  handleChange: UploadProps["onChange"];
  handlePreview: (file: any) => Promise<void>;
  formaPagamento: string | null;
  setFormaPagamento: (val: string) => void;
  tipoChavePix: "EMAIL" | "CPF" | "CNPJ" | "TELEFONE" | "ALEATORIA" | null;
  setTipoChavePix: (val: any) => void;
  options: { label: string; value: string }[];
  handleSearch: (value: string) => void;
}

export const DadosConfiguracaoArena = ({
  form,
  imageUrl,
  loading,
  beforeUpload,
  handleChange,
  handlePreview,
  formaPagamento,
  setFormaPagamento,
  tipoChavePix,
  setTipoChavePix,
  options,
  handleSearch,
}: DadosConfiguracaoArenaProps) => {

  const uploadButton = (
    <div className="ant-btn ant-btn-default" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 15px', borderRadius: '6px' }}>
      <UploadOutlined /> Escolher foto
    </div>
  );

  return (
    <>
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
                beforeUpload={beforeUpload as any}
                onChange={handleChange}
                onPreview={handlePreview as any}
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
        label="Política de Cancelamento"
        name="horasCancelarAgendamento"
        tooltip="Defina o prazo mínimo, em horas, que um atleta pode cancelar um agendamento sem custos. (Máximo 168 horas = 7 dias)"
        rules={[{ required: true, message: "Este campo é obrigatório." }]}
        initialValue={2}
        className="!mt-5"
      >
        <InputNumber
          min={1}
          max={168} // Máximo de 1 semana (7 * 24 = 168 horas)
          addonAfter="horas de antecedência"
          style={{ width: "100%" }}
        />
      </Form.Item>

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
          <Option value="LOCAL">Na Arena</Option>
          <Option value="PIX">PIX</Option>
          <Option value="AMBOS">Na Arena e PIX</Option>
        </Select>
      </Form.Item>

      {(formaPagamento === "PIX" || formaPagamento === "AMBOS") && (
        <Flex vertical className="md:!flex-row" gap="middle">
          <Form.Item
            label="Tipo de Chave Pix"
            name="tipoChavePix"
            rules={[
              { required: true, message: "Selecione o tipo de chave Pix" },
            ]}
            className="flex-1"
          >
            <Select
              placeholder="Selecione o tipo"
              onChange={(value) => {
                setTipoChavePix(value);
                form.setFieldsValue({ chavePix: "" });
              }}
            >
              <Option value="CPF">CPF</Option>
              <Option value="CNPJ">CNPJ</Option>
              <Option value="EMAIL">Email</Option>
              <Option value="TELEFONE">Telefone</Option>
              <Option value="ALEATORIA">Aleatória</Option>
            </Select>
          </Form.Item>

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
                      return Promise.reject(
                        new Error("CNPJ deve ter 14 dígitos!"),
                      );
                    }
                    // Validação do CNPJ
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
                      return Promise.reject(
                        new Error("Telefone inválido! (11 dígitos)"),
                      );
                    }
                  }

                  return Promise.resolve();
                },
              },
            ]}
            className="flex-1"
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
              <AutoComplete
                onSearch={handleSearch}
                placeholder="Insira seu email"
                options={options}
                onChange={(value) => {
                  form.setFieldsValue({ chavePix: value });
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
                placeholder="Insira sua chave aleatória"
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
        </Flex>
      )}

      <Form.Item
        label="Descrição (opcional)"
        name="descricao"
        className="!mt-5"
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
          count={{
            show: true,
            max: 500,
          }}
        />
      </Form.Item>
    </>
  );
};

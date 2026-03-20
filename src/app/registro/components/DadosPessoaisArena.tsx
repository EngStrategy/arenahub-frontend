import { Flex, Form, AutoComplete, Input, Popover, Switch, FormInstance } from "antd";
import { validarCPF } from "@/context/functions/validarCPF";
import { formatarCPF } from "@/context/functions/formatarCPF";
import { formatarTelefone } from "@/context/functions/formatarTelefone";
import { formatarCNPJ } from "@/context/functions/formatarCNPJ";
import { PasswordStrengthIndicator } from "../../../components/PasswordStrengthIndicator";
import { useTheme } from "@/context/ThemeProvider";
import CapsLock from "@/components/Alerts/CapsLock";

interface DadosPessoaisArenaProps {
  form: FormInstance;
  options: { label: string; value: string }[];
  handleSearch: (value: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isPasswordFocused: boolean;
  setIsPasswordFocused: (val: boolean) => void;
  haveCnpj: boolean;
  setHaveCnpj: (val: boolean) => void;
  consultarCnpj: (cnpj: string) => void;
  capsLockEstaAtivado: boolean;
}

export const DadosPessoaisArena = ({
  form,
  options,
  handleSearch,
  password,
  setPassword,
  isPasswordFocused,
  setIsPasswordFocused,
  haveCnpj,
  setHaveCnpj,
  consultarCnpj,
  capsLockEstaAtivado,
}: DadosPessoaisArenaProps) => {
  const { isDarkMode } = useTheme();

  return (
    <>
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
              form.setFieldsValue({
                cpfProprietario: formatarCPF(e.target.value),
              });
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
              form.setFieldsValue({
                telefone: formatarTelefone(e.target.value),
              });
            }}
          />
        </Form.Item>
      </Flex>

      <Flex vertical className="md:!flex-row" gap="middle">
        <Form.Item
          label="Senha"
          name="senha"
          rules={[
            { required: password === "", message: "Insira sua senha!" },
            { min: 8, message: "Pelo menos 8 caracteres!" },
          ]}
          className="flex-1"
        >
          <Popover
            content={<PasswordStrengthIndicator password={password} />}
            placement="top"
            open={isPasswordFocused}
            getPopupContainer={(triggerNode) =>
              triggerNode.parentNode as HTMLElement
            }
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
              },
            }),
          ]}
          className="flex-1"
        >
          <Input.Password placeholder="Confirme sua senha" />
        </Form.Item>
      </Flex>

      {capsLockEstaAtivado && <CapsLock />}

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
                return Promise.reject(new Error("CNPJ deve ter 14 dígitos"));
              }
              let tamanho = cnpj.length - 2;
              let numeros = cnpj.substring(0, tamanho);
              const digitos = cnpj.substring(tamanho);
              let soma = 0;
              let pos = tamanho - 7;
              for (let i = tamanho; i >= 1; i--) {
                soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--;
                if (pos < 2) pos = 9;
              }
              let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
              if (resultado !== Number.parseInt(digitos.charAt(0))) {
                return Promise.reject(new Error("CNPJ inválido"));
              }
              tamanho = tamanho + 1;
              numeros = cnpj.substring(0, tamanho);
              soma = 0;
              pos = tamanho - 7;
              for (let i = tamanho; i >= 1; i--) {
                soma += Number.parseInt(numeros.charAt(tamanho - i)) * pos--;
                if (pos < 2) pos = 9;
              }
              resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
              if (resultado !== Number.parseInt(digitos.charAt(1))) {
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
          onChange={(e) => {
            const valorFormatado = formatarCNPJ(e.target.value);
            form.setFieldsValue({ cnpj: valorFormatado });

            const cnpjLimpo = valorFormatado.replace(/\D/g, "");

            if (haveCnpj && cnpjLimpo.length === 14) {
              consultarCnpj(cnpjLimpo);
            }
          }}
        />
      </Form.Item>

      <Form.Item className="flex flex-col">
        <Flex
          align="center"
          justify="space-between"
          className={`w-full !p-2 rounded-md ${isDarkMode ? "bg-neutral-800" : "bg-gray-200"}`}
        >
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
        rules={[{ required: true, message: "Insira o nome da sua arena" }]}
        className="flex-1"
      >
        <Input placeholder="Insira o nome da sua arena" />
      </Form.Item>
    </>
  );
};

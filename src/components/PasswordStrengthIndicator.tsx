import { Progress } from "antd";

export const PasswordStrengthIndicator = ({
  password = "",
}: {
  password?: string;
}) => {
  const evaluatePassword = () => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  };

  const score = evaluatePassword();
  let color = "red";
  let text = "Fraca";

  if (score >= 75) {
    color = "green";
    text = "Forte";
  } else if (score >= 50) {
    color = "orange";
    text = "Média";
  }

  return (
    <div className="w-full">
      <p className="mb-2 font-medium">Força da senha: {text}</p>
      <Progress percent={score} showInfo={false} strokeColor={color} />
      <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
        <li className={password.length >= 8 ? "text-green-600" : ""}>
          Pelo menos 8 caracteres
        </li>
        <li className={/\d/.test(password) ? "text-green-600" : ""}>
          Pelo menos um número
        </li>
        <li
          className={
            /[a-z]/.test(password) && /[A-Z]/.test(password)
              ? "text-green-600"
              : ""
          }
        >
          Letras maiúsculas e minúsculas
        </li>
        <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>
          Pelo menos um caractere especial
        </li>
      </ul>
    </div>
  );
};

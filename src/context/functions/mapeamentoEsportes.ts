import { TipoQuadra } from "@/app/api/entities/quadra";

const mapeamentoEsportes: Record<TipoQuadra, string> = {
  FUTEBOL_SOCIETY: "Futebol Society",
  FUTEBOL_SETE: "Futebol 7",
  FUTEBOL_ONZE: "Futebol 11",
  FUTSAL: "Futsal",
  BEACHTENNIS: "Beach Tennis",
  VOLEI: "Vôlei",
  FUTEVOLEI: "Futevôlei",
  BASQUETE: "Basquete",
  HANDEBOL: "Handebol",
};

export const formatarEsporte = (esporte: TipoQuadra): string => {
  return mapeamentoEsportes[esporte] || esporte
    .split('_')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
};
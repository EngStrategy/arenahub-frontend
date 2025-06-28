import { DiaDaSemana } from "@/app/api/entities/quadra";

export const formatarDiaSemana = (dia: DiaDaSemana) => {
    const mapa = {
        DOMINGO: "Domingo", SEGUNDA: "Segunda", TERCA: "Terça",
        QUARTA: "Quarta", QUINTA: "Quinta", SEXTA: "Sexta", SABADO: "Sábado"
    };
    return mapa[dia];
};
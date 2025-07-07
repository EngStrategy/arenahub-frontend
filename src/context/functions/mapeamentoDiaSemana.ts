import { DiaDaSemana } from "@/app/api/entities/quadra";

export const formatarDiaSemanaCompleto = (dia: DiaDaSemana) => {
    const mapa = {
        DOMINGO: "Domingo", SEGUNDA: "Segunda", TERCA: "Terça",
        QUARTA: "Quarta", QUINTA: "Quinta", SEXTA: "Sexta", SABADO: "Sábado"
    };
    return mapa[dia];
};

export const formatarDiaSemanaAbreviado = (dia: DiaDaSemana) => {
    const mapa = {
        DOMINGO: "Dom", SEGUNDA: "Seg", TERCA: "Ter",
        QUARTA: "Qua", QUINTA: "Qui", SEXTA: "Sext", SABADO: "Sáb"
    };
    return mapa[dia];
};
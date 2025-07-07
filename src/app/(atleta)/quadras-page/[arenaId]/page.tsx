"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format, addDays, isBefore, setHours, setMinutes, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Button, Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { ArenaCard } from '@/components/Cards/ArenaCard';
import Image from 'next/image';
import { TbSoccerField } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { DrawerConfirmacaoReserva } from '../../../../components/Drawers/DrawerConfirmacaoReserva';
import { motion, AnimatePresence } from 'framer-motion';
import type {
    Quadra as QuadraOficial,
    HorarioFuncionamento,
    DuracaoReserva,
    MaterialFornecido,
} from '@/app/api/entities/quadra';
import type { Arena as ArenaOficial } from '@/app/api/entities/arena';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';
import { useSession } from 'next-auth/react';


export interface Horario {
    data: string;
    hora: string;
    preco: number;
    disponivel: boolean;
}

export interface QuadraComHorarios extends QuadraOficial {
    horarios: Horario[];
}

const ArenaCardSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full max-w-sm animate-pulse">
        <div className="flex items-center space-x-4">
            <div className="h-24 w-24 bg-gray-300 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
        </div>
    </div>
);

const QuadraHorariosSkeleton = () => (
    <div className="border-2 border-transparent border-b-gray-300 p-4 animate-pulse">
        <div className="flex gap-4 mb-4">
            <div className="h-24 min-w-[120px] bg-gray-300 rounded-lg"></div>
            <div className="flex-1 space-y-2 py-1">
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-2/4"></div>
            </div>
        </div>
        <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 w-32 bg-gray-200 rounded-md"></div>
            ))}
        </div>
    </div>
);

const QuadraPageSkeleton = () => (
    <div className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
        <div className='flex flex-row items-start justify-between mb-6'>
            <ArenaCardSkeleton />
        </div>

        <div className="animate-pulse">
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-16 w-16 bg-gray-200 rounded-md"></div>
                    ))}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <QuadraHorariosSkeleton />
            <QuadraHorariosSkeleton />
        </div>
    </div>
);

const arena: ArenaOficial = {
    id: 1,
    nome: "Arena Pici",
    email: "contato@arenapici.com",
    telefone: "85912345678",
    endereco: {
        cidade: "Fortaleza",
        estado: "CE",
        rua: "Av. Mister Hull",
        numero: "s/n",
        bairro: "Pici",
        cep: "60455-760",
        complemento: "Próximo ao IFCE"
    },
    descricao: "Complexo esportivo com quadras de alta qualidade para diversos esportes.",
    urlFoto: "/images/arenaesportes.png",
    dataCriacao: "2023-01-01",
    esportes: ["Futebol Society", "Futsal", "Beach Tennis", "Vôlei", "Futevôlei"],
    avaliacao: 4.8,
    numeroAvaliacoes: 150,
    role: "ADMIN",
};

const quadrasPorArena: { [key: number]: QuadraOficial[] } = {
    1: [
        {
            id: 101,
            nomeQuadra: 'Campo Society 1',
            urlFotoQuadra: '/images/arenaesportes.png',
            tipoQuadra: ['FUTEBOL_SOCIETY'],
            descricao: 'Campo de grama sintética de alta qualidade, ideal para jogos de society.',
            duracaoReserva: 'TRINTA_MINUTOS',
            cobertura: false,
            iluminacaoNoturna: true,
            materiaisFornecidos: ['BOLA', 'COLETE'],
            arenaId: 1,
            nomeArena: "Arena Pici",
            horariosFuncionamento: [
                {
                    id: 2,
                    diaDaSemana: 'TERCA',
                    intervalosDeHorario: [
                        { id: 10, inicio: '08:00', fim: '12:00', valor: 80, status: 'DISPONIVEL' },
                        { id: 11, inicio: '16:00', fim: '19:00', valor: 100, status: 'DISPONIVEL' },
                        { id: 12, inicio: '20:00', fim: '00:00', valor: 140, status: 'DISPONIVEL' }
                    ]
                },
                {
                    id: 3,
                    diaDaSemana: 'QUARTA',
                    intervalosDeHorario: [
                        { id: 13, inicio: '08:00', fim: '12:00', valor: 80, status: 'DISPONIVEL' },
                        { id: 14, inicio: '16:00', fim: '19:00', valor: 100, status: 'DISPONIVEL' },
                        { id: 15, inicio: '20:00', fim: '00:00', valor: 140, status: 'DISPONIVEL' }
                    ]
                },
                {
                    id: 4,
                    diaDaSemana: 'QUINTA',
                    intervalosDeHorario: [
                        { id: 16, inicio: '08:00', fim: '12:00', valor: 80, status: 'DISPONIVEL' },
                        { id: 17, inicio: '16:00', fim: '19:00', valor: 100, status: 'DISPONIVEL' },
                        { id: 18, inicio: '20:00', fim: '00:00', valor: 140, status: 'DISPONIVEL' }
                    ]
                },
                {
                    id: 5,
                    diaDaSemana: 'SEXTA',
                    intervalosDeHorario: [
                        { id: 19, inicio: '08:00', fim: '12:00', valor: 80, status: 'DISPONIVEL' },
                        { id: 20, inicio: '16:00', fim: '19:00', valor: 100, status: 'DISPONIVEL' },
                        { id: 21, inicio: '20:00', fim: '00:00', valor: 140, status: 'DISPONIVEL' }
                    ]
                },
                {
                    id: 6,
                    diaDaSemana: 'SABADO',
                    intervalosDeHorario: [
                        { id: 22, inicio: '16:00', fim: '21:00', valor: 100, status: 'DISPONIVEL' },
                    ]
                },
            ],
        },
        {
            id: 102,
            nomeQuadra: 'Quadra de Areia 1',
            urlFotoQuadra: '/images/arenaesportes.png',
            tipoQuadra: ['BEACHTENNIS', 'VOLEI', 'FUTEVOLEI'],
            descricao: 'Quadra de areia perfeita para esportes de praia, com iluminação para jogos noturnos.',
            duracaoReserva: 'UMA_HORA',
            cobertura: false,
            iluminacaoNoturna: true,
            materiaisFornecidos: ['BOLA', 'LUVA', 'CHUTEIRA'],
            arenaId: 1,
            nomeArena: "Arena Pici",
            horariosFuncionamento: [
                {
                    id: 7,
                    diaDaSemana: 'QUARTA',
                    intervalosDeHorario: [
                        { id: 13, inicio: '08:00', fim: '12:00', valor: 80, status: 'DISPONIVEL' },
                        { id: 14, inicio: '16:00', fim: '19:00', valor: 100, status: 'DISPONIVEL' },
                        { id: 15, inicio: '20:00', fim: '00:00', valor: 140, status: 'DISPONIVEL' }
                    ]
                },
                {
                    id: 8,
                    diaDaSemana: 'QUINTA',
                    intervalosDeHorario: [
                        { id: 16, inicio: '08:00', fim: '12:00', valor: 80, status: 'DISPONIVEL' },
                        { id: 17, inicio: '16:00', fim: '19:00', valor: 100, status: 'DISPONIVEL' },
                        { id: 18, inicio: '20:00', fim: '00:00', valor: 140, status: 'DISPONIVEL' }
                    ]
                },
                {
                    id: 9,
                    diaDaSemana: 'SEXTA',
                    intervalosDeHorario: [
                        { id: 19, inicio: '08:00', fim: '12:00', valor: 80, status: 'DISPONIVEL' },
                        { id: 20, inicio: '16:00', fim: '19:00', valor: 100, status: 'DISPONIVEL' },
                        { id: 21, inicio: '20:00', fim: '00:00', valor: 140, status: 'DISPONIVEL' }
                    ]
                },
            ],
        },
    ],
};

const formatarMaterial = (material: MaterialFornecido): string => {
    return material.charAt(0).toUpperCase() + material.slice(1).toLowerCase();
}

const gerarHorarios = (hf: HorarioFuncionamento[], duracaoReserva: DuracaoReserva): Horario[] => {
    const hoje = new Date();
    const horarios: Horario[] = [];
    const diasDaSemanaMap = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];

    let duracaoEmMinutos: number;
    duracaoEmMinutos = duracaoReserva === 'UMA_HORA' ? 60 : 30;

    for (let i = 0; i < 30; i++) {
        const dataAtual = addDays(hoje, i);
        const diaDaSemanaString = diasDaSemanaMap[dataAtual.getDay()];

        const horarioFuncionamentoDoDia = hf?.find(h => h.diaDaSemana === diaDaSemanaString);

        if (horarioFuncionamentoDoDia && horarioFuncionamentoDoDia.intervalosDeHorario?.length > 0) {
            const dataStr = format(dataAtual, 'yyyy-MM-dd');

            horarioFuncionamentoDoDia.intervalosDeHorario.forEach(intervalo => {
                const { inicio, fim, valor } = intervalo;
                const horaInicioTotalMinutos = parseInt(inicio.split(':')[0]) * 60 + parseInt(inicio.split(':')[1]);

                let horaFimTotalMinutos = parseInt(fim.split(':')[0]) * 60 + parseInt(fim.split(':')[1]);
                if (horaFimTotalMinutos === 0) {
                    horaFimTotalMinutos = 24 * 60; // 1440 minutos
                }

                for (let minutoAtual = horaInicioTotalMinutos; minutoAtual < horaFimTotalMinutos; minutoAtual += duracaoEmMinutos) {
                    const hora = Math.floor(minutoAtual / 60);
                    const minuto = minutoAtual % 60;

                    const horaFormatada = hora === 24 ? 0 : hora;
                    const horaCompleta = `${String(horaFormatada).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
                    const dataHoraCompleta = setMinutes(setHours(dataAtual, hora), minuto);

                    if (isBefore(dataHoraCompleta, new Date())) continue;

                    horarios.push({
                        data: dataStr,
                        hora: horaCompleta,
                        preco: valor,
                        disponivel: Math.random() > 0.2
                    });
                }
            });
        }
    }
    return horarios;
};

const formatarIntervalo = (horaInicio: string, duracaoReserva: DuracaoReserva) => {
    let duracaoEmMinutos: number;
    if (duracaoReserva === 'UMA_HORA') {
        duracaoEmMinutos = 60;
    } else {
        duracaoEmMinutos = 30;
    }

    const [horaStr, minStr] = horaInicio.split(':');
    const minutosInicio = parseInt(horaStr) * 60 + parseInt(minStr);
    const minutosFim = minutosInicio + duracaoEmMinutos;

    const formatarMinutos = (m: number) => {
        let h = Math.floor(m / 60);
        const min = m % 60;

        if (h === 24) {
            h = 0;
        }

        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };

    return `${horaInicio} às ${formatarMinutos(minutosFim)}`;
}

const addDuration = (time: string, durationMinutes: number): string => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

const subDuration = (time: string, durationMinutes: number): string => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m - durationMinutes;
    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

export default function QuadraPage() {
    const { status } = useSession();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [quadras, setQuadras] = useState<QuadraComHorarios[]>([]);
    const [direction, setDirection] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [quadraSelecionada, setQuadraSelecionada] = useState<QuadraComHorarios | null>(null);

    const allDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));
    const VISIBLE_DATES_WINDOW_SIZE = 10;


    useEffect(() => {
        setLoading(true);
        const arenaId = Number(params?.arenaId as string) || 1;
        const quadrasRaw = quadrasPorArena[arenaId] || [];

        setTimeout(() => {
            const quadrasData = quadrasRaw.map((q) => ({
                ...q,
                horarios: gerarHorarios(q.horariosFuncionamento, q.duracaoReserva),
            }));
            setQuadras(quadrasData);
            setLoading(false);
        }, 1000);
    }, [params?.arenaId]);


    useEffect(() => {
        if (!selectedDate && allDates.length > 0) {
            setSelectedDate(format(allDates[0], 'yyyy-MM-dd'));
        }
    }, [allDates, selectedDate]);

    const visibleDates = allDates.slice(startIndex, startIndex + VISIBLE_DATES_WINDOW_SIZE);

    const onCheckboxChange = (e: CheckboxChangeEvent, quadra: QuadraComHorarios) => {
        const { value, checked } = e.target;
        const [quadraIdStr, timeToChange] = value.split('|');

        if (checked) {
            setSelectedHorarios((prev) => [...prev, value]);
            setQuadraSelecionada(quadra);
        } else {
            const sortedTimes = selectedHorarios
                .filter(h => h.startsWith(`${quadraIdStr}|`))
                .map(h => h.split('|')[1])
                .sort();

            const indexOfDeselected = sortedTimes.indexOf(timeToChange);

            if (indexOfDeselected === -1) return;

            let timesToKeep;

            if (indexOfDeselected === 0) {
                timesToKeep = sortedTimes.slice(1);
            }
            else if (indexOfDeselected === sortedTimes.length - 1) {
                timesToKeep = sortedTimes.slice(0, indexOfDeselected);
            }
            else {
                timesToKeep = sortedTimes.slice(0, indexOfDeselected);
            }

            const newSelectedValues = timesToKeep.map(t => `${quadraIdStr}|${t}`);

            setSelectedHorarios(newSelectedValues);

            if (newSelectedValues.length === 0) {
                setQuadraSelecionada(null);
            }
        }
    };

    const calcularTotal = () => {
        return selectedHorarios.map((val) => {
            const [quadraId, hora] = val.split('|');
            const quadra = quadras.find(q => q.id === Number(quadraId));
            const horario = quadra?.horarios?.find(h => h.hora === hora && h.data === selectedDate);
            return horario?.preco ?? 0;
        }).reduce((acc, preco) => acc + preco, 0);
    };

    if (loading || status === "loading") {
        return <QuadraPageSkeleton />;
    }

    return (
        <div className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
            <div className='flex flex-row items-start justify-between mb-6'>
                <ArenaCard arena={arena} showDescription={true} showHover={false} showEsportes={false} />
                {selectedHorarios.length > 0 && (
                    <Button
                        type="primary"
                        onClick={() => setIsDrawerVisible(true)}
                        className="!w-full !flex !flex-row hover:!bg-green-500 !py-7 !rounded-none !bg-green-primary 
                        !fixed !bottom-0 !left-0 !z-40 sm:!z-0 sm:!static sm:!w-auto !text-white hover:!bg-green-500"
                    >
                        <span className="flex flex-row items-center justify-center w-full">
                            <TbSoccerField className="w-8 h-9 mr-2 rotate-135" />
                            <span className="flex flex-col items-start justify-center text-base">
                                <span className="font-semibold text-center">
                                    {calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                <span>
                                    {selectedHorarios.length} horário{selectedHorarios.length > 1 ? 's' : ''}
                                </span>
                            </span>
                        </span>
                    </Button>
                )}
            </div>

            <div className="text-center text-lg font-semibold mb-2 capitalize pt-4 border-2 border-transparent border-t-gray-300">
                {format(allDates[startIndex], 'MMMM yyyy', { locale: ptBR })}
            </div>
            <div className="flex items-center justify-center gap-3 mb-6">
                <Button
                    type='primary'
                    onClick={() => {
                        setDirection(-1);
                        setStartIndex(Math.max(0, startIndex - 4))
                    }}
                    disabled={startIndex === 0}
                    className="!bg-transparent !border-0 !text-gray-500 hover:!bg-transparent hover:!text-gray-700 !shadow-none"
                >
                    <IoIosArrowBack
                        color={`${startIndex === 0 ? 'gray' : 'black'} `}
                        className='!h-9'
                    />
                </Button>

                <div className="flex gap-2 overflow-hidden w-[580px]">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={startIndex}
                            custom={direction}
                            variants={{
                                enter: (direction: number) => ({
                                    x: direction > 0 ? '100%' : '-100%',
                                    opacity: 0
                                }),
                                center: {
                                    x: 0,
                                    opacity: 1
                                },
                                exit: (direction: number) => ({
                                    x: direction < 0 ? '100%' : '-100%',
                                    opacity: 0
                                })
                            }}
                            initial="enter"
                            animate="center"
                            exit={{ opacity: 0 }}
                            transition={{
                                x: { type: "spring", stiffness: 800, damping: 10 },
                                opacity: { duration: 0.2 }
                            }}
                            className="flex gap-2"
                        >
                            {visibleDates.map((day) => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const isSelected = selectedDate === dateStr;
                                return (
                                    <button
                                        key={dateStr}
                                        className={`min-w-[56px] px-2 py-2 text-center text-sm font-semibold ${isSelected ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'} hover:bg-green-200 hover:cursor-pointer`}
                                        onClick={() => { setSelectedDate(dateStr); setSelectedHorarios([]); }}
                                    >
                                        <div>{format(day, 'd', { locale: ptBR })}</div>
                                        <div className="text-xs font-inter">
                                            {format(day, 'eee', { locale: ptBR }).slice(0, 3).replace(/^./, c => c.toUpperCase())}
                                        </div>
                                    </button>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <Button
                    onClick={() => {
                        setDirection(1);
                        setStartIndex(Math.min(allDates.length - 10, startIndex + 4))
                    }}
                    disabled={startIndex + 10 >= allDates.length}
                    className="!bg-transparent !border-0 !text-gray-500 hover:!bg-transparent hover:!text-gray-700 !shadow-none"
                >
                    <IoIosArrowForward
                        color={`${startIndex + 10 >= allDates.length ? 'gray' : 'black'} `}
                    />
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                {quadras.map((quadra) => {
                    const horariosDoDia = quadra.horarios?.filter((h) => h.data === selectedDate);
                    const diaDaSemanaFormatado = selectedDate ? format(parseISO(selectedDate), 'EEEE', { locale: ptBR }) : '';

                    return (
                        <div key={quadra.id} className="border-2 border-transparent border-b-gray-300 p-4">
                            <div className="flex overflow-hidden gap-4 mb-4">
                                <div className="relative h-24 min-w-[120px] w-30 overflow-hidden bg-gray-300 flex-shrink-0">
                                    <Image src={quadra.urlFotoQuadra} alt={`Imagem da ${quadra.nomeQuadra}`} fill className="object-cover" />
                                </div>
                                <div className="flex flex-col h-auto justify-between">
                                    <h3 className="font-semibold text-lg mb-1">{quadra.nomeQuadra}</h3>
                                    <p className="text-green-600 text-sm mb-2 font-semibold">
                                        {quadra.tipoQuadra.map(formatarEsporte).join(', ')}
                                    </p>
                                    {quadra.materiaisFornecidos && quadra.materiaisFornecidos.length > 0 && (
                                        <p className="text-sm text-black">
                                            A Arena vai disponibilizar para você:{' '}
                                            <span className="text-green-600 font-semibold">
                                                {quadra.materiaisFornecidos.length === 1
                                                    ? formatarMaterial(quadra.materiaisFornecidos[0])
                                                    : quadra.materiaisFornecidos.map(formatarMaterial).reduce((acc, curr, idx, arr) => {
                                                        if (idx === 0) return curr;
                                                        if (idx === arr.length - 1) return `${acc} e ${curr}`;
                                                        return `${acc}, ${curr}`;
                                                    }, '')}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex flex-row gap-2 overflow-x-auto pb-2">
                                    {horariosDoDia && horariosDoDia.length > 0 ? (
                                        horariosDoDia.map((horario) => {
                                            const checkboxValue = `${quadra.id}|${horario.hora}`;
                                            const isSelected = selectedHorarios.includes(checkboxValue);

                                            let isDisabled = !horario.disponivel;
                                            if (!isDisabled) {
                                                const selectedQuadraId = selectedHorarios.length > 0 ? selectedHorarios[0].split('|')[0] : null;
                                                if (selectedQuadraId && selectedQuadraId !== String(quadra.id)) {
                                                    isDisabled = true;
                                                } else if (selectedQuadraId && !isSelected) {
                                                    const selectedTimes = selectedHorarios.map(h => h.split('|')[1]).sort();
                                                    const firstSelected = selectedTimes[0];
                                                    const lastSelected = selectedTimes[selectedTimes.length - 1];
                                                    const duracaoEmMinutos = quadra.duracaoReserva === 'UMA_HORA' ? 60 : 30;
                                                    const prevAdjacent = subDuration(firstSelected, duracaoEmMinutos);
                                                    const nextAdjacent = addDuration(lastSelected, duracaoEmMinutos);
                                                    if (horario.hora !== prevAdjacent && horario.hora !== nextAdjacent) {
                                                        isDisabled = true;
                                                    }
                                                }
                                            }

                                            let horarioClass = isDisabled
                                                ? 'opacity-50 text-gray-400 line-through cursor-not-allowed bg-gray-100 border-gray-100'
                                                : 'border-gray-300 bg-white text-black hover:bg-green-50';
                                            if (isSelected) horarioClass = 'border-2 border-green-600 bg-white text-black';

                                            return (
                                                <label key={`${quadra.id}|${horario.hora}`} className={`flex flex-row items-center gap-2 border px-2 py-2 text-xs select-none min-w-[130px] max-w-[160px] cursor-pointer ${horarioClass}`}>
                                                    <Checkbox value={checkboxValue} disabled={isDisabled} checked={isSelected} onChange={(e) => onCheckboxChange(e, quadra)} className="!accent-green-600 !mr-1" />
                                                    <div className="flex flex-col w-full">
                                                        <span className="block leading-tight text-left">{formatarIntervalo(horario.hora, quadra.duracaoReserva)}</span>
                                                        <span className="font-semibold text-left">R$ {horario.preco.toFixed(2)}</span>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    ) : (
                                        <div className="w-full text-left text-gray-500 py-2 px-1 text-sm">
                                            Fechado na {diaDaSemanaFormatado.replace("-feira", "")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <DrawerConfirmacaoReserva
                open={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
                arena={arena}
                quadraSelecionada={quadraSelecionada}
                selectedDate={selectedDate}
                selectedHorarios={selectedHorarios}
                quadras={quadras}
            />
        </div>
    );
}
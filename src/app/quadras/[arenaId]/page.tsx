"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Button, Card, Typography, Spin, Alert } from 'antd';
import { ArenaCard } from '@/components/Cards/ArenaCard';
import Image from 'next/image';
import { TbSoccerField } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { DrawerConfirmacaoReserva } from '@/components/Drawers/DrawerConfirmacaoReserva';
import { motion, AnimatePresence } from 'framer-motion';
import {
    type Quadra as QuadraOficial,
    type DuracaoReserva,
    type MaterialFornecido,
    getAllQuadras,
    getHorariosDisponiveisPorQuadra,
    type HorariosDisponiveis
} from '@/app/api/entities/quadra';
import type { Arena as ArenaOficial } from '@/app/api/entities/arena';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';
import { useSession, signOut } from 'next-auth/react';
import { getArenaById } from '@/app/api/entities/arena';
import { ModalRedirecionamentoLogin } from '@/components/Modais/ModalRedirecionamentoLogin';
import { useTheme } from '@/context/ThemeProvider';

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

const formatarMaterial = (material: MaterialFornecido): string => {
    const materialMap: Record<MaterialFornecido, string> = {
        BOLA: 'bola',
        COLETE: 'colete',
        LUVA: 'luva',
        CHUTEIRA: 'chuteira',
        CONE: 'cone'
    };
    return materialMap[material] || material.toLowerCase();
}

const formatarIntervalo = (horaInicio: string, duracaoReserva: DuracaoReserva) => {
    const duracaoEmMinutos = duracaoReserva === 'UMA_HORA' ? 60 : 30;
    const [horaStr, minStr] = horaInicio.split(':');
    const minutosInicio = parseInt(horaStr) * 60 + parseInt(minStr);
    const minutosFim = minutosInicio + duracaoEmMinutos;
    const formatarMinutos = (m: number) => {
        let h = Math.floor(m / 60);
        const min = m % 60;
        if (h >= 24) h = h % 24;
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };
    return `${horaInicio} às ${formatarMinutos(minutosFim)}`;
}

const addDuration = (time: string, durationMinutes: number): string => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    let newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;
    if (newH >= 24) newH = newH % 24;
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
    const { data: session, status } = useSession();
    const params = useParams();
    const arenaId = Number(params?.arenaId as string);
    const router = useRouter();
    const { isDarkMode } = useTheme();

    const [arena, setArena] = useState<ArenaOficial | null>(null);
    const [quadras, setQuadras] = useState<QuadraOficial[]>([]);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState<Record<number, HorariosDisponiveis[]>>({});

    const [loading, setLoading] = useState(true);
    const [horariosLoading, setHorariosLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [quadraSelecionada, setQuadraSelecionada] = useState<QuadraOficial | null>(null);

    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

    const allDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));
    const VISIBLE_DATES_WINDOW_SIZE = 10;

    useEffect(() => {
        if (!arenaId) return;
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [arenaData, quadrasResponse] = await Promise.all([
                    getArenaById(arenaId),
                    getAllQuadras({ arenaId: arenaId, size: 16 })
                ]);

                if (arenaData) {
                    setArena(arenaData);
                } else {
                    throw new Error("Arena não encontrada");
                }

                if (quadrasResponse?.content) {
                    setQuadras(quadrasResponse.content);
                }
            } catch (err) {
                setError("Falha ao carregar os dados da arena. Tente novamente mais tarde.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [arenaId]);

    useEffect(() => {
        if (!selectedDate || quadras.length === 0) return;
        const fetchHorarios = async () => {
            try {
                setHorariosLoading(true);
                const horariosPromises = quadras.map(quadra =>
                    getHorariosDisponiveisPorQuadra(quadra.id, selectedDate)
                );
                const resultados = await Promise.all(horariosPromises);

                const novosHorarios: Record<number, HorariosDisponiveis[]> = {};
                resultados.forEach((horarios, index) => {
                    const quadraId = quadras[index].id;
                    novosHorarios[quadraId] = horarios;
                });
                setHorariosDisponiveis(novosHorarios);
            } catch (err) {
                console.error("Falha ao buscar horários:", err);
            } finally {
                setHorariosLoading(false);
            }
        };
        fetchHorarios();
    }, [selectedDate, quadras]);

    useEffect(() => {
        if (!selectedDate && allDates.length > 0) {
            setSelectedDate(format(allDates[0], 'yyyy-MM-dd'));
        }
    }, [allDates, selectedDate]);

    const handleLoginRedirect = async () => {
        setIsLoginModalVisible(true);
    };

    const visibleDates = allDates.slice(startIndex, startIndex + VISIBLE_DATES_WINDOW_SIZE);

    const handleHorarioClick = (quadra: QuadraOficial, horario: HorariosDisponiveis) => {
        const value = `${quadra.id}|${horario.horarioInicio}`;
        const isSelected = selectedHorarios.includes(value);
        const quadraIdStr = String(quadra.id);
        const timeToChange = horario.horarioInicio;
        const duracaoEmMinutos = quadra.duracaoReserva === 'UMA_HORA' ? 60 : 30;

        const currentSelectedTimes = selectedHorarios
            .filter(h => h.startsWith(`${quadraIdStr}|`))
            .map(h => h.split('|')[1])
            .sort((a, b) => a.localeCompare(b));

        if (isSelected) {
            const indexOfDeselected = currentSelectedTimes.indexOf(timeToChange);
            if (indexOfDeselected === -1) return;

            const timesToKeep = currentSelectedTimes.slice(0, indexOfDeselected);
            const newSelectedValues = timesToKeep.map(t => `${quadraIdStr}|${t}`);

            setSelectedHorarios(newSelectedValues);

            if (newSelectedValues.length === 0) {
                setQuadraSelecionada(null);
            }
        } else {
            if (currentSelectedTimes.length === 0) {
                setSelectedHorarios([value]);
                setQuadraSelecionada(quadra);
            } else {
                const firstSelected = currentSelectedTimes[0];
                const lastSelected = currentSelectedTimes[currentSelectedTimes.length - 1];
                const prevAdjacent = subDuration(firstSelected, duracaoEmMinutos);
                const nextAdjacent = addDuration(lastSelected, duracaoEmMinutos);

                if (timeToChange === nextAdjacent || timeToChange === prevAdjacent) {
                    setSelectedHorarios((prev) => [...prev, value].sort((a, b) => a.localeCompare(b)));
                } else {
                    console.log("Por favor, selecione um horário consecutivo.");
                }
            }
        }
    };



    const quadrasComHorarios = quadras.map(quadra => ({
        ...quadra,
        horariosDisponiveis: horariosDisponiveis[quadra.id] || []
    }));

    const quadraSelecionadaComHorarios = quadraSelecionada ? {
        ...quadraSelecionada,
        horariosDisponiveis: horariosDisponiveis[quadraSelecionada.id] || []
    } : null;

    const calcularTotal = () => {
        return selectedHorarios.map((val) => {
            const [quadraId, hora] = val.split('|');
            const horarios = horariosDisponiveis[Number(quadraId)] || [];
            const horarioInfo = horarios.find(h => h.horarioInicio === hora);
            return horarioInfo?.valor ?? 0;
        }).reduce((acc, preco) => acc + preco, 0);
    };

    if (loading || status === "loading") {
        return <QuadraPageSkeleton />;
    }

    if (error) {
        return (
            <div className={`flex justify-center items-center h-screen ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
                <Alert message="Erro" description={error} type="error" showIcon />
            </div>
        );
    }

    return (
        <div className={`px-4 sm:px-10 lg:px-40 py-8 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            {arena && (
                <div className='flex flex-row items-start justify-between mb-6'>
                    <ArenaCard arena={{
                        ...arena,
                        avaliacao: arena.avaliacao || 4.5,
                        numeroAvaliacoes: arena.numeroAvaliacoes || 100,
                    }} showDescription={true} showHover={false} showEsportes={false} />
                    {selectedHorarios.length > 0 && (
                        <Button
                            type="primary"
                            onClick={() => setIsDrawerVisible(true)}
                            className="!w-full !flex !flex-row hover:!bg-green-500 !py-7 !rounded-none !bg-green-primary 
                            !fixed !bottom-0 !left-0 !z-40 sm:!z-0 sm:!static sm:!w-auto !text-white"
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
            )}

            <Typography.Title level={4} className="!text-center !capitalize !pt-4 !border-t-2 !border-transparent !border-t-gray-300">
                {selectedDate && format(parseISO(selectedDate), 'MMMM Y', { locale: ptBR })}
            </Typography.Title>

            <div className="flex items-center justify-center gap-3 my-6">
                <Button
                    type='text'
                    icon={<IoIosArrowBack />}
                    onClick={() => { setDirection(-1); setStartIndex(Math.max(0, startIndex - 4)) }}
                    disabled={startIndex === 0}
                    className="!text-gray-500 hover:!text-gray-700"
                />
                <div className="flex gap-2 overflow-hidden w-full max-w-[580px]">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={startIndex}
                            custom={direction}
                            variants={{
                                enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
                                center: { x: 0, opacity: 1 },
                                exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
                            }}
                            initial="enter"
                            animate="center"
                            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                            className="flex gap-2"
                        >
                            {visibleDates.map((day) => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const isSelected = selectedDate === dateStr;
                                let buttonClass = '';
                                if (isSelected) {
                                    buttonClass = '!bg-green-600 !text-white';
                                } else if (isDarkMode) {
                                    buttonClass = '!bg-[#232323] !text-white';
                                } else {
                                    buttonClass = '!bg-gray-200 !text-black';
                                }
                                return (
                                    <Button
                                        key={dateStr}
                                        type={isSelected ? 'primary' : 'default'}
                                        className={`!flex !flex-col !h-auto !px-4 !gap-1 !py-2 !text-center !text-sm 
                                            !font-semibold !rounded-md !border-0 hover:!bg-green-200 hover:!text-green-600 
                                            ${buttonClass}`}
                                        onClick={() => { setSelectedDate(dateStr); setSelectedHorarios([]) }}
                                    >
                                        <div className='leading-tight'>
                                            {format(day, 'd', { locale: ptBR })}
                                        </div>
                                        <div className="text-xs font-inter">
                                            {format(day, 'eee', { locale: ptBR }).slice(0, 3).replace(/^./, c => c.toUpperCase())}
                                        </div>
                                    </Button>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <Button
                    type='text'
                    icon={<IoIosArrowForward />}
                    onClick={() => { setDirection(1); setStartIndex(Math.min(allDates.length - 10, startIndex + 4)) }}
                    disabled={startIndex + 10 >= allDates.length}
                    className="!text-gray-500 hover:!text-gray-700"
                />
            </div>

            <div className="space-y-4">
                {quadras.map((quadra) => {
                    const horariosDaQuadra = horariosDisponiveis[quadra.id] || [];
                    const diaDaSemanaFormatado = selectedDate ? format(parseISO(selectedDate), 'EEEE', { locale: ptBR }) : '';
                    const horariosManha = horariosDaQuadra.filter(h => parseInt(h.horarioInicio.split(':')[0]) < 12);
                    const horariosTarde = horariosDaQuadra.filter(h => parseInt(h.horarioInicio.split(':')[0]) >= 12 && parseInt(h.horarioInicio.split(':')[0]) < 18);
                    const horariosNoite = horariosDaQuadra.filter(h => parseInt(h.horarioInicio.split(':')[0]) >= 18);

                    const isHorarioDisabled = (
                        horario: HorariosDisponiveis,
                        quadra: QuadraOficial,
                        selectedHorarios: string[]
                    ) => {
                        if (horario.statusDisponibilidade !== 'DISPONIVEL') return true;
                        const checkboxValue = `${quadra.id}|${horario.horarioInicio}`;
                        if (selectedHorarios.includes(checkboxValue)) return false;
                        const selectedQuadraId = selectedHorarios.length > 0 ? selectedHorarios[0].split('|')[0] : null;
                        if (selectedQuadraId && selectedQuadraId !== String(quadra.id)) return true;
                        if (selectedQuadraId) {
                            const selectedTimes = selectedHorarios.map(h => h.split('|')[1]).sort((a, b) => a.localeCompare(b));
                            const firstSelected = selectedTimes[0];
                            const lastSelected = selectedTimes[selectedTimes.length - 1];
                            const duracaoEmMinutos = quadra.duracaoReserva === 'UMA_HORA' ? 60 : 30;
                            const prevAdjacent = subDuration(firstSelected, duracaoEmMinutos);
                            const nextAdjacent = addDuration(lastSelected, duracaoEmMinutos);
                            if (horario.horarioInicio !== prevAdjacent && horario.horarioInicio !== nextAdjacent) {
                                return true;
                            }
                        }
                        return false;
                    };

                    const getHorarioButtonClass = (isDisabled: boolean, isSelected: boolean) => {
                        if (isDisabled) {
                            return isDarkMode
                                ? '!opacity-60 !bg-[#232323] !text-gray-500 !border-[#232323]'
                                : '!opacity-60 !bg-gray-100 !text-gray-400 !border-gray-200';
                        } else if (isSelected) {
                            return isDarkMode
                                ? '!border-2 !border-green-400 !text-green-400 !font-bold !bg-[#181818]'
                                : '!border-2 !border-green-600 !text-green-600 !font-bold !bg-white';
                        } else {
                            return isDarkMode
                                ? '!border-[#232323] !bg-[#181818] !text-gray-200 hover:!border-green-400 hover:!text-green-400'
                                : '!border-gray-300 !bg-white !text-gray-600 hover:!border-green-500 hover:!text-green-500';
                        }
                    };

                    const renderHorario = (horario: HorariosDisponiveis) => {
                        const checkboxValue = `${quadra.id}|${horario.horarioInicio}`;
                        const isSelected = selectedHorarios.includes(checkboxValue);
                        const isDisabled = isHorarioDisabled(horario, quadra, selectedHorarios);
                        const horarioClass = getHorarioButtonClass(isDisabled, isSelected);

                        return (
                            <Button
                                key={checkboxValue}
                                disabled={isDisabled}
                                className={`!flex !flex-col !items-center !justify-center !p-2
                                    !duration-150 !w-auto !h-auto !gap-1 !rounded-md ${horarioClass}`}
                                onClick={() => {
                                    if (session?.user?.role !== 'ATLETA') {
                                        handleLoginRedirect();
                                        return;
                                    }
                                    !isDisabled && handleHorarioClick(quadra, horario)
                                    console.log(`ID horário: ${horario.id}`);
                                }}
                            >
                                <Typography.Text className="!text-sm !leading-tight" style={{ color: 'inherit' }}>
                                    {formatarIntervalo(horario.horarioInicio, quadra.duracaoReserva)}
                                </Typography.Text>
                                <Typography.Text strong className="!text-sm" style={{ color: 'inherit' }}>
                                    {horario.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </Typography.Text>
                            </Button>
                        );
                    };

                    return (
                        <Card
                            key={quadra.id}
                            className="!border-0 !p-0 !shadow-none !border-b last:!border-b-0 !bg-transparent !border-gray-200"
                            styles={{ body: { padding: 0 } }}
                        >
                            <div className="flex flex-col lg:flex-row py-4">
                                <div className="w-full lg:w-82 lg:flex-shrink-0 p-2 pr-4">
                                    <div className='flex flex-row items-start gap-4'>
                                        <div className='relative h-24 min-w-[120px] w-30 overflow-hidden flex-shrink-0'>
                                            <Image
                                                src={quadra.urlFotoQuadra || '/images/imagem-default.png'}
                                                alt={`Imagem da ${quadra.nomeQuadra}`}
                                                fill
                                                className="!object-cover !rounded-md !bg-gray-200"
                                            />
                                        </div>
                                        <div className="flex-grow pt-1">
                                            <Typography.Title level={5} className="!font-semibold !text-lg !leading-tight !mb-1">
                                                {quadra.nomeQuadra}
                                            </Typography.Title>
                                            <Typography.Text className="!text-green-600 !text-sm !font-semibold !capitalize">
                                                {quadra.tipoQuadra.map(formatarEsporte).join(', ')}
                                            </Typography.Text>
                                            {quadra.materiaisFornecidos && quadra.materiaisFornecidos.length > 0 && (
                                                <Typography.Text type='secondary' className="!mt-2 !block !text-sm">
                                                    A Arena vai disponibilizar para você:{' '}
                                                    <span className="text-green-600 font-bold">
                                                        {quadra.materiaisFornecidos.map(formatarMaterial).join(', ')}
                                                    </span>
                                                </Typography.Text>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full p-2">
                                    {(() => {
                                        if (horariosLoading) {
                                            return (
                                                <div className="flex justify-center items-center h-full"><Spin /></div>
                                            );
                                        }
                                        if (horariosDaQuadra.length > 0) {
                                            return (
                                                <div className='flex flex-col sm:flex-row sm:space-x-4'>
                                                    {horariosManha.length > 0 && (
                                                        <div className="mb-4">
                                                            <Typography.Text strong className="text-sm text-gray-500 mb-2 block">Manhã</Typography.Text>
                                                            <div className="flex flex-wrap gap-2">{horariosManha.map(renderHorario)}</div>
                                                        </div>
                                                    )}
                                                    {horariosTarde.length > 0 && (
                                                        <div className="mb-4">
                                                            <Typography.Text strong className="text-sm text-gray-500 mb-2 block">Tarde</Typography.Text>
                                                            <div className="flex flex-wrap gap-2">{horariosTarde.map(renderHorario)}</div>
                                                        </div>
                                                    )}
                                                    {horariosNoite.length > 0 && (
                                                        <div className="mb-4">
                                                            <Typography.Text strong className="text-sm text-gray-500 mb-2 block">Noite</Typography.Text>
                                                            <div className="flex flex-wrap gap-2">{horariosNoite.map(renderHorario)}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="flex items-center justify-start h-full p-4">
                                                <Typography.Text className="text-gray-500">
                                                    Nenhum horário disponível {['sábado', 'domingo'].includes(diaDaSemanaFormatado.replace("-feira", "").toLowerCase())
                                                        ? 'no'
                                                        : 'na'} {diaDaSemanaFormatado.replace("-feira", "")}
                                                </Typography.Text>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <ModalRedirecionamentoLogin
                open={isLoginModalVisible}
                onClose={() => setIsLoginModalVisible(false)}
                onConfirm={async () => {
                    router.push('/login?callbackUrl=/quadras/' + arenaId)
                    await signOut({ redirect: false });
                }}
                countdownSeconds={20}
            />

            {arena && quadraSelecionada && (
                <DrawerConfirmacaoReserva
                    open={isDrawerVisible}
                    onClose={() => {
                        setIsDrawerVisible(false);
                    }}
                    arena={arena}
                    quadraSelecionada={quadraSelecionadaComHorarios}
                    selectedDate={selectedDate}
                    selectedHorarios={selectedHorarios}
                    quadras={quadrasComHorarios}
                />
            )}
        </div>
    );
}
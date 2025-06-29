import React, { useState, useEffect } from 'react';
import { Drawer, Form, Button, Switch, Select, Radio, Typography } from 'antd';
import { IoCloseOutline } from "react-icons/io5";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { format, addMonths, addDays, getDay, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import type {
    MaterialFornecido,
    DuracaoReserva
} from '@/app/api/entities/quadra';
import type { Arena as ArenaOficial } from '@/app/api/entities/arena';
import type { QuadraComHorarios, Horario } from '@/app/(atleta)/quadras-page/[arenaId]/page';
import { formatarEsporte } from '@/data/mapeamentoEsportes';

const { Text } = Typography;

const formatarMaterial = (material: MaterialFornecido): string => {
    return material.charAt(0).toUpperCase() + material.slice(1).toLowerCase();
}

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    arena: ArenaOficial;
    quadraSelecionada: QuadraComHorarios | null;
    selectedDate: string;
    selectedHorarios: string[];
    quadras: QuadraComHorarios[];
}

const getDuracaoEmMinutos = (duracao?: DuracaoReserva): number => {
    switch (duracao) {
        case 'UMA_HORA':
            return 60;
        case 'UMA_HORA_E_MEIA':
            return 90;
        case 'TRINTA_MINUTOS':
        default:
            return 30;
    }
};

export const DrawerConfirmacaoReserva: React.FC<DrawerProps> = ({
    open,
    onClose,
    arena,
    quadraSelecionada,
    selectedDate,
    selectedHorarios,
    quadras
}) => {
    const [form] = Form.useForm();
    const [isFix, setIsFix] = useState(false);
    const [isIncomplete, setIsIncomplete] = useState(false);
    const [numeroJogadoresFaltando, setNumeroJogadoresFaltando] = useState(0);
    const [fixedDurationMonths, setFixedDurationMonths] = useState<number>(0);

    useEffect(() => {
        if (quadraSelecionada) {
            if (quadraSelecionada.tipoQuadra.length === 1) {
                form.setFieldValue('esporteSelecionado', quadraSelecionada.tipoQuadra[0]);
            } else {
                form.resetFields(['esporteSelecionado']);
            }
        }
        // Reset states on drawer close/open
        if (!open) {
            setIsFix(false);
            setIsIncomplete(false);
            setNumeroJogadoresFaltando(0);
            setFixedDurationMonths(0);
        }
    }, [quadraSelecionada, open, form]);

    const handleFormSubmit = (values: any) => {
        const finalBookingDetails = {
            ...values,
            isFix,
            fixedDurationMonths: isFix ? fixedDurationMonths : 0,
            isIncomplete,
            numeroJogadoresFaltando: isIncomplete ? numeroJogadoresFaltando : 0,
            horarios: selectedHorarios,
            data: selectedDate,
            quadraId: quadraSelecionada?.id,
            arenaId: arena.id,
            total: calcularTotal(),
        };
        console.log("DADOS FINAIS DA RESERVA:", finalBookingDetails);
        alert('Reserva confirmada! Verifique o console para ver os dados.');
        onClose();
    };

    const getOccurrences = (startDate: Date, months: number): { count: number, lastDate: Date } => {
        if (months === 0) return { count: 0, lastDate: startDate };

        const targetDayOfWeek = getDay(startDate);
        const endDate = addMonths(startDate, months);
        let count = 0;
        let currentDate = startDate;
        let lastDate = startDate;

        while (isBefore(currentDate, endDate)) {
            if (getDay(currentDate) === targetDayOfWeek) {
                count++;
                lastDate = currentDate;
            }
            currentDate = addDays(currentDate, 7);
        }
        return { count, lastDate };
    };

    const calcularTotal = (): number => {
        if (!selectedHorarios || !quadras || selectedHorarios.length === 0) return 0;

        const basePrice = selectedHorarios
            .map((val) => {
                const [quadraId, hora] = val.split('|');
                const quadra = quadras.find(q => q.id === Number(quadraId));
                const horario: Horario | undefined = quadra?.horarios?.find((h: Horario) => h.hora === hora && h.data === selectedDate);
                return horario?.preco ?? 0;
            })
            .reduce((acc, preco) => acc + preco, 0);

        if (isFix && fixedDurationMonths > 0 && selectedDate) {
            const startDate = parseISO(selectedDate + 'T00:00:00');
            const { count } = getOccurrences(startDate, fixedDurationMonths);
            return basePrice * count;
        }

        return basePrice;
    };

    const renderResumoHorario = () => {
        if (!selectedHorarios || selectedHorarios.length === 0 || !quadraSelecionada) return null;

        const duracaoMinutosPorSlot = getDuracaoEmMinutos(quadraSelecionada.duracaoReserva);
        const horariosOrdenados = selectedHorarios
            .map(h => h.split('|')[1])
            .sort((a, b) => a.localeCompare(b));
        const horaInicioStr = horariosOrdenados[0];
        const ultimoHorarioStr = horariosOrdenados[horariosOrdenados.length - 1];

        const [h, m] = ultimoHorarioStr.split(':').map(Number);
        const fimMinutosTotal = (h * 60) + m + duracaoMinutosPorSlot;
        const horaFimStr = `${String(Math.floor(fimMinutosTotal / 60) % 24).padStart(2, '0')}:${String(fimMinutosTotal % 60).padStart(2, '0')}`;

        const duracaoTotalMinutos = horariosOrdenados.length * duracaoMinutosPorSlot;
        const totalHoras = Math.floor(duracaoTotalMinutos / 60);
        const totalMinutos = duracaoTotalMinutos % 60;

        const partesDuracao = [];
        if (totalHoras > 0) partesDuracao.push(`${totalHoras}h`);
        if (totalMinutos > 0) partesDuracao.push(`${totalMinutos}min`);
        const duracaoFormatada = partesDuracao.join(' ');

        if (isFix && fixedDurationMonths > 0 && selectedDate) {
            const startDate = parseISO(selectedDate + 'T00:00:00');
            const { count, lastDate } = getOccurrences(startDate, fixedDurationMonths);
            const diaDaSemana = format(startDate, 'EEEE', { locale: ptBR });
            const diaDaSemanaPlural = (diaDaSemana.toLowerCase().endsWith('s')
                ? diaDaSemana.toLowerCase()
                : diaDaSemana.toLowerCase().replace('-feira', 's-feiras')
            );
            const diaDaSemanaFinal = diaDaSemanaPlural.charAt(0).toUpperCase() + diaDaSemanaPlural.slice(1);
            const textoResumo = `${diaDaSemanaFinal} de ${format(startDate, 'dd/MM')} até ${format(lastDate, 'dd/MM')}`;

            return (
                <div className="flex items-center gap-4 w-full">
                    <div className="flex flex-col flex-1">
                        <span className="font-semibold text-sm">{textoResumo}</span>
                        <span className="text-sm text-gray-600">{`${horaInicioStr} às ${horaFimStr} (${duracaoFormatada})`}</span>
                        <span className="text-green-600 font-bold text-lg mt-1">
                            {calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({count} dias)
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center min-w-[48px] gap-1 p-2 rounded-md">
                        <span className="text-2xl font-bold leading-none">
                            {format(new Date(selectedDate + 'T00:00:00'), 'dd')}
                        </span>
                        <span className="text-lg uppercase font-bold text-gray-500 leading-none">
                            {format(new Date(selectedDate + 'T00:00:00'), 'MMM', { locale: ptBR })}
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-4 w-full">
                <div className="flex flex-col flex-1">
                    <span className="font-semibold text-base">{`${horaInicioStr} às ${horaFimStr} (${duracaoFormatada})`}</span>
                    <span className="text-green-600 font-bold text-lg mt-1">
                        {calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[48px] gap- p-2 rounded-md">
                    <span className="text-2xl font-bold leading-none">
                        {format(new Date(selectedDate + 'T00:00:00'), 'dd')}
                    </span>
                    <span className="text-lg uppercase font-bold text-gray-500 leading-none">
                        {format(new Date(selectedDate + 'T00:00:00'), 'MMM', { locale: ptBR })}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <Drawer placement="right" onClose={onClose} open={open} closable={false}>
            <div className='flex flex-col h-full overflow-y-auto'>
                <div className='py-2 flex justify-start'>
                    <Button onClick={onClose} type="text" shape="circle" icon={<IoCloseOutline className="text-black w-6 h-6" />} />
                </div>
                <Form form={form} layout="vertical" onFinish={handleFormSubmit} className="flex flex-col justify-between px-6 pb-6 w-full h-full">
                    <div className="flex flex-col">
                        <div className="flex flex-col mb-4">
                            <h1 className="text-xl font-bold mb-1">{arena.nome}</h1>
                            <h2 className='font-semibold'>{quadraSelecionada?.nomeQuadra}</h2>
                            {quadraSelecionada?.materiaisFornecidos && quadraSelecionada.materiaisFornecidos.length > 0 && (
                                <p className="text-sm text-black mt-2">
                                    A Arena vai disponibilizar para você:{' '}
                                    <span className="text-green-600 font-semibold">
                                        {quadraSelecionada.materiaisFornecidos.length === 1
                                            ? formatarMaterial(quadraSelecionada.materiaisFornecidos[0])
                                            : quadraSelecionada.materiaisFornecidos.map(formatarMaterial).reduce((acc, curr, idx, arr) => {
                                                if (idx === 0) return curr;
                                                if (idx === arr.length - 1) return `${acc} e ${curr}`;
                                                return `${acc}, ${curr}`;
                                            }, '')}
                                    </span>
                                </p>
                            )}
                        </div>
                        {selectedHorarios.length > 0 && (
                            <div className="flex flex-row items-center gap-4 rounded-lg py-2 px-3 mb-4 border-2 border-gray-200">
                                {renderResumoHorario()}
                            </div>
                        )}
                        <div className="flex flex-col gap-2 mb-4">
                            {quadraSelecionada && quadraSelecionada.tipoQuadra.length > 1 && (
                                <Form.Item name="esporteSelecionado" label={<Text className='font-semibold text-lg'>Selecione um esporte</Text>} rules={[{ required: true, message: 'Por favor, selecione um esporte!' }]}>
                                    <Select placeholder="Selecione um esporte" className="w-full">
                                        {quadraSelecionada.tipoQuadra.map((esporte) => (
                                            <Select.Option key={esporte} value={esporte}>{formatarEsporte(esporte)}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}
                            <div className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                <span>Quer reservar este horário como fixo?</span>
                                <Switch size="small" checked={isFix} onChange={(c) => {
                                    setIsFix(c);
                                    if (c) {
                                        setIsIncomplete(false);
                                        if (fixedDurationMonths === 0) setFixedDurationMonths(1);
                                    } else {
                                        setFixedDurationMonths(0);
                                    }
                                }} />
                            </div>
                            {isFix && (
                                <Radio.Group value={fixedDurationMonths} onChange={(e) => setFixedDurationMonths(e.target.value)} className='!flex !justify-between'>
                                    <Radio value={1}>1 mês</Radio>
                                    <Radio value={3}>3 meses</Radio>
                                    <Radio value={6}>6 meses</Radio>
                                </Radio.Group>
                            )}
                            <div className="flex justify-between items-center bg-gray-100 p-2 mt-2 rounded-md">
                                <span>Tá faltando gente?</span>
                                <Switch size="small" checked={isIncomplete} onChange={(c) => {
                                    setIsIncomplete(c);
                                    if (c) {
                                        setIsFix(false);
                                        setFixedDurationMonths(0);
                                        if (numeroJogadoresFaltando === 0) setNumeroJogadoresFaltando(1);
                                    } else {
                                        setNumeroJogadoresFaltando(0);
                                    }
                                }} />
                            </div>
                            {isIncomplete && (
                                <div className='flex justify-between items-center mt-2'>
                                    <span className='text-sm text-gray-600'>Quantos jogadores você precisa?</span>
                                    <div className="flex items-center rounded border border-gray-300">
                                        <Button
                                            type='text'
                                            disabled={numeroJogadoresFaltando <= 1}
                                            onClick={() => setNumeroJogadoresFaltando(p => Math.max(1, p - 1))}
                                            icon={<AiOutlineMinus />}
                                        />
                                        <span className="px-4 font-semibold">{numeroJogadoresFaltando}</span>
                                        <Button
                                            type='text'
                                            onClick={() => setNumeroJogadoresFaltando(p => p + 1)}
                                            icon={<AiOutlinePlus />}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 justify-end">
                        <div className='flex justify-between items-center mb-4'>
                            <span className='text-lg'>Total</span>
                            <span className='font-bold text-lg text-green-600'>{calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <Button type="primary" htmlType="submit" className="w-full bg-green-primary !font-semibold hover:bg-green-500 text-white !py-5 !rounded-md">
                            Confirmar agendamento
                        </Button>
                    </div>
                </Form>
            </div>
        </Drawer>
    );
}
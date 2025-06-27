"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format, addDays, isBefore, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Button, Checkbox, Form, Switch, Select, Radio } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { ArenaCard } from '@/components/ArenaCard';
import Image from 'next/image';
import { TbSoccerField } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoCloseOutline } from "react-icons/io5";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";


type Arena = {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cpfProprietario: string;
    cnpj: string;
    endereco: {
        cep: string;
        estado: string;
        cidade: string;
        bairro: string;
        rua: string;
        numero: string;
        complemento: string;
    };
    descricao: string;
    sports?: string[];
    avaliacao?: number;
    numeroAvaliacoes?: number;
    urlFoto: string;
    role: string;
};

type Horario = {
    data: string;
    hora: string;
    preco: number;
    disponivel: boolean;
};

type Quadra = {
    id: string;
    nome: string;
    image: string;
    esportes: string[];
    horarioFuncionamento: [number, number][];
    horarios?: Horario[];
    equipamentosDisponibilizados?: string[];
};

const arena: Arena & {

} = {
    id: 10,
    nome: 'Arena B',
    email: 'contato@arenaa.com',
    telefone: '(85) 99999-9999',
    cpfProprietario: '123.456.789-00',
    cnpj: '12.345.678/0001-99',
    avaliacao: 5.0,
    numeroAvaliacoes: 10,
    descricao: 'Arena esportiva simples em Fortaleza.',
    urlFoto: '/arenaesportes.png',
    role: 'arena',
    endereco: {
        cidade: 'Fortaleza',
        estado: 'CE',
        rua: 'Av. Mister Hull',
        numero: 's/n',
        bairro: 'Pici',
        cep: '60455-760',
        complemento: 'Próximo ao IFCE',
    },
};

const gerarHorarios = (intervalos: [number, number][], dias: number): Horario[] => {
    const horarios: Horario[] = [];
    const hoje = new Date();

    for (let i = 0; i < dias; i++) {
        const dataAtual = addDays(hoje, i);
        const dataStr = format(dataAtual, 'yyyy-MM-dd');

        intervalos.forEach(([inicio, fim]) => {
            for (let hora = inicio; hora < fim; hora++) {
                ['00', '30'].forEach((minuto) => {
                    const horaCompleta = `${String(hora).padStart(2, '0')}:${minuto}`;
                    const dataHoraCompleta = setMinutes(setHours(dataAtual, hora), parseInt(minuto));
                    if (isBefore(dataHoraCompleta, new Date())) return;

                    horarios.push({
                        data: dataStr,
                        hora: horaCompleta,
                        preco: 100,
                        disponivel: true,
                    });
                });
            }
        });
    }

    return horarios;
};

function formatarIntervalo(horaInicio: string, intervalos: [number, number][]) {
    const [horaStr, minStr] = horaInicio.split(':');
    const minutosInicio = parseInt(horaStr) * 60 + parseInt(minStr);
    let minutosFim = minutosInicio + 30;

    for (const [inicio, fim] of intervalos) {
        const inicioMinutos = inicio * 60;
        const fimMinutos = fim * 60;

        if (minutosInicio >= inicioMinutos && minutosInicio < fimMinutos) {
            if (minutosFim > fimMinutos) {
                minutosFim = fimMinutos;
            }
            break;
        }
    }

    const formatarMinutos = (m: number) => {
        const h = Math.floor(m / 60);
        const min = m % 60;
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };

    return `${horaInicio} às ${formatarMinutos(minutosFim)}`;
}

const quadrasPorArena: { [key: string]: Quadra[] } = {
    A: [
        {
            id: '1',
            nome: 'Campo 1',
            esportes: ['Futebol'],
            image: '/arenaesportes.png',
            horarioFuncionamento: [
                [15, 17],
                [18, 23],
            ],
            equipamentosDisponibilizados: ['Colete', 'Bola', 'apito'],
        },
        {
            id: '2',
            nome: 'Quadra 1',
            image: '/arenaesportes.png',
            esportes: ['Beach Tennis', 'Vôlei', 'Futevôlei'],
            horarioFuncionamento: [[18, 22]],
            equipamentosDisponibilizados: ['Colete', 'Bola', 'apito'],
        },
        {
            id: '3',
            nome: 'Quadra 2',
            image: '/arenaesportes.png',
            esportes: ['Beach Tennis', 'Vôlei', 'Futevôlei'],
            horarioFuncionamento: [[18, 22]],
            equipamentosDisponibilizados: ['Colete', 'Bola', 'apito'],
        },
        {
            id: '4',
            nome: 'Quadra 3',
            image: '/arenaesportes.png',
            esportes: ['Beach Tennis', 'Vôlei', 'Futevôlei'],
            horarioFuncionamento: [[18, 22]],
            equipamentosDisponibilizados: ['Colete', 'Bola', 'apito'],
        },
    ],
};

export default function QuadraPage() {
    const params = useParams();
    const arenaId = params?.arenaId as string;

    // Fallback to "A" if arenaId is not found in mock (for development/demo)
    const quadrasRaw = quadrasPorArena[arenaId] || quadrasPorArena["A"] || [];
    const quadras: Quadra[] = quadrasRaw.map((q) => ({
        ...q,
        horarios: gerarHorarios(q.horarioFuncionamento, 30),
    }));

    const [startIndex, setStartIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);

    const allDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));
    const [horarioFoiEscolhido, setHorarioFoiEscolhido] = useState(false);
    const [isFix, setIsFix] = useState(false);
    const [isIncomplete, setIsIncomplete] = useState(false);
    const [quadraSelecionada, setQuadraSelecionada] = useState<Quadra | null>(null);
    const [numeroJogadoresFaltando, setNumeroJogadoresFaltando] = useState(0);


    useEffect(() => {
        if (!selectedDate && allDates.length > 0) {
            setSelectedDate(format(allDates[0], 'yyyy-MM-dd'));
        }
    }, [arenaId, allDates, selectedDate]);

    const visibleDates = allDates.slice(startIndex, startIndex + 7);

    const onCheckboxChange = (e: CheckboxChangeEvent) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedHorarios((prev) => [...prev, value]);
        } else {
            setSelectedHorarios((prev) => prev.filter((h) => h !== value));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Horários selecionados:\n${selectedHorarios.join(', ')}`);
    };

    return (
        <div className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
            <div className='flex flex-row items-start justify-between mb-6'>
                <ArenaCard arena={arena} showDescription={true} />
                {selectedHorarios.length > 0 && (
                    <Button
                        type="primary"
                        onClick={() => setHorarioFoiEscolhido(true)}
                        className="w-full flex flex-row hover:bg-green-500 !py-7 !rounded-none bg-green-primary !fixed bottom-0 left-0 z-50 sm:!z-0 sm:!static sm:w-auto text-white hover:!bg-green-500"
                    >
                        <span className="flex flex-row items-center justify-center w-full">
                            <TbSoccerField className="w-8 h-9 mr-2 rotate-135" />
                            <span className="flex flex-col items-start justify-center text-base">
                                <span className="font-semibold text-center">
                                    {selectedHorarios
                                        .map((val) => {
                                            const [quadraId, hora] = val.split('|');
                                            const quadra = quadras.find(q => q.id === quadraId);
                                            const horario = quadra?.horarios?.find(h => h.hora === hora && h.data === selectedDate);
                                            return horario?.preco || 0;
                                        })
                                        .reduce((acc, preco) => acc + preco, 0)
                                        .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                <span>
                                    {selectedHorarios.length} horário{selectedHorarios.length > 1 ? 's' : ''}
                                </span>
                            </span>
                        </span>
                    </Button>
                )}
            </div>


            <div className="text-center text-lg font-semibold mb-2 capitalize mt-4">
                {format(allDates[startIndex], 'MMMM yyyy', { locale: ptBR })}
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
                <button
                    onClick={() => setStartIndex(Math.max(0, startIndex - 1))}
                    disabled={startIndex === 0}
                    className={`flex min-w-[42px] px-2 py-2 rounded justify-center items-center text-center text-sm ${startIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-green-500 hover:text-white'}`}
                    aria-label="Back"
                    title="Back"
                >
                    <IoIosArrowBack className='h-9' />
                </button>

                <div className="flex gap-2 overflow-x-auto">
                    {visibleDates.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isSelected = selectedDate === dateStr;
                        return (
                            <button
                                key={dateStr}
                                className={`min-w-[56px] px-2 py-2 rounded text-center text-sm font-semibold ${isSelected ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'}`}
                                onClick={() => {
                                    setSelectedDate(dateStr);
                                    setSelectedHorarios([]);
                                }}
                            >
                                <div>{format(day, 'd', { locale: ptBR })}</div>
                                <div className="text-xs font-inter">
                                    {format(day, 'eee', { locale: ptBR })
                                        .slice(0, 3)
                                        .replace(/^./, (c) => c.toUpperCase())}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => setStartIndex(Math.min(allDates.length - 7, startIndex + 1))}
                    disabled={startIndex + 7 >= allDates.length}
                    className={`flex min-w-[42px] px-2 py-2 rounded justify-center items-center text-center text-sm ${startIndex + 7 >= allDates.length ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-green-500 hover:text-white'}`}
                    aria-label="Next"
                    title="Next"
                >
                    <IoIosArrowForward className='h-9' />
                </button>
            </div>

            <Form onFinish={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                    {quadras.map((quadra) => (
                        <div key={quadra.id} className="border border-gray-400 rounded-lg p-4 mb-2">
                            <div className="flex rounded-lg overflow-hidden gap-4 mb-4">
                                <div className="rounded-lg relative h-25 min-w-[144px] w-45 overflow-hidden bg-gray-300 flex-shrink-0">
                                    <Image
                                        src={quadra.image}
                                        alt={`Imagem da ${quadra.nome}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">{quadra.nome}</h3>
                                        <p className="text-green-600 text-sm mb-2 font-semibold">{quadra.esportes.join(', ')}</p>
                                        {quadra.equipamentosDisponibilizados && (
                                            <p className="text-sm text-black">
                                                A arena vai disponibilizar para você:{' '}
                                                <span className="text-green-600 font-semibold">
                                                    {quadra.equipamentosDisponibilizados?.join(', ')}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex flex-row gap-2 overflow-x-auto pb-2">
                                    {quadra.horarios
                                        ?.filter((h) => h.data === selectedDate)
                                        .map((horario) => {
                                            const checkboxValue = `${quadra.id}|${horario.hora}`;
                                            return (
                                                <label
                                                    key={checkboxValue}
                                                    className={`flex flex-row items-center gap-2 rounded border px-2 py-2 text-xs select-none min-w-[130px] max-w-[160px] ${horario.disponivel
                                                        ? selectedHorarios.includes(checkboxValue)
                                                            ? 'border-green-600 bg-white text-black'
                                                            : 'border-gray-300 bg-white text-black hover:bg-green-50'
                                                        : 'opacity-50 text-gray-400 line-through cursor-not-allowed bg-gray-100 border-gray-100'
                                                        }`}
                                                >
                                                    <Checkbox
                                                        value={checkboxValue}
                                                        disabled={
                                                            !horario.disponivel ||
                                                            (
                                                                selectedHorarios.length > 0 &&
                                                                !selectedHorarios[0].startsWith(`${quadra.id}|`)
                                                            )
                                                        }
                                                        checked={selectedHorarios.includes(checkboxValue)}
                                                        onChange={(e) => {
                                                            onCheckboxChange(e);
                                                            if (e.target.checked) {
                                                                setQuadraSelecionada(quadra);
                                                            } else {
                                                                const horariosRestantes = selectedHorarios.filter(val => val.startsWith(`${quadra.id}|`));
                                                                if (horariosRestantes.length <= 1) {
                                                                    setQuadraSelecionada(null);
                                                                }
                                                            }
                                                        }}
                                                        className="accent-green-600 mr-1"
                                                    />
                                                    <div className="flex flex-col w-full">
                                                        <span className="block leading-tight text-left">
                                                            {formatarIntervalo(horario.hora, quadra.horarioFuncionamento)}
                                                        </span>
                                                        <span className="font-semibold text-left">R$ {horario.preco.toFixed(2)}</span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {horarioFoiEscolhido && (
                    <div className="flex flex-row !fixed inset-0 items-start justify-end h-full z-50">
                        <div className='flex flex-col bg-white w-[400px] h-full overflow-y-auto shadow-lg'>
                            <div className='bg-white py-4 max-w-md w-full'>
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        setHorarioFoiEscolhido(false);
                                        setIsIncomplete(false);
                                    }}
                                    className="!bg-white !shadow-none border-none"
                                >
                                    <IoCloseOutline className="text-black w-full h-full" />
                                </Button>
                            </div>

                            <div className="flex flex-col justify-between px-10 max-w-md w-full h-full">
                                <div className="flex flex-col mb-4">
                                    <h1 className="text-xl font-bold mb-1">{arena.nome}</h1>
                                    <h2 className='font-semibold'>{quadraSelecionada?.nome}</h2>
                                    {/* <h3>{arena.endereco}</h3> */}
                                    {quadraSelecionada?.equipamentosDisponibilizados && (
                                        <p className="text-sm text-black">
                                            A arena vai disponibilizar para você:{' '}
                                            <span className="text-green-600 font-semibold">
                                                {quadraSelecionada?.equipamentosDisponibilizados?.join(', ')}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {selectedHorarios.length > 0 && (
                                    <div className="flex flex-row items-center gap-4 rounded-lg p-2 mb-4 border border-gray-200">

                                        <div className="flex flex-col flex-1">
                                            <span className="font-semibold text-base">
                                                {(() => {
                                                    const horariosSelecionados = selectedHorarios
                                                        .filter(val => {
                                                            const [quadraId] = val.split('|');
                                                            return quadraSelecionada?.id === quadraId;
                                                        })
                                                        .map(val => {
                                                            const [, hora] = val.split('|');
                                                            return hora;
                                                        })
                                                        .sort();

                                                    if (horariosSelecionados.length === 0) return "Selecione um horário";

                                                    // Ordenar corretamente os horários
                                                    const horariosOrdenados = horariosSelecionados
                                                        .map(h => {
                                                            const [hh, mm] = h.split(':').map(Number);
                                                            return hh * 60 + mm;
                                                        })
                                                        .sort((a, b) => a - b);

                                                    const inicio = horariosOrdenados[0];
                                                    const fim = horariosOrdenados[horariosOrdenados.length - 1] + 30;
                                                    const duracaoMin = fim - inicio;
                                                    const horas = Math.floor(duracaoMin / 60);
                                                    const minutos = duracaoMin % 60;

                                                    const formatarHora = (minutos: number) => {
                                                        const h = Math.floor(minutos / 60);
                                                        const m = minutos % 60;
                                                        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                                                    };

                                                    const horaInicioStr = formatarHora(inicio);
                                                    const horaFimStr = formatarHora(fim);

                                                    return (
                                                        <>
                                                            {horaInicioStr} às {horaFimStr}
                                                            {' '}
                                                            (
                                                            {horas > 0 && `${horas} hora${horas > 1 ? 's' : ''}`}
                                                            {horas > 0 && minutos > 0 && ' '}
                                                            {minutos > 0 && `${minutos} min`}
                                                            )
                                                        </>
                                                    );
                                                })()}
                                            </span>
                                            <span className="text-green-600 font-bold text-lg mt-1">
                                                {selectedHorarios
                                                    .filter(val => {
                                                        const [quadraId] = val.split('|');
                                                        return quadraSelecionada?.id === quadraId;
                                                    })
                                                    .map(val => {
                                                        const [quadraId, hora] = val.split('|');
                                                        const quadra = quadras.find(q => q.id === quadraId);
                                                        const horario = quadra?.horarios?.find(h => h.hora === hora && h.data === selectedDate);
                                                        return horario?.preco || 0;
                                                    })
                                                    .reduce((acc, preco) => acc + preco, 0)
                                                    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center justify-center min-w-[48px] gap-2">
                                            <span className="text-2xl font-bold leading-none">
                                                {format(
                                                    new Date(
                                                        selectedDate + 'T00:00:00'
                                                    ),
                                                    'dd'
                                                )}
                                            </span>
                                            <span className="text-lg uppercase font-bold text-gray-500 leading-none">
                                                {format(
                                                    new Date(
                                                        selectedDate + 'T00:00:00'
                                                    ),
                                                    'MMM',
                                                    { locale: ptBR }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col gap-2 mb-4">
                                    <h1 className='font-semibold text-lg'>Selecione um esporte</h1>

                                    <Form.Item
                                        name="esporteSelecionado"
                                        className="sem-asterisco flex flex-col className='!mb-2'"
                                    >
                                        <Select
                                            placeholder="Selecione um esporte"
                                            className="w-full !bg-gray-200 border border-gray-300 rounded-md"
                                        >
                                            {quadraSelecionada?.esportes.map((esporte) => (
                                                <Select.Option key={esporte} value={esporte}>
                                                    {esporte}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item className='sem-asterisco !mb-2'>
                                        <div className="flex flex-row flex-wrap justify-between items-center bg-gray-200 p-2 rounded-md border border-gray-300">
                                            <span>Quer reservar este horário como fixo?</span>
                                            <Switch
                                                size="small"
                                                checked={isFix}
                                                onChange={(checked) => {
                                                    setIsFix(checked);
                                                    if (checked) {
                                                        setIsIncomplete(false); // Desativa o outro
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Form.Item>

                                    {isFix && (
                                        <Form.Item>
                                            <Radio.Group
                                                className='flex flex-row justify-between items-center'
                                                name="quantidadeMeses"
                                                defaultValue={1}
                                                options={[
                                                    { value: 1, label: '1 mês' },
                                                    { value: 3, label: '3 meses' },
                                                    { value: 6, label: '6 meses' },
                                                ]}></Radio.Group>
                                        </Form.Item>
                                    )}

                                    <Form.Item className='sem-asterisco !mb-2'>
                                        <div className="flex flex-row flex-wrap justify-between items-center bg-gray-200 p-2 rounded-md border border-gray-300">
                                            <span>Tá faltando gente?</span>
                                            <Switch
                                                size="small"
                                                checked={isIncomplete}
                                                onChange={(checked) => {
                                                    setIsIncomplete(checked);
                                                    if (checked) {
                                                        setIsFix(false); // Desativa o outro
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Form.Item>

                                    {isIncomplete && (
                                        <div className='flex flex-row gap-3 items-start'>
                                            <span className='text-sm text-gray-600'>Quantos jogadores você precisa?</span>
                                            <Form.Item className='sem-asterisco flex-1 flex-col !mb-0 !h-10'>
                                                <div className="flex flex-row items-center rounded border border-gray-300 h-10">
                                                    <Button
                                                        onClick={() => setNumeroJogadoresFaltando(prev => Math.max(0, prev - 1))}
                                                        disabled={numeroJogadoresFaltando === 0}
                                                        className="!px-3 !py-1 !text-black text-center !border-none hover:!bg-gray-300 disabled:!bg-gray-100 disabled:!text-gray-400 !h-full"
                                                    >
                                                        <AiOutlineMinus />
                                                    </Button>
                                                    <span className="px-4 text-center font-semibold text-lg border-x border-gray-300 flex items-center h-full">
                                                        {numeroJogadoresFaltando}
                                                    </span>
                                                    <Button
                                                        onClick={() => setNumeroJogadoresFaltando(prev => prev + 1)}
                                                        className="!px-3 !py-1 !text-black !border-none hover:!bg-gray-300 flex items-center justify-center !h-full"
                                                    >
                                                        <AiOutlinePlus />
                                                    </Button>
                                                </div>
                                            </Form.Item>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col flex-1 justify-end">
                                    <div className='flex flex-row justify-between items-center mb-4'>
                                        <span className='text-lg'>Total</span>
                                        <span className='text-lg font-semibold text-green-600'>
                                            {selectedHorarios
                                                .map((val) => {
                                                    const [quadraId, hora] = val.split('|');
                                                    const quadra = quadras.find(q => q.id === quadraId);
                                                    const horario = quadra?.horarios?.find(h => h.hora === hora && h.data === selectedDate);
                                                    return horario?.preco || 0;
                                                })
                                                .reduce((acc, preco) => acc + preco, 0)
                                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="w-full bg-green-primary !font-semibold hover:bg-green-500 text-white !py-5 !rounded-md"
                                    >
                                        Confirmar agendamento

                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Form>
        </div>
    );
}

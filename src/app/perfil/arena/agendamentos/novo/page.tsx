'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    Layout,
    Card,
    Typography,
    Button,
    Modal,
    Form,
    AutoComplete,
    Input,
    Avatar,
    Flex,
    Divider,
    App,
    Spin,
    Empty,
    Tag,
    Descriptions,
    Select
} from 'antd';
import { UserOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { useTheme } from '@/context/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';
import { formatarTelefone } from '@/context/functions/formatarTelefone';

// --- IMPORTAÇÕES DAS APIS ---
import {
    type Quadra as QuadraType,
    type HorariosDisponiveis,
    getAllQuadras,
    getHorariosDisponiveisPorQuadra,
    TipoQuadra
} from '@/app/api/entities/quadra';
import {
    createAgendamentoExterno,
    AgendamentoExterno
} from '@/app/api/entities/agendamento';
import {
    searchAtletaByNomeOrTelefone,
    AtletaSimple
} from '@/app/api/entities/atleta';
import { useRouter } from 'next/navigation';

dayjs.locale('pt-br');

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;


type Atleta = AtletaSimple;

const getCategorizedTimes = (horarios: HorariosDisponiveis[]) => {
    const manha = horarios.filter(h => parseInt(h.horarioInicio.split(':')[0]) < 12);
    const tarde = horarios.filter(h => parseInt(h.horarioInicio.split(':')[0]) >= 12 && parseInt(h.horarioInicio.split(':')[0]) < 18);
    const noite = horarios.filter(h => parseInt(h.horarioInicio.split(':')[0]) >= 18);
    return { manha, tarde, noite };
};

export default function CriarAgendamentoExterno() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();
    const router = useRouter();

    const [quadras, setQuadras] = useState<(QuadraType)[]>([]);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState<Record<number, HorariosDisponiveis[]>>({});
    const [loadingQuadras, setLoadingQuadras] = useState(true);
    const [loadingHorarios, setLoadingHorarios] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ quadra: QuadraType; horario: HorariosDisponiveis; data: Dayjs } | null>(null);

    const [searchResults, setSearchResults] = useState<{ value: string; label: React.ReactNode; atleta: Atleta }[]>([]);
    const [selectedAthlete, setSelectedAthlete] = useState<Atleta | null>(null);
    const [isAddingNewAthlete, setIsAddingNewAthlete] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [direction, setDirection] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState<string>('');

    const allDates = Array.from({ length: 60 }, (_, i) => addDays(new Date(), i));
    const VISIBLE_DATES_WINDOW_SIZE = 10;

    useEffect(() => {
        if (allDates.length > 0 && !selectedDate) {
            setSelectedDate(format(allDates[0], 'yyyy-MM-dd'));
        }

        const fetchQuadras = async () => {
            setLoadingQuadras(true);
            try {
                const response = await getAllQuadras({ arenaId: 1, size: 50 });
                setQuadras(response.content);
            } catch (error) {
                console.error("Falha ao buscar quadras:", error);
                message.error("Não foi possível carregar as quadras.");
            } finally {
                setLoadingQuadras(false);
            }
        };
        fetchQuadras();
    }, []);

    useEffect(() => {
        if (!selectedDate || quadras.length === 0) return;

        const fetchTodosHorarios = async () => {
            setLoadingHorarios(true);
            try {
                const horariosPromises = quadras.map(quadra => getHorariosDisponiveisPorQuadra(quadra.id, selectedDate));
                const resultados = await Promise.all(horariosPromises);

                const novosHorarios: Record<number, HorariosDisponiveis[]> = {};
                resultados.forEach((horarios, index) => {
                    const quadraId = quadras[index].id;
                    novosHorarios[quadraId] = horarios;
                });
                setHorariosDisponiveis(novosHorarios);
            } catch (err) {
                console.error("Falha ao buscar horários:", err);
                message.error("Não foi possível carregar os horários para esta data.");
            } finally {
                setLoadingHorarios(false);
            }
        };
        fetchTodosHorarios();
    }, [selectedDate, quadras]);


    const handleAthleteSearch = useCallback(
        debounce(async (searchText: string) => {
            setIsSearching(true);
            if (!searchText || searchText.length < 3) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            try {
                const results = await searchAtletaByNomeOrTelefone(searchText);
                setSearchResults(results.map(atleta => ({
                    value: atleta.nome,
                    label: (
                        <Flex align="center" gap="small">
                            <Avatar src={atleta.urlFoto} icon={<UserOutlined />} size="small" />
                            <span>{atleta.nome} - {atleta.telefone}</span>
                        </Flex>
                    ),
                    atleta,
                })));
            } catch (error) {
                console.error("Erro ao buscar atleta:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500),
        []
    );

    const handleSlotClick = (quadra: QuadraType, horario: HorariosDisponiveis) => {
        if (!selectedDate) return;
        setSelectedSlot({ quadra, horario, data: dayjs(selectedDate) });
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setSelectedAthlete(null);
        setIsAddingNewAthlete(false);
        setSearchResults([]);
    };

    const handleFinish = async (values: any) => {
        if (!selectedSlot) {
            message.error("Nenhum horário selecionado.");
            return;
        }

        const payload: AgendamentoExterno = {
            quadraId: selectedSlot.quadra.id,
            dataAgendamento: selectedSlot.data.format('YYYY-MM-DD'),
            slotHorarioIds: [selectedSlot.horario.id], // Assumindo agendamento de 1 slot
            esporte: values.esporte || selectedSlot.quadra.tipoQuadra[0],
            atletaExistenteId: selectedAthlete ? selectedAthlete.id : undefined,
            novoAtleta: isAddingNewAthlete ? {
                nome: values.novoAtletaNome,
                telefone: values.novoAtletaTelefone
            } : undefined,
        };

        try {
            message.loading({ content: 'Criando agendamento...', key: 'agendamento' });
            await createAgendamentoExterno(payload);

            message.success({ content: `Agendamento criado com sucesso!`, key: 'agendamento' });

            // Recarrega os horários da quadra para refletir o novo agendamento
            const horariosAtualizados = await getHorariosDisponiveisPorQuadra(payload.quadraId, payload.dataAgendamento);
            setHorariosDisponiveis(prev => ({ ...prev, [payload.quadraId]: horariosAtualizados }));

            handleModalCancel();

            router.push("/perfil/arena/agendamentos");

        } catch (error) {
            console.error("Erro ao criar agendamento externo:", error);
            message.error({ content: (error as Error).message || "Falha ao criar agendamento.", key: 'agendamento' });
        }
    };

    const visibleDates = allDates.slice(startIndex, startIndex + VISIBLE_DATES_WINDOW_SIZE);

    // Primeira letra maiúscula em Strings
    const capitalizeFirstLetter = (string: string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    if (loadingQuadras) {
        return <Content className="!px-4 sm:!px-10 lg:!px-40 !py-8 flex justify-center items-center"><Spin size="large" /></Content>;
    }

    return (
        <Content className={`px-4 sm:px-10 lg:px-40 pt-8 pb-20 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            <Title level={3}>Criar Agendamento Externo</Title>
            <Paragraph type="secondary">Selecione uma data para ver horários livres.</Paragraph>

            <Typography.Title level={4} className="!text-center !capitalize !pt-4 !border-t-2 !border-transparent !border-t-gray-300">
                {selectedDate && format(parseISO(selectedDate), 'MMMM yyyy', { locale: ptBR })}
            </Typography.Title>

            <div className="flex items-center justify-center gap-3 my-6">
                <Button type='text' icon={<IoIosArrowBack />} onClick={() => { setDirection(-1); setStartIndex(Math.max(0, startIndex - 4)) }} disabled={startIndex === 0} className="!text-gray-500 hover:!text-gray-700" />
                <div className="flex gap-2 overflow-hidden w-full max-w-[580px]">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div key={startIndex} custom={direction} variants={{ enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }) }} initial="enter" animate="center" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className="flex gap-2">
                            {visibleDates.map((day) => {
                                const dateStr = format(day, 'yyyy-MM-dd');
                                const isSelected = selectedDate === dateStr;
                                return (
                                    <Button
                                        key={dateStr}
                                        type={isSelected ? 'primary' : 'default'}
                                        className={`!flex !flex-col !h-auto !px-4 !gap-1 !py-2 !text-center !text-sm !font-semibold !rounded-md !border-0 
                                            ${isSelected ?? '!bg-green-600'}`}
                                        onClick={() => setSelectedDate(dateStr)}
                                    >
                                        <div className='leading-tight'>
                                            {format(day, 'd', { locale: ptBR })}
                                        </div>
                                        <div className="text-xs">
                                            {format(day, 'eee', { locale: ptBR }).slice(0, 3)}
                                        </div>
                                    </Button>);
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <Button type='text' icon={<IoIosArrowForward />} onClick={() => { setDirection(1); setStartIndex(Math.min(allDates.length - 10, startIndex + 4)) }} disabled={startIndex + 10 >= allDates.length} className="!text-gray-500 hover:!text-gray-700" />
            </div>

            {selectedDate ? (
                <Spin spinning={loadingHorarios}>
                    <Flex vertical gap="large">
                        {quadras.map(quadra => {
                            const horariosDaQuadra = horariosDisponiveis[quadra.id] || [];
                            const categorizedTimes = getCategorizedTimes(horariosDaQuadra);
                            return (
                                <Card key={quadra.id} styles={{ body: { padding: 0 } }}>
                                    <Flex className="!flex-col md:!flex-row">
                                        <div className="w-full h-32 md:w-1/3 md:h-auto">
                                            <img
                                                src={quadra.urlFotoQuadra || 'https://i.imgur.com/P2XVRdi.png'}
                                                alt={quadra.nomeQuadra}
                                                className="object-cover h-full w-full rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                                            />
                                        </div>
                                        <div className="w-full md:w-2/3 p-4 md:p-6">
                                            <Flex justify="space-between" align="start">
                                                <div>
                                                    <Title level={4} className="!mt-0 !mb-1">{quadra.nomeQuadra}</Title>
                                                    <Flex wrap="wrap" gap="small">
                                                        {quadra.tipoQuadra.map(esporte => <Tag key={esporte} color="green">{formatarEsporte(esporte)}</Tag>)}
                                                    </Flex>
                                                </div>
                                            </Flex>
                                            <Divider className="!my-4" />
                                            {['manha', 'tarde', 'noite'].map(periodo => {
                                                const horariosPeriodo = categorizedTimes[periodo as keyof typeof categorizedTimes];
                                                if (horariosPeriodo.length === 0) return null;
                                                return (
                                                    <div className="mb-4" key={periodo}>
                                                        <Text strong className="capitalize">{periodo}</Text>
                                                        <Flex wrap="wrap" gap="small" className="!mt-2">
                                                            {horariosPeriodo.map(horario => (
                                                                <Button
                                                                    key={horario.id}
                                                                    onClick={() => handleSlotClick(quadra, horario)}
                                                                    disabled={horario.statusDisponibilidade !== 'DISPONIVEL'}
                                                                    className="!h-auto !flex !flex-col !px-2 !py-1 !gap-1 hover:!text-green-600"
                                                                >
                                                                    <Text
                                                                        className="!font-semibold !leading-tight"
                                                                        style={{ color: "inherit" }}
                                                                    >
                                                                        {horario.horarioInicio} às {horario.horarioFim}
                                                                    </Text>
                                                                    <Text
                                                                        type="secondary"
                                                                        className="!text-xs">
                                                                        {horario.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                    </Text>
                                                                </Button>
                                                            ))}
                                                        </Flex>
                                                    </div>
                                                )
                                            })}
                                            {horariosDaQuadra.length === 0 && !loadingHorarios && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum horário disponível." />}
                                        </div>
                                    </Flex>
                                </Card>
                            )
                        })}
                    </Flex>
                </Spin>
            ) : (
                <Empty description="Selecione uma data para ver os horários disponíveis." className="py-10" />
            )}

            <Modal
                title={<Title level={4} className="!m-0">Novo Agendamento</Title>}
                open={isModalOpen}
                onCancel={handleModalCancel}
                footer={null}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
                    <Card size="small" className="bg-gray-50 border-gray-200">
                        <Descriptions title="Resumo da Reserva" column={1}>
                            <Descriptions.Item label="Quadra">{selectedSlot?.quadra.nomeQuadra}</Descriptions.Item>
                            <Descriptions.Item label="Data">{capitalizeFirstLetter(selectedSlot?.data.format('dddd, DD [de] MMMM') || '')}</Descriptions.Item>
                            <Descriptions.Item label="Horário">{selectedSlot?.horario.horarioInicio} - {selectedSlot?.horario.horarioFim}</Descriptions.Item>
                            <Descriptions.Item label="Valor">
                                <Text strong className="text-green-600">{selectedSlot?.horario.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Divider />

                    <Title level={5}>Detalhes da Partida</Title>
                    {selectedSlot && selectedSlot.quadra.tipoQuadra.length > 1 && (
                        <Form.Item name="esporte" label="Qual esporte será jogado?" rules={[{ required: true, message: 'Selecione o esporte!' }]}>
                            <Select placeholder="Selecione o esporte">
                                {selectedSlot.quadra.tipoQuadra.map(tipo => (
                                    <Select.Option key={tipo} value={tipo}>{formatarEsporte(tipo)}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    <Title level={5} className="mt-4">Cliente</Title>
                    {selectedAthlete ? (
                        <Card size="small" className="bg-gray-50">
                            <Flex justify="space-between" align="center">
                                <Flex align="center" gap="middle">
                                    <Avatar src={selectedAthlete.urlFoto} icon={<UserOutlined />} />
                                    <Flex vertical>
                                        <Text strong>{selectedAthlete.nome}</Text>
                                        <Text type="secondary">{selectedAthlete.telefone}</Text>
                                    </Flex>
                                </Flex>
                                <Button type="link" danger onClick={() => {
                                    setSelectedAthlete(null);
                                    form.setFieldsValue({ 'atletaSearch': '' });
                                }}>Trocar</Button>
                            </Flex>
                        </Card>
                    ) : (
                        <>
                            <Form.Item name="atletaSearch" label="Buscar atleta por nome ou telefone" hidden={isAddingNewAthlete}>
                                <AutoComplete options={searchResults} onSearch={handleAthleteSearch} onSelect={(_, option) => setSelectedAthlete(option.atleta)} placeholder="Digite para buscar..." notFoundContent={isSearching ? <Flex justify="center" className="py-2"><Spin size="small" /></Flex> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum atleta encontrado" />} />
                            </Form.Item>
                            {!isAddingNewAthlete && <Button type="dashed" icon={<PlusOutlined />} onClick={() => setIsAddingNewAthlete(true)} block>Cadastrar novo atleta</Button>}
                            {isAddingNewAthlete && (
                                <Card
                                    size="small"
                                    title="Cadastrar Novo Atleta"
                                    extra={
                                        <Button
                                            type='text'
                                            shape='circle'
                                            icon={<CloseOutlined />}
                                            onClick={() => setIsAddingNewAthlete(false)}
                                        />
                                    }
                                >
                                    <Form.Item
                                        name="novoAtletaNome"
                                        label="Nome do Atleta"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'O nome é obrigatório'
                                            },
                                            {
                                                min: 3,
                                                message: 'O nome deve ter no mínimo 3 caracteres.'
                                            },
                                            {
                                                validator: (_, value) => {
                                                    // Se o valor estiver vazio, a regra 'required' já cuida disso
                                                    if (!value) return Promise.resolve();

                                                    // Verifica se há números no nome
                                                    if (/\d/.test(value)) {
                                                        return Promise.reject(new Error('O nome não pode conter números.'));
                                                    }

                                                    // Verifica se há caracteres especiais (permite letras, espaços e acentos comuns)
                                                    if (!/^[a-zA-ZÀ-ú\s]+$/.test(value)) {
                                                        return Promise.reject(new Error('O nome não pode conter caracteres especiais.'));
                                                    }

                                                    // Se passou em todas as validações
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}
                                    >
                                        <Input placeholder="João da Silva" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Telefone (WhatsApp)"
                                        name="novoAtletaTelefone"
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
                                    >
                                        <Input
                                            placeholder="(99) 99999-9999"
                                            onChange={(e) => {
                                                form.setFieldsValue({ novoAtletaTelefone: formatarTelefone(e.target.value) });
                                            }}
                                        />
                                    </Form.Item>
                                </Card>
                            )}
                        </>
                    )}
                    <Divider />

                    <Flex justify="end" gap="middle" className="mt-8">
                        <Button onClick={handleModalCancel}>Cancelar</Button>
                        <Button type="primary" htmlType="submit">Confirmar Agendamento</Button>
                    </Flex>
                </Form>
            </Modal>
        </Content>
    );
}

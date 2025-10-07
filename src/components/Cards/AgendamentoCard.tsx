"use client";

import React, { useEffect, useState } from 'react';
import {
    PictureOutlined,
    UserAddOutlined,
    DeleteOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined
} from '@ant-design/icons';
import {
    App,
    Avatar,
    Button,
    Card,
    Divider,
    Flex,
    Popconfirm,
    Tag,
    Badge,
    Typography,
    Rate,
    Form
} from 'antd';
import ModalSolicitacoesEntrada from '../Modais/ModalSolicitacoesEntrada';
import { type SolicitacaoJogoAberto, listarSolicitacoesJogoAbertoMe, aceitarOuRecusarEntrada } from '@/app/api/entities/jogosAbertos';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';
import { TipoQuadra } from '@/app/api/entities/quadra';
import TextArea from 'antd/es/input/TextArea';

const { Text, Title } = Typography;

export type AgendamentoCardData = {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    valor: number;
    esporte: TipoQuadra;
    status: "pendente" | "aceito" | "pago" | "cancelado" | "ausente" | "solicitado";
    numeroJogadoresNecessarios?: number;
    quadraName: string;
    arenaName: string;
    urlFotoArena?: string;
    fixo: boolean;
    publico: boolean;
    possuiSolicitacoes?: boolean;
    avaliacao: { idAvaliacao: number; nota: number; comentario?: string } | null;
    avaliacaoDispensada: boolean;
    showSolicitationButton?: boolean;
};

type CardProps = {
    readonly agendamento: AgendamentoCardData;
    readonly onCancel: (id: number) => Promise<void>;
    readonly onAvaliacaoSubmit: (idAvaliacao: number, nota: number, comentario?: string) => void;
};

const StatusTag = ({ status }: { status: AgendamentoCardData['status'] }) => {
    const statusMap = {
        pendente: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pendente' },
        aceito: { color: 'success', icon: <CheckCircleOutlined />, text: 'Confirmado' },
        pago: { color: 'success', icon: <CheckCircleOutlined />, text: 'Pago' },
        cancelado: { color: 'error', icon: <CloseCircleOutlined />, text: 'Cancelado' },
        ausente: { color: 'error', icon: <CloseCircleOutlined />, text: 'Ausente' },
        solicitado: { color: 'default', icon: <InfoCircleOutlined />, text: 'Solicitado' },
    };
    const currentStatus = statusMap[status] || statusMap.pendente;
    return <Tag icon={currentStatus.icon} color={currentStatus.color}>{currentStatus.text}</Tag>;
};

const calcularDuracaoHoras = (horarioInicio: string, horarioFim: string): number => {
    try {
        const [horaInicio, minutoInicio] = horarioInicio.split(':').map(Number);
        const [horaFim, minutoFim] = horarioFim.split(':').map(Number);
 
        let totalMinutosInicio = horaInicio * 60 + minutoInicio;
        let totalMinutosFim = horaFim * 60 + minutoFim;
 
        // Se o horário final for menor que o inicial, assume que o agendamento atravessa a meia-noite.
        if (totalMinutosFim < totalMinutosInicio) {
            totalMinutosFim += 24 * 60; // Adiciona 24 horas em minutos
        }
 
        const diferencaEmMinutos = totalMinutosFim - totalMinutosInicio;

        // Retorna a diferença em horas. Ex: 90 min = 1.5h
        return parseFloat((diferencaEmMinutos / 60).toFixed(2));
    } catch (error) {
        console.error("Erro ao calcular duração:", error);
        return 0;
    }
};

export function CardAgendamento({ agendamento, onCancel, onAvaliacaoSubmit }: CardProps) {
    const { message } = App.useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoJogoAberto[]>([]);
    const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(false);

    const valorFormatado = agendamento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const [vagasDisponiveis, setVagasDisponiveis] = useState(agendamento.numeroJogadoresNecessarios || 0);

    const [isAvaliando, setIsAvaliando] = useState(false);
    const [form] = Form.useForm();

    const handleFormSubmit = (values: { nota: number; comentario?: string }) => {
        if (agendamento.avaliacao) {
            onAvaliacaoSubmit(agendamento.avaliacao.idAvaliacao, values.nota, values.comentario);
        }
        setIsAvaliando(false);
        form.resetFields();
    };

    useEffect(() => {
        setVagasDisponiveis(agendamento.numeroJogadoresNecessarios || 0);
    }, [agendamento.numeroJogadoresNecessarios]);

    useEffect(() => {
        if (isAvaliando) {
            form.setFieldsValue({
                nota: agendamento.avaliacao?.nota || 0,
                comentario: agendamento.avaliacao?.comentario || ''
            });
        }
    }, [isAvaliando, agendamento.avaliacao, form]);

    const duracaoHoras = calcularDuracaoHoras(agendamento.startTime, agendamento.endTime);

    const handleConfirmCancel = () => onCancel(agendamento.id);

    const handleOpenModal = async () => {
        setIsModalOpen(true);
        setLoadingSolicitacoes(true);
        try {
            const data = await listarSolicitacoesJogoAbertoMe(agendamento.id);
            setSolicitacoes(data || []);
        } catch (error) {
            console.error("Erro ao buscar solicitações:", error);
            message.error(
                (error && typeof error === 'object' && 'message' in error && typeof (error as Error).message === 'string')
                    ? (error as Error).message
                    : "Erro ao buscar solicitações."
            );
        } finally {
            setLoadingSolicitacoes(false);
        }
    };

    const handleAcceptRequest = async (solicitacaoId: number) => {
        try {
            await aceitarOuRecusarEntrada(solicitacaoId, true);
            message.success("Solicitação aceita!");

            setSolicitacoes(prev => prev.map(s =>
                s.id === solicitacaoId ? { ...s, status: 'ACEITO' } : s
            ));

            setVagasDisponiveis(prevVagas => prevVagas - 1);

        } catch (error) {
            message.error((error as Error)?.message ?? "Falha ao aceitar solicitação.");
            console.error(error);
        }
    };

    const handleDeclineRequest = async (solicitacaoId: number) => {
        try {
            await aceitarOuRecusarEntrada(solicitacaoId, false);
            message.info("Solicitação recusada.");

            setSolicitacoes(prev => prev.map(s =>
                s.id === solicitacaoId ? { ...s, status: 'RECUSADO' } : s
            ));

        } catch (error) {
            message.error((error as Error)?.message ?? "Falha ao recusar solicitação.");
            console.error(error);
        }
    };

    const CardFooter = () => {
        // Se o agendamento já foi avaliado
        if (agendamento.avaliacao) {
            return (
                <Flex justify="space-between" align="center" style={{ padding: '12px 16px' }}>
                    <Text strong>Sua avaliação:</Text>
                    <Flex align="center" gap="small">
                        <Rate disabled defaultValue={agendamento.avaliacao.nota} />
                        <Button type="text" shape="circle" icon={<EditOutlined />} onClick={() => setIsAvaliando(true)} />
                    </Flex>
                </Flex>
            );
        }

        const isActionable = ['pendente', 'aceito', 'pago'].includes(agendamento.status);

        const showButton = agendamento.showSolicitationButton; 

        let jogoTipo: React.ReactNode = null;
        if (!showButton) {
            jogoTipo = agendamento.publico ? (
                <Text type="secondary" strong>Jogo Aberto</Text>
            ) : (
                <Text type="secondary" strong>Jogo Privado</Text>
            );
        }

        if (isActionable) {
            return (
                <Flex justify="space-between" align="center" style={{ padding: '12px 16px' }}>
                    {showButton ? (
                        <Badge dot={agendamento.possuiSolicitacoes}>
                            <Button
                                type='primary'
                                icon={<UserAddOutlined />}
                                onClick={handleOpenModal}
                                ghost
                            >
                                Solicitações
                            </Button>
                        </Badge>
                    ) : (
                        // Se não é para mostrar o botão, mostra o Jogo Aberto/Privado
                        jogoTipo
                    )}

                    {/* Botão de Cancelar visível para PENDENTE/ACEITO/PAGO (se o prazo permitir) */}
                    {agendamento.status !== 'pago' && ( // Exemplo: Permitir cancelar se não foi pago
                        <Popconfirm
                            title="Cancelar Agendamento"
                            description="Você tem certeza que quer cancelar?"
                            onConfirm={handleConfirmCancel}
                            okText="Sim, cancelar" cancelText="Não"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Cancelar
                            </Button>
                        </Popconfirm>
                    )}
                </Flex>
            );
        }

        // Retorna null para o restante (cancelado, ausente, etc.)
        return null;
    };

    return (
        <>
            <Card hoverable style={{ height: '100%' }} styles={{ body: { padding: 0, height: '100%' } }}>
                <Flex vertical justify="space-between" style={{ height: '100%' }}>
                    <div style={{ padding: '16px' }}>
                        <Flex justify="space-between" align="start" gap="middle">
                            <Flex gap="middle">
                                <Avatar shape="square" size={48} src={agendamento.urlFotoArena} icon={<PictureOutlined />} />
                                <Flex vertical>
                                    <Title level={5} style={{ margin: 0 }} ellipsis={{ tooltip: agendamento.arenaName }}>
                                        {agendamento.arenaName}
                                    </Title>
                                    <Text type="secondary">{agendamento.quadraName}</Text>
                                </Flex>
                            </Flex>
                            <StatusTag status={agendamento.status} />
                        </Flex>

                        <Divider style={{ marginTop: 12, marginBottom: 12 }} />

                        <Flex vertical gap={8}>
                            <Flex align="center" gap="small">
                                <CalendarOutlined />
                                <Text strong>
                                    {(() => {
                                        const dateStr = new Date(agendamento.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
                                        return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
                                    })()}
                                </Text>
                            </Flex>
                            <Flex align="center" gap="small">
                                <ClockCircleOutlined />
                                <Text>{`${agendamento.startTime} às ${agendamento.endTime} (${duracaoHoras}h)`}</Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                                <Text strong className="!text-green-600 text-base">{formatarEsporte(agendamento.esporte)}</Text>
                                <Title
                                    level={4}
                                    style={{ margin: 0 }}
                                    className={`${agendamento.status === "cancelado" || agendamento.status === "ausente" ? "line-through !text-red-500" : ""} !text-green-600`}
                                >
                                    {valorFormatado}
                                </Title>
                            </Flex>
                        </Flex>
                    </div>

                    {isAvaliando && (
                        <div className="p-4 border-t">
                            <Form
                                key={agendamento.avaliacao?.idAvaliacao}
                                form={form}
                                onFinish={handleFormSubmit}
                            >
                                <Form.Item name="nota" rules={[{ required: true, message: 'Por favor, selecione uma nota!' }]}>
                                    <Rate />
                                </Form.Item>
                                <Form.Item name="comentario">
                                    <TextArea rows={3} placeholder="Deixe um comentário (opcional)" />
                                </Form.Item>
                                <Flex justify="end" gap="small">
                                    <Button onClick={() => setIsAvaliando(false)}>Cancelar</Button>
                                    <Button type="primary" htmlType="submit">Enviar</Button>
                                </Flex>
                            </Form>
                        </div>
                    )}

                    <CardFooter />
                </Flex>
            </Card>

            <ModalSolicitacoesEntrada
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                loading={loadingSolicitacoes}
                solicitacoes={solicitacoes}
                vagasDisponiveis={vagasDisponiveis}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
            />
        </>
    );
}
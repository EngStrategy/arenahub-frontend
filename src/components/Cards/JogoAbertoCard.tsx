import React, { useState } from 'react';
import { Button, App, Popconfirm, Card, Flex, Avatar, Typography, Tag, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, PictureOutlined, UserAddOutlined } from '@ant-design/icons';
import { formatarData } from '@/context/functions/formatarData';
import { JogosAbertos, solicitarEntrada } from '@/app/api/entities/jogosAbertos';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatarEsporte } from '@/context/functions/mapeamentoEsportes';

const { Text, Title } = Typography;

type JogoAbertoCardProps = {
    readonly jogoAberto: Partial<JogosAbertos> & {
        solicitacaoId?: number,
        agendamentoId: number,
        nomeArena: string,
        esporte: string,
        data: string,
        horarioInicio: string,
        horarioFim: string,
        nomeQuadra: string,
        urlFotoQuadra?: string,
        status?: "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO";
    };
};

const calcularDuracaoHoras = (horarioInicio: string, horarioFim: string): number => {
    try {
        const [horaInicio, minutoInicio] = horarioInicio.split(':').map(Number);
        const [horaFim, minutoFim] = horarioFim.split(':').map(Number);

        const totalMinutosInicio = horaInicio * 60 + minutoInicio;
        const totalMinutosFim = horaFim * 60 + minutoFim;

        const diferencaEmMinutos = totalMinutosFim - totalMinutosInicio;

        return diferencaEmMinutos / 60;
    } catch (error) {
        console.error("Erro ao calcular duração:", error);
        return 0;
    }
};

export function JogoAbertoCard({ jogoAberto }: JogoAbertoCardProps) {
    const { notification } = App.useApp();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    const duracaoHoras = calcularDuracaoHoras(jogoAberto.horarioInicio, jogoAberto.horarioFim);

    const handleSolicitarEntrada = async () => {
        setLoading(true);
        try {
            await solicitarEntrada(jogoAberto.agendamentoId);
            notification.success({
                message: 'Solicitação Enviada!',
                description: `Seu pedido para o jogo de ${jogoAberto.esporte} foi enviado com sucesso.`,
                duration: 5,
            });

            router.push('/perfil/atleta/agendamentos');
        } catch (error) {
            console.error("Erro ao solicitar entrada:", error);
            notification.error({
                message: 'Falha na Solicitação',
                description: (error as Error)?.message || 'Não foi possível solicitar a entrada neste jogo.',
                duration: 5,
            });
        } finally {
            setLoading(false);
        }
    };

    const StatusTag = () => {
        if (!jogoAberto.status) return null;

        const statusMap = {
            PENDENTE: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pendente' },
            ACEITO: { color: 'success', icon: <CheckCircleOutlined />, text: 'Aceito' },
            RECUSADO: { color: 'error', icon: <CloseCircleOutlined />, text: 'Recusado' },
            CANCELADO: { color: 'error', icon: <CloseCircleOutlined />, text: 'Cancelado' },
        };

        const currentStatus = statusMap[jogoAberto.status];

        return <Tag icon={currentStatus.icon} color={currentStatus.color}>{currentStatus.text}</Tag>;
    };


    return (
        <Card
            hoverable
            style={{ height: '100%' }}
            styles={{ body: { padding: 16, height: "100%" } }}
        >
            <Flex vertical justify="space-between" className="h-full">

                <Flex vertical>
                    <Flex gap="middle" align="start">
                        <Avatar shape="square" size={64} src={jogoAberto.urlFotoArena} icon={<PictureOutlined />} />
                        <Flex vertical>
                            <Title level={5} style={{ margin: 0 }}>{jogoAberto.nomeArena}</Title>
                            <Text type="secondary">{jogoAberto.nomeQuadra}</Text>
                        </Flex>
                    </Flex>

                    <Divider style={{ margin: '12px 0' }} />

                    <Flex vertical gap={4}>
                        <Text strong>{formatarData(jogoAberto.data)}</Text>
                        <Text type="secondary">
                            {`${jogoAberto.horarioInicio} às ${jogoAberto.horarioFim} (${duracaoHoras}h)`}
                        </Text>
                        <Text strong className="!text-green-600">{formatarEsporte(jogoAberto.esporte)}</Text>
                    </Flex>
                </Flex>

                <Flex justify="space-between" align="center" className="mt-4">
                    {typeof jogoAberto.vagasDisponiveis === 'number' ? (
                        <Tag color="blue" style={{ fontWeight: 'bold' }}>
                            {jogoAberto.vagasDisponiveis} vagas
                        </Tag>
                    ) : <div />
                    }

                    {jogoAberto.status ? <StatusTag /> : (
                        <Popconfirm
                            title="Confirmar solicitação?"
                            description="Deseja solicitar entrada neste jogo?"
                            okText='Confirmar'
                            cancelText="Cancelar"
                            cancelButtonProps={{ style: { border: 0 } }}
                            onConfirm={handleSolicitarEntrada}
                            placement="topRight"
                            >
                            <Button
                                type="primary"
                                ghost
                                icon={<UserAddOutlined />}
                                className={`${session?.user?.role !== "ATLETA" || status !== 'authenticated' || loading ? '' : 'hover:!bg-green-500 hover:!text-green-50 hover:!border-green-500'}`}
                                loading={loading}
                                disabled={session?.user?.role !== "ATLETA" || status !== 'authenticated' || loading}
                            >
                                Entrar
                            </Button>
                        </Popconfirm>
                    )}
                </Flex>
            </Flex>
        </Card>
    )
}
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Typography, Button, App, Result, Flex, Input, Tooltip, Spin, Form } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { getAgendamentoStatus, informarPagadorPix } from '@/app/api/entities/agendamento';
import type { PixPagamentoResponse } from '@/app/api/entities/agendamento';

const { Title, Paragraph, Text } = Typography;

interface ModalPixProps {
    open: boolean;
    onClose: () => void;
    pixData: PixPagamentoResponse | null;
    onPaymentSuccess: () => void;
}

const tipoChavePixLabel: Record<string, string> = {
    CPF: 'CPF',
    CNPJ: 'CNPJ',
    EMAIL: 'E-mail',
    TELEFONE: 'Telefone',
    ALEATORIA: 'Chave aleatória',
};

const useCountdown = (expirationTime: string | undefined, open: boolean) => {
    const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!expirationTime || !open) return;

        const updateTimeLeft = () => {
            const now = new Date().getTime();
            const expiration = new Date(expirationTime).getTime();
            const distance = expiration - now;

            if (distance <= 0) {
                setTimeLeft({ minutes: 0, seconds: 0 });
                return false;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft({ minutes, seconds });
            return true;
        };

        if (!updateTimeLeft()) {
            return;
        }

        const interval = setInterval(() => {
            if (!updateTimeLeft()) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expirationTime, open]);

    return timeLeft;
};

export const ModalPix: React.FC<ModalPixProps> = ({ open, onClose, pixData, onPaymentSuccess }) => {
    const { message } = App.useApp();
    const [isCopied, setIsCopied] = useState(false);
    const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
    const [nomePagadorInformado, setNomePagadorInformado] = useState(false);
    const [nomeCompletoPagador, setNomeCompletoPagador] = useState('');
    const [saving, setSaving] = useState(false);

    const timeLeft = useCountdown(pixData?.expiraEm, open);
    const hasExpired = !pagamentoConfirmado && timeLeft.minutes === 0 && timeLeft.seconds === 0;
    const chavePix = useMemo(() => (pixData?.copiaECola || '').trim(), [pixData?.copiaECola]);

    useEffect(() => {
        if (!open) {
            setIsCopied(false);
            setPagamentoConfirmado(false);
            setNomePagadorInformado(false);
            setNomeCompletoPagador('');
            setSaving(false);
            return;
        }

        setPagamentoConfirmado(Boolean(pixData?.pagamentoConfirmadoGateway));
    }, [open, pixData?.pagamentoConfirmadoGateway]);

    useEffect(() => {
        if (!open || !pixData || pagamentoConfirmado || hasExpired) return;

        const interval = setInterval(async () => {
            try {
                const status = await getAgendamentoStatus(pixData.agendamentoId);
                setPagamentoConfirmado(Boolean(status.pagamentoConfirmadoGateway));
                setNomePagadorInformado(Boolean(status.nomePagadorInformado));
            } catch (error) {
                console.error("Erro ao verificar status do pagamento:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [open, pixData, pagamentoConfirmado, hasExpired]);

    useEffect(() => {
        if (!open || !pixData || !pagamentoConfirmado || nomePagadorInformado) return;

        const syncStatus = async () => {
            try {
                const status = await getAgendamentoStatus(pixData.agendamentoId);
                setNomePagadorInformado(Boolean(status.nomePagadorInformado));
            } catch (error) {
                console.error("Erro ao sincronizar status do pagador PIX:", error);
            }
        };

        syncStatus();
    }, [open, pixData, pagamentoConfirmado, nomePagadorInformado]);

    const handleCopy = async () => {
        if (!chavePix) return;
        await navigator.clipboard.writeText(chavePix);
        setIsCopied(true);
        message.success("Chave Pix copiada.");
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleInformarPagador = async () => {
        if (!pixData || !nomeCompletoPagador.trim()) return;

        setSaving(true);
        try {
            await informarPagadorPix(pixData.agendamentoId, nomeCompletoPagador.trim());
            setNomePagadorInformado(true);
            message.success("Nome do pagador enviado para a arena.");
            setTimeout(() => {
                onPaymentSuccess();
            }, 1200);
        } catch (error) {
            message.error((error as Error).message || 'Não foi possível salvar o nome do pagador.');
        } finally {
            setSaving(false);
        }
    };

    const renderContent = () => {
        if (nomePagadorInformado) {
            return (
                <Result
                    status="success"
                    title="Pagamento recebido"
                    subTitle="O nome do pagador foi enviado. Agora a arena fará a conferência manual antes de marcar o agendamento como pago."
                />
            );
        }

        if (pagamentoConfirmado) {
            return (
                <Flex vertical gap="middle">
                    <Result
                        status="success"
                        title="Pagamento confirmado pelo provedor"
                        subTitle="Informe agora o nome completo de quem realizou o PIX para liberar a revisão manual da arena."
                    />

                    <Form layout="vertical">
                        <Form.Item
                            label="Nome completo de quem realizou o pagamento"
                            required
                        >
                            <Input
                                value={nomeCompletoPagador}
                                onChange={(e) => setNomeCompletoPagador(e.target.value)}
                                placeholder="Ex.: Maria Aparecida da Silva"
                                maxLength={120}
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            block
                            onClick={handleInformarPagador}
                            loading={saving}
                            disabled={!nomeCompletoPagador.trim()}
                        >
                            Enviar nome do pagador
                        </Button>
                    </Form>
                </Flex>
            );
        }

        if (hasExpired) {
            return <Result status="warning" title="Prazo do pagamento expirado" subTitle="O bloqueio do horário venceu porque não houve confirmação do pagamento a tempo." />;
        }

        return (
            <Flex vertical gap="middle">
                <Title level={4} className="!mb-0">Pague com pix para confirmar o agendamento</Title>
                <Paragraph className="!mb-0">
                    O horário fica reservado por 30 minutos enquanto aguardamos a confirmação do pagamento.
                </Paragraph>

                <div className="rounded-lg border border-gray-200 p-4">
                    <Text type="secondary">Tipo de chave</Text>
                    <div className="font-semibold">
                        {pixData?.tipoChavePix ? tipoChavePixLabel[pixData.tipoChavePix] : 'PIX'}
                    </div>

                    <Text type="secondary" className="!mt-3 !block">Chave Pix da arena</Text>
                    <Input.Group compact>
                        <Input value={chavePix} readOnly style={{ width: 'calc(100% - 112px)' }} />
                        <Tooltip title={isCopied ? "Copiado!" : "Copiar chave"}>
                            <Button
                                icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
                                onClick={handleCopy}
                                style={{ width: 112 }}
                            >
                                {isCopied ? "Copiado" : "Copiar"}
                            </Button>
                        </Tooltip>
                    </Input.Group>
                </div>

                <Paragraph strong className="!mb-0">
                    Expira em: {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </Paragraph>
                <Paragraph className="!mb-0">
                    Após o webhook confirmar o pagamento, este modal liberará o campo para informar o nome completo de quem pagou.
                </Paragraph>

                <Flex align="center" gap="small">
                    <Spin size="small" />
                    <Text>Aguardando confirmação do pagamento...</Text>
                </Flex>
            </Flex>
        );
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            closable={!saving}
            maskClosable={!saving}
            destroyOnClose
        >
            {renderContent()}
        </Modal>
    );
};

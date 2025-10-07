'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Spin, Typography, Button, App, Result, Flex, Input, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { getAgendamentoStatus } from '@/app/api/entities/agendamento';
import type { PixPagamentoResponse } from '@/app/api/entities/agendamento';

const { Title, Paragraph, Text } = Typography;

interface ModalPixProps {
    open: boolean;
    onClose: () => void;
    pixData: PixPagamentoResponse | null;
    onPaymentSuccess: () => void;
}

const useCountdown = (expirationTime: string | undefined) => {
    const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!expirationTime) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expiration = new Date(expirationTime).getTime();
            const distance = expiration - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ minutes: 0, seconds: 0 });
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft({ minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [expirationTime]);

    return timeLeft;
};

export const ModalPix: React.FC<ModalPixProps> = ({ open, onClose, pixData, onPaymentSuccess }) => {
    const { message } = App.useApp();
    const [isCopied, setIsCopied] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    const timeLeft = useCountdown(pixData?.expiraEm);
    const hasExpired = timeLeft.minutes === 0 && timeLeft.seconds === 0;

    let rawPixCode = pixData?.copiaECola || '';

    rawPixCode = rawPixCode.replace(/^(http|https):\/\//, '');

    // Efeito para verificar o status do pagamento (polling)
    useEffect(() => {
        if (!open || !pixData || isPaid || hasExpired) return;

        const interval = setInterval(async () => {
            try {
                const { status } = await getAgendamentoStatus(pixData.agendamentoId);
                if (status === 'PAGO') {
                    setIsPaid(true);
                    clearInterval(interval);
                    setTimeout(() => {
                        onPaymentSuccess();
                    }, 2000); // Espera 2 segundos na tela de sucesso antes de fechar
                }
            } catch (error) {
                console.error("Erro ao verificar status do pagamento:", error);
            }
        }, 5000); // Verifica a cada 5 segundos

        return () => clearInterval(interval);
    }, [open, pixData, onPaymentSuccess, isPaid, hasExpired]);


    const handleCopy = () => {
        if (rawPixCode) {
            navigator.clipboard.writeText(rawPixCode);
            setIsCopied(true);
            message.success("Código Pix copiado!");
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const renderContent = () => {
        if (isPaid) {
            return <Result status="success" title="Pagamento Confirmado!" subTitle="Seu agendamento foi efetuado com sucesso." />;
        }
        if (hasExpired) {
            return <Result status="warning" title="Pix Expirado" subTitle="O tempo para pagamento acabou. Por favor, gere um novo Pix para continuar." />;
        }

        const qrCodeValue = pixData?.qrCodeData;
        const isBase64Image = qrCodeValue && qrCodeValue.startsWith('iVBORw');
        return (
            <Flex vertical align="center" gap="middle">
                <Title level={4}>Pague com Pix para confirmar</Title>

                {isBase64Image ? (
                    // Se for imagem Base64 (encodedImage)
                    <img
                        src={`data:image/png;base64,${qrCodeValue}`}
                        alt="QR Code Pix"
                        width={200}
                        height={200}
                        style={{ border: '1px solid #ddd' }}
                    />
                ) : (
                    <QRCodeSVG value={rawPixCode} size={200} />
                )}

                <Paragraph strong>Expira em: {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</Paragraph>
                <Paragraph>Abra o app do seu banco e escaneie o código ou use o "Copia e Cola".</Paragraph>

                <Input.Group compact style={{ width: '100%' }}>
                    <Input
                        style={{ width: 'calc(100% - 100px)' }}
                        value={rawPixCode}
                        readOnly
                    />
                    <Tooltip title={isCopied ? "Copiado!" : "Copiar código"}>
                        <Button
                            icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
                            onClick={handleCopy}
                            style={{ width: '100px' }}
                        >
                            {isCopied ? "Copiado" : "Copiar"}
                        </Button>
                    </Tooltip>
                </Input.Group>

                <Spin tip="Aguardando pagamento..."  />
            </Flex>
        );
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            closable={!isPaid}
            maskClosable={!isPaid}
        >
            {renderContent()}
        </Modal>
    );
};
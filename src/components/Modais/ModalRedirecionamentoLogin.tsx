"use client";

import { useState, useEffect } from 'react';
import { Modal, Typography, Space } from 'antd';
import { ButtonCancelar } from '../Buttons/ButtonCancelar';
import { ButtonPrimary } from '../Buttons/ButtonPrimary';
import { useAuth } from '@/context/hooks/use-auth';

interface LoginPromptModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    countdownSeconds?: number;
}

export const ModalRedirecionamentoLogin = ({
    open,
    onClose,
    onConfirm,
    countdownSeconds = 5,
}: LoginPromptModalProps) => {
    const { isUserArena, isAuthenticated } = useAuth();
    const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

    useEffect(() => {
        if (open) {
            setSecondsLeft(countdownSeconds);
        }
    }, [open, countdownSeconds]);

    useEffect(() => {
        if (!isAuthenticated) {
            if (open && secondsLeft > 0) {
                const timerId = setInterval(() => {
                    setSecondsLeft(prev => prev - 1);
                }, 1000);

                return () => clearInterval(timerId);
            } else if (open && secondsLeft === 0) {
                onConfirm();
            }
        }
    }, [open, secondsLeft, onConfirm, isAuthenticated]);

    let redirectText = '';
    if (!isAuthenticated) {
        redirectText = `Você será redirecionado automaticamente em ${secondsLeft} segundo${secondsLeft !== 1 ? 's' : ''}...`;
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={<Typography.Title className='!text-center' level={4}>
                {
                    !isAuthenticated ? 'Login Necessário' :
                        (
                            isUserArena && 'Acesso Negado'
                        )
                }
            </Typography.Title>
            }
            footer={
                !isAuthenticated
                    ? [
                        <ButtonCancelar text='Cancelar' key="cancelar" onClick={onClose} />,
                        <ButtonPrimary text="Ir para o Login" key="login" type="primary" onClick={onConfirm} />,
                    ]
                    : null
            }
            centered
        >
            <Space direction="vertical" size="small" className='!mb-2'>
                <Typography.Text>
                    {
                        !isAuthenticated ? 'Você precisa estar conectado para realizar agendamentos.' :
                            (
                                isUserArena && 'Para realizar um agendamento, você precisa estar conectado como ATLETA.'
                            )
                    }
                </Typography.Text>
                <Typography.Text type="secondary">
                    {redirectText}

                </Typography.Text>
            </Space>
        </Modal>
    );
};
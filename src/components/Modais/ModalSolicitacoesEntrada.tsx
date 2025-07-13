import React, { useState } from 'react';
import { Modal, List, Button, Avatar, Typography, Empty, Skeleton } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { type Solicitacao } from '@/app/api/entities/solicitacao';

const { Title, Text } = Typography;

type ModalSolicitacoesProps = {
    open: boolean;
    loading: boolean;
    vagasDisponiveis: number;
    solicitacoes: Solicitacao[];
    onClose: () => void;
    onAccept: (solicitacaoId: number) => Promise<void>;
    onDecline: (solicitacaoId: number) => Promise<void>;
};

const SolicitacaoItemSkeleton = () => (
    <div className="flex w-full items-center gap-4 border-b border-gray-200 p-4 last:border-b-0">
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-5 w-2/5 rounded-md bg-gray-200 animate-pulse"></div>
    </div>
);

export default function ModalSolicitacoesEntrada({
    open,
    loading,
    vagasDisponiveis,
    solicitacoes,
    onClose,
    onAccept,
    onDecline,
}: Readonly<ModalSolicitacoesProps>) {

    const [loadingActionId, setLoadingActionId] = useState<number | null>(null);

    const handleAccept = async (id: number) => {
        setLoadingActionId(id);
        try {
            await onAccept(id);
        } finally {
            setLoadingActionId(null);
        }
    };

    const handleDecline = async (id: number) => {
        setLoadingActionId(id);
        try {
            await onDecline(id);
        } finally {
            setLoadingActionId(null);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <List
                    itemLayout="horizontal"
                    dataSource={Array.from({ length: 3 }, (_, i) => ({ id: i }))}
                    renderItem={(item) => <SolicitacaoItemSkeleton key={item.id} />}
                />
            );
        }

        if (solicitacoes.length === 0) {
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Nenhuma solicitação pendente."
                    className="py-8"
                />
            );
        }

        return (
            <List
                className="pr-2"
                itemLayout="horizontal"
                dataSource={solicitacoes}
                renderItem={(solicitacao) => (
                    <List.Item
                        actions={[
                            <Button
                                key="decline"
                                type="text"
                                danger
                                shape="circle"
                                icon={<CloseOutlined />}
                                loading={loadingActionId === solicitacao.id}
                                onClick={() => handleDecline(solicitacao.id)}
                            />,
                            <Button
                                key="accept"
                                type="primary"
                                shape="circle"
                                icon={<CheckOutlined />}
                                loading={loadingActionId === solicitacao.id}
                                onClick={() => handleAccept(solicitacao.id)}
                                disabled={vagasDisponiveis <= 0}
                            />,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar size="large" src={solicitacao.atleta.urlFotoPerfil} icon={<UserOutlined />} />}
                            title={<Typography.Text className="font-semibold">{solicitacao.atleta.nome}</Typography.Text>}
                        />
                    </List.Item>
                )}
            />
        );
    };

    return (
        <Modal
            title={
                <div>
                    <Title level={4} style={{ margin: 0 }}>Solicitações para Entrar</Title>
                    <Text type="secondary">{`${vagasDisponiveis} vagas disponíveis`}</Text>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            centered
        >
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
                {renderContent()}
            </div>
        </Modal>
    );
}
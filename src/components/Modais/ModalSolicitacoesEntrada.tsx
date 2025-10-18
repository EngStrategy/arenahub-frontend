import React, { useState } from 'react';
import { Modal, List, Button, Avatar, Typography, Empty, Tag, Popconfirm } from 'antd';
import { UserOutlined, CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { type SolicitacaoJogoAberto } from '@/app/api/entities/jogosAbertos';
import { GiOldKing } from 'react-icons/gi';
import { MdOutlineDone } from 'react-icons/md';

const { Title, Text } = Typography;

type ModalSolicitacoesProps = {
    open: boolean;
    loading: boolean;
    vagasDisponiveis: number;
    solicitacoes: SolicitacaoJogoAberto[];
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

const StatusTag = ({ status }: { status: 'ACEITO' | 'RECUSADO' }) => {
    const statusInfo = status === 'ACEITO'
        ? { color: 'success', icon: <CheckOutlined />, text: 'Aceito' }
        : { color: 'error', icon: <CloseOutlined />, text: 'Recusado' };

    return <Tag icon={statusInfo.icon} color={statusInfo.color}>{statusInfo.text}</Tag>;
};

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
                    description="Nenhuma solicitação ainda."
                    className="py-8"
                />
            );
        }

        return (
            <List
                className="pr-2"
                itemLayout="horizontal"
                dataSource={solicitacoes}
                renderItem={(solicitacao) => {
                    const actions = solicitacao.status === 'PENDENTE'
                        ? [
                            <Popconfirm
                                key="decline-popconfirm"
                                title="Recusar solicitação"
                                description="Tem certeza de que deseja recusar esta solicitação?"
                                onConfirm={() => handleDecline(solicitacao.id)}
                                onCancel={() => setLoadingActionId(null)}
                                okText="Sim"
                                cancelText="Não"
                                icon={<ExclamationCircleOutlined />}
                            >
                                <Button
                                    key="decline"
                                    type="text"
                                    danger
                                    shape="circle"
                                    icon={<CloseOutlined />}
                                    loading={loadingActionId === solicitacao.id}
                                />
                            </Popconfirm>,
                            <Popconfirm
                                key="accept-popconfirm"
                                title="Aprovar solicitação"
                                description="Tem certeza de que deseja aprovar esta solicitação?"
                                onConfirm={() => handleAccept(solicitacao.id)}
                                onCancel={() => setLoadingActionId(null)}
                                okText="Sim"
                                cancelText="Não"
                                icon={<CheckOutlined className='!text-green-600'/>}
                            >
                                <Button
                                    key="accept"
                                    type="primary"
                                    shape="circle"
                                    icon={<CheckOutlined />}
                                    loading={loadingActionId === solicitacao.id}
                                    disabled={vagasDisponiveis <= 0 && loadingActionId !== solicitacao.id}
                                />
                            </Popconfirm>
                        ]
                        : [<StatusTag key="status" status={solicitacao.status} />];

                    return (
                        <List.Item actions={actions}>
                            <List.Item.Meta
                                avatar={<Avatar size="large" src={solicitacao.fotoSolicitante} icon={<UserOutlined />} />}
                                title={<Typography.Text className="font-semibold">{solicitacao.nomeSolicitante}</Typography.Text>}
                                description={<Typography.Text type="secondary">{solicitacao.telefoneSolicitante}</Typography.Text>}
                            />
                        </List.Item>
                    );
                }}
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
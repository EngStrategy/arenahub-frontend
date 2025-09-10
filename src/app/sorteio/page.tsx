'use client';

import {
    Layout,
    Card,
    Typography,
    Form,
    Input,
    Button,
    List,
    Avatar,
    Flex,
    Divider,
    App,
    InputNumber,
    Row,
    Col,
    Empty,
    Rate,
    Tag
} from 'antd';
import { UserOutlined, DeleteOutlined, TeamOutlined, ShakeOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { useRef, useState } from 'react';

const { Content } = Layout;
const { Title, Text } = Typography;

type Jogador = {
    id: number;
    nome: string;
    urlFoto?: string;
    nivel: number;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.5, // Atraso entre o aparecimento de cada card de time
        },
    },
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};

const playerListVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.8, // Atraso entre o aparecimento de cada jogador na lista
        },
    },
}

const playerItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
};
// --- Fim das Variantes de Animação ---


export default function SorteadorDeTimesPage() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();
    const resultsRef = useRef<HTMLDivElement>(null); // Ref para a seção de resultados

    const [jogadores, setJogadores] = useState<Jogador[]>([]);
    const [numeroDeTimes, setNumeroDeTimes] = useState<number>(2);
    const [timesSorteados, setTimesSorteados] = useState<Jogador[][]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdicionarJogador = (values: { nome: string; nivel: number }) => {
        if (!values.nome) return;
        const novoJogador: Jogador = {
            id: Date.now(),
            nome: values.nome,
            nivel: values.nivel,
            urlFoto: `https://api.dicebear.com/7.x/miniavs/svg?seed=${values.nome}`
        };

        setJogadores(prev => [...prev, novoJogador]);
        form.resetFields();
    };

    const handleRemoverJogador = (id: number) => {
        setJogadores(prev => prev.filter(j => j.id !== id));
    };

    const handleSortearTimes = () => {
        if (jogadores.length < numeroDeTimes) {
            message.error(`São necessários pelo menos ${numeroDeTimes} jogadores para formar ${numeroDeTimes} times.`);
            return;
        }

        setIsSubmitting(true);
        setTimesSorteados([]); // Limpa os resultados antigos para reativar a animação

        setTimeout(() => {
            const jogadoresOrdenados = [...jogadores].sort((a, b) => b.nivel - a.nivel);
            const novosTimes: Jogador[][] = Array.from({ length: numeroDeTimes }, () => []);
            const forcaDosTimes: number[] = new Array(numeroDeTimes).fill(0);

            jogadoresOrdenados.forEach(jogador => {
                const timeComMenorForcaIndex = forcaDosTimes.indexOf(Math.min(...forcaDosTimes));
                novosTimes[timeComMenorForcaIndex].push(jogador);
                forcaDosTimes[timeComMenorForcaIndex] += jogador.nivel;
            });

            setTimesSorteados(novosTimes);
            setIsSubmitting(false);
            message.success('Times balanceados com sucesso!');

            // Rola suavemente para a seção de resultados após o sorteio
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

        }, 1000); // Aumentado para 1s para dar mais "suspense"
    };

    return (
        <Content className={`!px-4 sm:!px-10 lg:!px-40 !py-8 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            <div className="max-w-4xl mx-auto">
                <Title level={2} className="!text-center">Sorteador de Times</Title>
                <Text type="secondary" className="block text-center mb-8">
                    Adicione os jogadores com seus respectivos níveis para formar times equilibrados.
                </Text>

                <Row gutter={[32, 32]}>
                    <Col xs={24} md={12}>
                        <Card title="1. Adicionar Jogadores">
                            <Form form={form} layout="vertical" onFinish={handleAdicionarJogador} initialValues={{ nivel: 3 }}>
                                <Form.Item name="nome" rules={[{ required: true, message: 'O nome do jogador é obrigatório' }]}>
                                    <Input placeholder="Nome do Jogador" size="large" />
                                </Form.Item>
                                <Form.Item name="nivel" label="Nível do Jogador" rules={[{ required: true, message: 'O nível é obrigatório' }]}>
                                    <Rate count={5} />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" block size="large">
                                    Adicionar Jogador
                                </Button>
                            </Form>
                            <Divider />
                            <Title level={5}>Jogadores na Lista ({jogadores.length})</Title>
                            <List
                                itemLayout="horizontal"
                                dataSource={jogadores}
                                renderItem={(jogador) => (
                                    <List.Item
                                        actions={[<Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoverJogador(jogador.id)} />]}
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar src={jogador.urlFoto} icon={<UserOutlined />} />}
                                            title={
                                                <Flex align="center" gap="middle">
                                                    <Text>{jogador.nome}</Text>
                                                    <Rate disabled value={jogador.nivel} style={{ fontSize: 14 }} />
                                                </Flex>
                                            }
                                        />
                                    </List.Item>
                                )}
                                locale={{ emptyText: <Empty description="Nenhum jogador adicionado" /> }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card title="2. Configurar e Sortear">
                            <Form layout="vertical">
                                <Form.Item label="Quantos times você quer formar?">
                                    <InputNumber
                                        min={2}
                                        max={jogadores.length || 2}
                                        value={numeroDeTimes}
                                        onChange={(value) => setNumeroDeTimes(value || 2)}
                                        size="large"
                                        className="w-full"
                                    />
                                </Form.Item>
                                <ButtonPrimary
                                    text={isSubmitting ? "Sorteando..." : "Sortear Times"}
                                    icon={<ShakeOutlined />}
                                    onClick={handleSortearTimes}
                                    block
                                    size="large"
                                    disabled={jogadores.length < numeroDeTimes || isSubmitting}
                                    loading={isSubmitting}
                                />
                            </Form>
                        </Card>
                    </Col>
                </Row>

                {/* --- SEÇÃO DE RESULTADOS COM ANIMAÇÃO --- */}
                <div ref={resultsRef}>
                    <AnimatePresence>
                        {timesSorteados.length > 0 && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={containerVariants} // Animação do container dos cards
                                className="mt-8"
                            >
                                <Divider><Title level={3}>Times Sorteados</Title></Divider>
                                <Row gutter={[16, 16]}>
                                    {timesSorteados.map((time, index) => {
                                        const forcaTotal = time.reduce((acc, jogador) => acc + jogador.nivel, 0);
                                        return (
                                            <Col key={index} xs={24} sm={12} md={timesSorteados.length > 2 ? 8 : 12}>
                                                <motion.div variants={cardVariants}>
                                                    <Card title={<><TeamOutlined className="mr-2" /> Time {index + 1} <Tag color="blue">Força: {forcaTotal}</Tag></>}>
                                                        <motion.div initial="hidden" animate="visible" variants={playerListVariants}>
                                                            <List
                                                                dataSource={time}
                                                                renderItem={jogador => (
                                                                    <motion.div variants={playerItemVariants}>
                                                                        <List.Item>
                                                                            <List.Item.Meta
                                                                                avatar={<Avatar src={jogador.urlFoto} icon={<UserOutlined />} />}
                                                                                title={jogador.nome}
                                                                                description={<Rate disabled value={jogador.nivel} style={{ fontSize: 12 }} />}
                                                                            />
                                                                        </List.Item>
                                                                    </motion.div>
                                                                )}
                                                            />
                                                        </motion.div>
                                                    </Card>
                                                </motion.div>
                                            </Col>
                                        )
                                    })}
                                </Row>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Content>
    );
}
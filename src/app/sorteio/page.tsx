'use client';

import {
    Layout,
    Card,
    Typography,
    Form,
    Input,
    List,
    Avatar,
    Flex,
    Divider,
    App,
    InputNumber,
    Row,
    Col,
    Tag
} from 'antd';
import { UserOutlined, TeamOutlined, ShakeOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeProvider';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { useRef, useState } from 'react';
import { SorteadorPageSkeleton } from './skeleton';
import { useAuth } from '@/context/hooks/use-auth';
import axios from 'axios';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

type TimeSorteado = {
    nome: string;
    jogadores: string[];
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
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

export default function SorteadorDeTimesPage() {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const { isDarkMode } = useTheme();
    const resultsRef = useRef<HTMLDivElement>(null);
    const { isLoadingSession } = useAuth();

    const [timesSorteados, setTimesSorteados] = useState<TimeSorteado[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSortearTimes = async (values: { listaRacha: string; quantidadeTimes: number }) => {
        setIsSubmitting(true);
        setTimesSorteados([]);

        try {
            const response = await axios.post('/api/gerar-sorteio', values);

            if (response.data && response.data.times) {
                setTimesSorteados(response.data.times);
                message.success('Times sorteados com sucesso pela IA!');

                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                message.error('Erro ao processar o sorteio. Resposta inválida da IA.');
            }
        } catch (error: any) {
            console.error('Erro ao sortear times:', error);
            message.error(error.response?.data?.error || 'Erro ao conectar com a IA.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingSession) {
        return (
            <Content className={`!px-4 sm:!px-10 lg:!px-40 !pb-20 !py-8 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
                <SorteadorPageSkeleton />
            </Content>
        );
    }

    return (
        <Content className={`!px-4 sm:!px-10 lg:!px-40 !pb-20 !py-8 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}>
            <div className="max-w-4xl mx-auto">
                <Title level={2} className="!text-center">Sorteador de Times com IA</Title>
                <Text type="secondary" className="block text-center mb-8">
                    Cole a lista do seu racha e deixe a IA dividir os times de forma equilibrada.
                </Text>

                <Card className="shadow-md">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSortearTimes}
                        initialValues={{ quantidadeTimes: 2 }}
                    >
                        <Form.Item
                            name="listaRacha"
                            label="Lista do Racha"
                            rules={[{ required: true, message: 'Insira a lista de jogadores' }]}
                        >
                            <TextArea
                                placeholder="Cole aqui a lista de jogadores..."
                                rows={8}
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="quantidadeTimes"
                            label="Quantidade de Times"
                            rules={[{ required: true, message: 'Informe a quantidade de times' }]}
                        >
                            <InputNumber
                                min={2}
                                max={50}
                                size="large"
                                className="w-full"
                            />
                        </Form.Item>

                        <ButtonPrimary
                            text={isSubmitting ? "Sorteando com IA..." : "Sortear com IA"}
                            icon={<ShakeOutlined />}
                            htmlType="submit"
                            block
                            size="large"
                            disabled={isSubmitting}
                            loading={isSubmitting}
                        />
                    </Form>
                </Card>

                <div ref={resultsRef}>
                    <AnimatePresence>
                        {timesSorteados.length > 0 && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={containerVariants}
                                className="mt-8"
                            >
                                <Divider><Title level={3}>Times Sorteados</Title></Divider>
                                <Row gutter={[16, 16]}>
                                    {timesSorteados.map((time, index) => (
                                        <Col key={index} xs={24} sm={12} md={timesSorteados.length > 2 ? 8 : 12}>
                                            <motion.div variants={cardVariants}>
                                                <Card
                                                    title={
                                                        <Flex align="center" justify="space-between">
                                                            <span><TeamOutlined className="mr-2" /> {time.nome}</span>
                                                            <Tag color="blue">{time.jogadores.length} Jogadores</Tag>
                                                        </Flex>
                                                    }
                                                    className="h-full shadow-sm"
                                                >
                                                    <List
                                                        dataSource={time.jogadores}
                                                        renderItem={jogador => (
                                                            <List.Item>
                                                                <List.Item.Meta
                                                                    avatar={<Avatar icon={<UserOutlined />} />}
                                                                    title={jogador}
                                                                />
                                                            </List.Item>
                                                        )}
                                                    />
                                                </Card>
                                            </motion.div>
                                        </Col>
                                    ))}
                                </Row>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Content>
    );
}
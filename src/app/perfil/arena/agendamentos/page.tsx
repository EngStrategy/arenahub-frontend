"use client";

import React from 'react'
import { useTheme } from '@/context/ThemeProvider';
import { Flex, Layout, Result, Typography } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';

const { Title } = Typography;
const { Content } = Layout;

export default function AgendamentosArena() {
    const { isDarkMode } = useTheme();

    return (
        <Content className={`!px-4 sm:!px-10 lg:!px-40 !py-8 !flex-1 
            ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}
        >
            <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>Agendamentos</Title>

            <Flex align="center" justify="center" style={{ flexGrow: 1 }}>
                <Result
                    icon={<ToolOutlined style={{ fontSize: '64px' }} />}
                    title="Página em Desenvolvimento"
                    subTitle="Estamos trabalhando para trazer esta funcionalidade em breve. Agradecemos a sua paciência!"
                    extra={
                        <ButtonPrimary text='Voltar para o Início' type="primary" href="/dashboard" />
                    }
                />
            </Flex>
        </Content>
    )
}

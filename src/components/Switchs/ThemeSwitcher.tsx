"use client";

import { useState, useEffect } from 'react';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeProvider';

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const items: MenuProps['items'] = [
        {
            key: 'light',
            label: 'Claro',
            icon: <SunOutlined />,
            onClick: () => setTheme('light'),
        },
        {
            key: 'dark',
            label: 'Escuro',
            icon: <MoonOutlined />,
            onClick: () => setTheme('dark'),
        },
        {
            key: 'system',
            label: 'Sistema',
            icon: <DesktopOutlined />,
            onClick: () => setTheme('system'),
        },
    ];

    if (!mounted) {
        return <div style={{ width: 32, height: 32 }} />;
    }
    
    const renderIcon = () => {
      if (theme === 'dark') return <MoonOutlined />;
      if (theme === 'light') return <SunOutlined />;
      const systemThemeIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return systemThemeIsDark ? <MoonOutlined /> : <SunOutlined />;
    };

    return (
        <Dropdown menu={{ items, selectable: true, defaultSelectedKeys: [theme] }} trigger={['click']}>
            <Button
                type="text"
                shape="circle"
                icon={renderIcon()}
                aria-label="Alterar tema"
                className="!flex !items-center !justify-center"
            />
        </Dropdown>
    );
};
"use client";

import { useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button, Drawer, Dropdown, Menu, Avatar, Layout, Flex, Space, Typography, Segmented, Tag } from "antd";
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  BarChartOutlined,
  SyncOutlined
} from "@ant-design/icons";
import { FaAngleDown } from "react-icons/fa6";
import alugailogoverde from "../../public/images/alugailogoverde.png";
import { ThemeSwitcher } from "./Switchs/ThemeSwitcher";
import { useTheme } from "@/context/ThemeProvider";
import { FaRegCalendarAlt } from "react-icons/fa";
import { TbLockPassword, TbSoccerField } from "react-icons/tb";
import { BiWorld } from "react-icons/bi";

const { Header } = Layout;
const { Text } = Typography;

interface AppMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const segmentedIconStyle = { fontSize: 20 };
const segmentedTextStyle = { fontSize: 12, lineHeight: 1 };

interface SegmentedLabelProps {
  icon: React.ReactNode;
  text: string;
}

const SegmentedLabel = ({ icon, text }: SegmentedLabelProps) => (
  <Flex vertical align="center" justify="center" gap={4} style={{ padding: '4px 0' }}>
    {icon}
    <span style={segmentedTextStyle}>{text}</span>
  </Flex>
);


const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const isLoadingSession = status === "loading";

  const handleLogin = () => {
    router.push(`/login?callbackUrl=${pathname}`);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const atletaMenuItems: AppMenuItem[] = [
    {
      key: "info",
      icon: <UserOutlined />,
      label: "Meus dados",
      onClick: () => navigateTo("/perfil/atleta/informacoes"),
      className: "!my-1",
    },
    {
      key: "alterar-senha",
      icon: <TbLockPassword />,
      label: "Alterar senha",
      onClick: () => navigateTo("/perfil/atleta/alterar-senha"),
      className: "!my-1"
    },
  ];

  const arenaMenuItems: AppMenuItem[] = [
    {
      key: "info-arena",
      icon: <UserOutlined />,
      label: "Meus dados",
      onClick: () => navigateTo("/perfil/arena/informacoes"),
      className: "!my-1"
    },
    {
      key: "quadras-arena",
      icon: <TbSoccerField />,
      label: "Quadras",
      onClick: () => navigateTo("/perfil/arena/quadras"),
      className: "!my-1"
    },
    {
      key: "relatorio-arena",
      icon: <BarChartOutlined />,
      label: "Relatório",
      onClick: () => navigateTo("/perfil/arena/relatorios"),
      className: "!my-1",
      disabled: true
    },
    {
      key: "alterar-senha-arena",
      icon: <TbLockPassword />,
      label: "Alterar senha",
      onClick: () => navigateTo("/perfil/arena/alterar-senha"),
      className: "!my-1"
    },
  ];

  const commonMenuItems: AppMenuItem[] = [
    {
      key: "/quem-somos",
      icon: <TeamOutlined />,
      label: "Quem somos",
      onClick: () => navigateTo("/quem-somos"),
      className: "!my-1"
    },
    {
      key: "/contato",
      icon: <PhoneOutlined />,
      label: "Contato",
      onClick: () => navigateTo("/contato"),
      className: "!my-1"
    },
    {
      key: "/ajuda",
      icon: <QuestionCircleOutlined />,
      label: "Ajuda e suporte",
      onClick: () => navigateTo("/ajuda-suporte"),
      className: "!my-1"
    },
  ];

  let userMenuItems: AppMenuItem[] = session?.user?.role === "ATLETA" ? atletaMenuItems : arenaMenuItems;

  const desktopUserDropdownItems: MenuProps['items'] = [
    ...userMenuItems,
    { type: 'divider' },
    ...commonMenuItems,
    { type: 'divider' },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sair da conta",
      onClick: handleSignOut,
      danger: true,
      className: "!my-1"
    },
  ];

  const desktopCenterMenuItems: MenuProps['items'] = session?.user?.role === 'ATLETA'
    ? [
      {
        key: "/perfil/atleta/agendamentos",
        label: "Meus Agendamentos",
        onClick: () => navigateTo("/perfil/atleta/agendamentos"),
        icon: <FaRegCalendarAlt />,
        className: "!my-1"
      },
      {
        key: "/jogos-abertos",
        label: "Jogos Abertos",
        onClick: () => navigateTo("/jogos-abertos"),
        icon: <BiWorld />,
        className: "!my-1"
      }
    ]
    : [
      {
        key: "/perfil/arena/agendamentos",
        label: "Agendamentos",
        onClick: () => navigateTo("/perfil/arena/agendamentos"),
        icon: <FaRegCalendarAlt />,
        className: "!my-1"
      }
    ];

  // Conteúdo do Drawer
  const mobileDrawerContent = (
    <Flex vertical justify="space-between" style={{ height: '100%' }}>
      <Flex vertical>
        {session ? (
          <>
            <Flex vertical align="center" style={{ padding: '1.5rem 1rem' }}>
              <Avatar size={64} src={session.user?.imageUrl} icon={<UserOutlined />} />
              <Text strong style={{ marginTop: '0.75rem', fontSize: '1.1rem' }}>
                {session.user.name?.split(' ').slice(0, 3).join(' ')}
              </Text>
            </Flex>
            <Menu
              mode="inline"
              className="!bg-transparent"
              selectable={false}
              items={
                [
                  ...userMenuItems,
                  { type: 'divider' },
                  ...commonMenuItems,
                  { type: 'divider' },
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Sair da conta",
                    onClick: handleSignOut,
                    danger: true
                  }
                ]
              }
            />
          </>
        ) : (
          <Flex vertical align="center" gap="large" style={{ padding: '1.5rem' }}>
            <Text type="secondary" style={{ textAlign: 'center' }}>
              Entre para ter acesso a todos os recursos presentes na plataforma.
            </Text>
            <Button type="primary" size="large" block onClick={handleLogin}>Entrar</Button>
            <Menu className="!bg-transparent" mode="inline" selectable={false} items={commonMenuItems} style={{ width: '100%', borderRight: 0 }} />
          </Flex>
        )}
      </Flex>
      <Flex justify="center" align="center" style={{ padding: '1rem', borderTop: '1px solid #f0f0f0' }}>
        <ThemeSwitcher />
      </Flex>
    </Flex>
  );

  const mobileNavOptions = useMemo(() => {
    if (!session) {
      return [
        {
          value: '/jogos-abertos',
          label: <SegmentedLabel icon={<BiWorld style={segmentedIconStyle} />} text="Jogos Abertos" />,
        },
      ];
    }

    const options = [
      {
        value: session.user.role === 'ATLETA' ? "/perfil/atleta/agendamentos" : "/perfil/arena/agendamentos",
        label: <SegmentedLabel icon={<FaRegCalendarAlt style={segmentedIconStyle} />} text="Agendamentos" />,
      },
    ];

    if (session.user.role === 'ATLETA') {
      options.push({
        value: '/jogos-abertos',
        label: <SegmentedLabel icon={<BiWorld style={segmentedIconStyle} />} text="Jogos Abertos" />,
      });
    }

    return options;
  }, [session]);

  if (isLoadingSession) {
    return (
      <div className="!p-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="hidden md:block h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="hidden md:block h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  const homeHref = session?.user?.role === "ARENA" ? "/dashboard" : "/";

  return (
    <>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: isDarkMode ? '#2c2c2c' : '#ffffff',
          boxShadow: isDarkMode ? '0 1px 4px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          lineHeight: 'inherit',
          height: '56px'
        }}
        className="!px-4 sm:!px-2 md:!px-6 lg:!px-8 xl:!px-10 2xl:!px-14"
      >
        <Flex justify="space-between" align="center" style={{ height: '100%' }} className="!w-full">
          {/* Logo */}
          <Link href={homeHref} aria-label="Página Inicial Alugaí">
            <Image src={alugailogoverde} alt="Alugaí Logo" width={100} height={50} style={{ height: '2.75rem', width: 'auto' }} priority />
          </Link>

          {/* Exibir o menu central (logado) ou o menu comum (deslogado) */}
          <div className="hidden md:block">
            {session ? (
              <Menu
                mode="horizontal"
                items={desktopCenterMenuItems}
                selectedKeys={[pathname]}
                style={{ backgroundColor: 'transparent', borderBottom: 'none', lineHeight: '54px' }}
                className="!w-100 !flex !justify-center !items-center"
              />
            ) : (
              <Menu
                mode="horizontal"
                items={[
                  {
                    key: "/jogos-abertos",
                    label: "Jogos abertos",
                    onClick: () => navigateTo("/jogos-abertos"),
                    icon: <BiWorld />,
                    className: "!my-1"
                  },
                  ...commonMenuItems
                ]}
                selectable={false}
                style={{ backgroundColor: 'transparent', borderBottom: 'none', lineHeight: '54px' }}
                className="!w-100 !flex !justify-center !items-center"
              />
            )}
          </div>

          {/* Botão Entrar/Dropdown Usuário - Desktop */}
          <Space size="large" className="!hidden md:!flex">
            <ThemeSwitcher />
            {session ? (
              <Dropdown
                menu={{ items: desktopUserDropdownItems }}
                trigger={["click"]}
                placement="bottomRight"
                className="!border !border-gray-300 !rounded-lg !shadow-xs !px-2 !py-1"
                overlayClassName="!mt-2 !w-50 !shadow-none !rounded-md"
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar size={32} src={session.user.imageUrl} icon={<UserOutlined />} />
                  <Text>{session.user.name?.split(' ').slice(0, 2).join(' ')}</Text>
                  <FaAngleDown style={{ color: '#888' }} />
                </Space>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={handleLogin}>Entrar</Button>
            )}
          </Space>

          {/* Botão Hamburger - Mobile */}
          <div className="md:hidden">
            <Button type="text" icon={<MenuOutlined />} onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu" />
          </div>
        </Flex>

        {/* Drawer Menu - Mobile */}
        <Drawer
          title={
            <Flex justify="space-between" align="center">
              <Image src={alugailogoverde} alt="Alugaí Logo Drawer" width={100} height={40} style={{ height: '2rem', width: 'auto' }} />
              <Button type="text" icon={<CloseOutlined />} onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu" />
            </Flex>
          }
          placement="right"
          closable={false}
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          styles={{ body: { padding: 0 } }}
          width={300}
        >
          {mobileDrawerContent}
        </Drawer>
      </Header>

      {/* BOTÕES FLUTUANTES PARA MOBILE */}
      <div className={`${mobileNavOptions.length === 0 ? 'hidden' : ''} md:hidden fixed bottom-2 left-0 right-0 z-10 px-14 py-2`} >
        <Segmented
          options={mobileNavOptions}
          value={pathname}
          onChange={(value) => navigateTo(value as string)}
          block
          size="large"
        />
      </div>
    </>
  );
};

export default Navbar;
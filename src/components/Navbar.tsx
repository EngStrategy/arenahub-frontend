"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { MenuProps } from 'antd';

import { Button, Drawer, Dropdown, Menu, Avatar } from "antd";
import {
  UserOutlined,
  ScheduleOutlined,
  UnlockOutlined,
  KeyOutlined,
  TeamOutlined,
  PhoneOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import { FaAngleDown } from "react-icons/fa6";
import { TbSoccerField } from "react-icons/tb";

import alugailogoverde from "../../public/images/alugailogoverde.png";

interface AppMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoadingSession = status === "loading";

  const handleLogin = () => {
    router.push("/login");
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
      icon: <UserOutlined className="!text-sm" />,
      label: "Informações pessoais",
      onClick: () => navigateTo("/perfil/atleta/informacoes"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
    {
      key: "agendamentos",
      icon: <ScheduleOutlined className="!text-sm" />,
      label: "Meus agendamentos",
      onClick: () => navigateTo("/perfil/atleta/meus-agendamentos"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
    {
      key: "jogos-abertos",
      icon: <UnlockOutlined className="!text-sm" />,
      label: "Jogos abertos",
      onClick: () => navigateTo("/jogos-abertos"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
    {
      key: "alterar-senha",
      icon: <KeyOutlined className="!text-sm" />,
      label: "Alterar senha",
      onClick: () => navigateTo("/perfil/atleta/alterar-senha"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
  ];

  const arenaMenuItems: AppMenuItem[] = [
    {
      key: "info-arena",
      icon: <UserOutlined className="!text-sm" />,
      label: "Informações da arena",
      onClick: () => navigateTo("/perfil/arena/informacoes"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
    {
      key: "agendamentos-arena",
      icon: <ScheduleOutlined className="!text-sm" />,
      label: "Meus agendamentos",
      onClick: () => navigateTo("/perfil/arena/meus-agendamentos"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
    {
      key: "minhas-quadras",
      icon: <TbSoccerField className="!text-sm" />,
      label: "Minhas quadras",
      onClick: () => navigateTo("/perfil/arena/minhas-quadras"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
    {
      key: "relatorio-arena",
      icon: <BarChartOutlined className="!text-sm" />,
      label: "Relatório",
      onClick: () => navigateTo("/perfil/arena/relatorios"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
    {
      key: "alterar-senha-arena",
      icon: <KeyOutlined className="!text-sm" />,
      label: "Alterar senha",
      onClick: () => navigateTo("/perfil/arena/alterar-senha"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
  ];

  const commonMenuItems: AppMenuItem[] = [
    {
      key: "quem-somos",
      icon: <TeamOutlined className="!text-sm" />,
      label: "Quem somos",
      onClick: () => navigateTo("/quem-somos"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
    {
      key: "contato",
      icon: <PhoneOutlined className="!text-sm" />,
      label: "Contato",
      onClick: () => navigateTo("/contato"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
    {
      key: "ajuda",
      icon: <QuestionCircleOutlined className="!text-sm" />,
      label: "Ajuda e suporte",
      onClick: () => navigateTo("/ajuda"),
      className: "!py-2.5 hover:!bg-gray-100",
    },
  ];

  let userMenuItems: AppMenuItem[] = [];
  if (session?.user?.role === "ATLETA") {
    userMenuItems = atletaMenuItems;
  } else {
    userMenuItems = arenaMenuItems;
  }

  const desktopUserDropdownItems: MenuProps['items'] = [
    ...userMenuItems,
    { type: 'divider', className: "border border-gray-300" },
    ...commonMenuItems,
    { type: 'divider', className: "border border-gray-300" },
    {
      key: "logout",
      icon: <LogoutOutlined className="!text-sm !text-red-500" />,
      label: "Sair da conta",
      onClick: handleSignOut,
      className: "!text-red-500 hover:!bg-red-100 !font-medium",
    },
  ];

  // Conteúdo do Drawer para mobile (usando Menu do AntD, que é diferente do Dropdown.menu.items)
  const mobileDrawerContent = (
    <div className="p-0">
      {session ? (
        // Menu Mobile - Logado
        <div>
          <div className="text-center m-4">
            <Avatar
              size={64}
              src={session.user?.imageUrl}
              icon={<UserOutlined />}
              className="transition-all duration-300 ease-in-out shadow-[0_0_0_2px_#ffffff,0_0_0_4px_#22c55e,0_0_0_5px_#e5e7eb] hover:shadow-[0_0_0_2px_#ffffff,0_0_0_5px_#16a34a,0_0_0_7px_#d1d5db]"
            />
            <p className="mt-2 font-semibold text-lg text-gray-800 truncate">
              {session.user.name.split(' ').slice(0, 2).join(' ')
                ?? "Usuário"}
            </p>
          </div>

          <Menu
            mode="inline"
            selectable={false}
            items={[
              ...userMenuItems,
              { type: 'divider', className: "!my-1 !border-gray-200" },
              ...commonMenuItems,
              { type: 'divider', className: "!my-1 !border-gray-200" },
              {
                key: "logout",
                icon: <LogoutOutlined className="!text-sm" />,
                label: "Sair da conta",
                onClick: handleSignOut,
                className: "!text-red-500 !font-medium hover:!bg-red-50",
              },
            ]}
          />
        </div>
      ) : (
        // Menu Mobile - Não Logado
        <div className="flex flex-col h-full">
          <div className="px-4 pt-4 pb-2">
            <p className="text-gray-600 mb-6 text-center">
              Entre para ter acesso a todos os recursos presentes na plataforma.
            </p>
            <Button
              type="primary"
              size="large"
              className="!bg-green-600 hover:!bg-green-400 !font-semibold !rounded-4xl w-full mb-4"
              onClick={handleLogin}
            >
              Entrar
            </Button>
          </div>
          <Menu
            mode="inline"
            selectable={false}
            items={[
              { type: 'divider', className: "!border !border-gray-300" },
              ...commonMenuItems,
              { type: 'divider', className: "!border !border-gray-300" },
            ]}
          >
          </Menu>
        </div>
      )}
    </div >
  );

  // Um loading spinner pode ser exibido enquanto a sessão é carregada
  if (isLoadingSession) {
    // Pode retornar um skeleton/loading state aqui se desejar
    return (
      <nav className="bg-white px-4 sm:px-6 lg:px-10 py-3 flex justify-between items-center shadow-md animate-pulse">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block h-5 w-20 bg-gray-200 rounded"></div>
          <div className="hidden md:block h-5 w-20 bg-gray-200 rounded"></div>
          <div className="hidden md:block h-5 w-24 bg-gray-200 rounded"></div>
          <div className="h-9 w-20 bg-gray-200 rounded-lg"></div>
        </div>
      </nav>
    );
  }

  let homeHref = "/";
  if (session?.user?.role === "ARENA") {
    homeHref = "/dashboard";
  } else if (session?.user?.role && session.user.role !== "ATLETA") {
    homeHref = "/admin";
  }

  return (
    <nav className="bg-white px-4 sm:px-10 py-1 flex justify-between items-center shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link
          href={homeHref}
          aria-label="Página Inicial Alugaí"
        >
          <Image
            src={alugailogoverde}
            alt="Alugaí Logo Verde"
            width={100}
            height={50}
            className="!h-10 md:!h-12 !w-auto"
            priority
          />
        </Link>
      </div>

      {/* Links Desktop - Não Logado */}
      {!session && (
        <div className="hidden md:flex space-x-2 lg:space-x-4 items-center">
          {commonMenuItems.map(item => (
            <Link
              key={item.key}
              href={`/${item.key}`}
              className="!px-3 !py-2 !text-gray-700 hover:!text-green-600 !font-medium !rounded-md !transition-colors !duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Botão Entrar/Dropdown Usuário - Desktop */}
      <div className="hidden md:block">
        {session ? (
          <Dropdown menu={{ items: desktopUserDropdownItems }} trigger={["click"]} placement="bottomRight" overlayClassName="!mt-2 !w-64 !shadow-lg !rounded-md">
            <button className="flex items-center gap-2 space-x-2 p-1 px-2 rounded-full hover:bg-gray-200 transition-colors duration-200 border border-gray-300 cursor-pointer">
              {session.user?.imageUrl ? (
                <Avatar
                  size={28}
                  src={session.user.imageUrl}
                  className="transition-shadow duration-300 ease-in-out shadow-[0_0_0_1.5px_#22c55e] hover:shadow-[0_0_0_2px_#16a34a]"
                />
              ) : (
                <Avatar
                  size={28}
                  icon={<UserOutlined />}
                  className="transition-shadow duration-300 ease-in-out shadow-[0_0_0_1.5px_#22c55e] hover:shadow-[0_0_0_2px_#16a34a]"
                />
              )}
              <span className="text-gray-700 font-base  lg:block">
                {session.user?.role === "ATLETA" ? (session.user?.name?.split(' ')[0] ?? "Usuário") :
                  session.user?.name
                    ? session.user.name.split(' ').slice(0, 2).join(' ')
                    : "Usuário"
                }
              </span>
              {/* Mostra só o primeiro nome em telas lg, ou "Usuário" */}
              <FaAngleDown className="!text-gray-500 !size-3" />
            </button>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            className="!bg-green-600 hover:!bg-green-400 !font-semibold !rounded-4xl"
            onClick={handleLogin}
          >
            Entrar
          </Button>
        )}
      </div>

      {/* Botão Hamburger - Mobile */}
      <div className="md:hidden">
        <Button
          type="text"
          icon={<MenuOutlined className="!text-xl !text-gray-700" />}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menu"
        />
      </div>

      {/* Drawer Menu - Mobile */}
      <Drawer
        title={
          <div className="flex justify-between items-center">
            <Image
              src={alugailogoverde}
              alt="Alugaí Logo Verde no Drawer"
              width={100}
              height={40}
              className="!h-8 !w-auto"
            />
            <Button
              type="text"
              icon={<CloseOutlined className="!text-xl !text-gray-600" />}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Fechar menu"
            />
          </div>
        }
        placement="right"
        closable={false} // O botão de fechar já está no title
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
        width={300}
      >
        {mobileDrawerContent}
      </Drawer>
    </nav>
  );
};

export default Navbar;
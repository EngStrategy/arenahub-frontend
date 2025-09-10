"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RegistroAtleta } from "@/components/RegistroAtleta";
import { RegistroArena } from "@/components/RegistroArena";
import Image from "next/image";
import { Flex, Segmented, Typography } from "antd";
import { useTheme } from "@/context/ThemeProvider";
import { useAuth } from "@/context/hooks/use-auth";

const RegisterPageSkeleton = () => (
  <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center md:items-start justify-center animate-pulse">
    <div className="hidden md:block md:w-2/3 p-4">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="h-[300px] w-[300px] bg-gray-300 rounded-full mx-auto"></div>
      </div>
    </div>
    <div className="w-full md:w-1/3 p-4">
      <div className="flex w-full flex-col justify-center md:min-h-screen">
        <div className="h-6 bg-gray-300 rounded-md w-1/2 mx-auto mb-4"></div>
        <div className="flex justify-center mb-4 w-full">
          <div className="h-12 bg-gray-300 w-1/2 rounded-t-md"></div>
          <div className="h-12 bg-gray-200 w-1/2 rounded-t-md"></div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-300 rounded-lg w-full mt-4"></div>
        </div>
      </div>
    </div>
  </div>
);

const RegisterPage = () => {
  const { user, isAuthenticated, isLoadingSession, isUserAtleta } = useAuth();
  const [accountType, setAccountType] = useState<"atleta" | "arena">("atleta");
  const router = useRouter();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (isAuthenticated && isUserAtleta) {
      router.push("/arenas");
    }
  }, [isAuthenticated, router, user?.role]);

  if (isLoadingSession) {
    return <RegisterPageSkeleton />;
  }

  const imageSrc = accountType === 'atleta'
    ? "/icons/vector_futebol.svg"
    : "/icons/arena_estadio.svg";

  return (
    <Flex
      align="flex-center"
      justify="center"
      className="!flex-1 sm:!px-10 sm:!pb-16 lg:!px-40"
      style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
    >
      <Flex align="flex-start" justify="center" className="!hidden md:!flex md:!w-2/3">
        <Image
          src={imageSrc}
          alt="Futebol"
          width={400}
          height={400}
          className="!sticky !top-20 !w-full !object-cover"
        />
      </Flex>

      <Flex align="center" justify="center" className="!w-full md:!w-1/3">
        <div className="p-6 sm:p-8 w-full">
          <Flex justify="center" vertical>
            <Typography.Title level={4} className="text-center !mb-4">
              Crie sua Conta no ArenaHub
            </Typography.Title>

            <Segmented
              options={[
                { label: 'Atleta', value: 'atleta' },
                { label: 'Arena', value: 'arena' },
              ]}
              value={accountType}
              onChange={(value) => setAccountType(value as 'atleta' | 'arena')}
              block
              size="large"
              className="!mb-6"
            />

            {accountType === "atleta" && (
              <RegistroAtleta
                className="w-full transition-opacity duration-300"
              />
            )}
            {accountType === "arena" && (
              <RegistroArena
                className="w-full transition-opacity duration-300"
              />
            )}
          </Flex>
        </div>
      </Flex>
    </Flex>
  );
};

export default RegisterPage;
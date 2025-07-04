"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RegistroAtleta } from "@/components/RegistroAtleta";
import { RegistroArena } from "@/components/RegistroArena";
import Image from "next/image";

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
  const { data: session, status } = useSession();
  const [accountType, setAccountType] = useState<"atleta" | "arena">("atleta");
  const [isFading, setIsFading] = useState(false);
  const router = useRouter();

  const handleAccountTypeChange = (type: "atleta" | "arena") => {
    if (accountType === type) return;
    setIsFading(true);
    setTimeout(() => {
      setAccountType(type);
      setIsFading(false);
    }, 500);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ATLETA") {
      router.push("/");
    }
  }, [status, router, session?.user?.role]);

  if (status === 'loading') {
    return <RegisterPageSkeleton />;
  }

  return (
    <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center md:items-start justify-center">
      <div className="hidden md:block md:w-2/3 p-4">
        <div className="sticky top-0 flex h-screen items-center">
          <Image src="/icons/beachtenis.svg" alt="Beach Tenis" width={700} height={700} />
        </div>
      </div>
      <div className="w-full md:w-1/3 p-4">
        <div className="flex w-full flex-col justify-center md:min-h-screen">
          <p className="text-center text-gray-600 font-medium text-lg mb-4">
            Cadastre-se abaixo
          </p>
          <div className="flex justify-center mb-4 w-full max-w-full md:max-w-none">
            <button
              className={`px-4 py-2 border-b-2 cursor-pointer hover:text-green-600 w-1/2 ${accountType === "atleta"
                ? "border-green-primary text-green-primary"
                : "border-transparent text-gray-500"
                }`}
              onClick={() => handleAccountTypeChange("atleta")}
              disabled={isFading}
            >
              Atleta
            </button>
            <button
              className={`px-4 py-2 border-b-2 cursor-pointer hover:text-green-600 w-1/2 ${accountType === "arena"
                ? "border-green-primary text-green-primary"
                : "border-transparent text-gray-500 hover:text-green-primary"
                }`}
              onClick={() => handleAccountTypeChange("arena")}
              disabled={isFading}
            >
              Arena
            </button>
          </div>

          {accountType === "atleta" && (
            <RegistroAtleta
              className={`w-full transition-opacity duration-400 ease-in-out ${isFading ? "opacity-30" : "opacity-100"}`}
            />
          )}

          {accountType === "arena" && (
            <RegistroArena
              className={`w-full transition-opacity duration-400 ease-in-out ${isFading ? "opacity-30" : "opacity-100"}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
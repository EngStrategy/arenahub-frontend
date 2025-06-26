"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Form } from "antd";
import { RegistroAtleta } from "@/components/RegistroAtleta";
import { RegistroArena } from "@/components/RegistroArena";
import Image from "next/image";

const RegisterPage = () => {
  const { data: session, status } = useSession();
  const [accountType, setAccountType] = useState<"atleta" | "arena">("atleta");
  const [isFading, setIsFading] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const handleAccountTypeChange = (type: "atleta" | "arena") => {
    if (accountType === type) return;

    setIsFading(true);

    setTimeout(() => {
      setAccountType(type);
      form.resetFields();
      setIsFading(false);
    }, 500);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ATLETA") {
      router.push("/");
    }
  }, [status, router, session?.user?.role]);

  return (
    <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center">
      <div className="hidden md:block md:w-2/3 p-4">
        <Image src="/icons/beachtenis.svg" alt="Beach Tenis" width={700} height={700} />
      </div>

      <div className="w-full md:w-1/3 p-4">
        <p className="text-center text-gray-600 font-medium text-lg mb-4">
          Cadastre-se abaixo
        </p>

        <div className="flex justify-center mb-4 w-full max-w-full md:max-w-none">
          {!isFull && (
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
          )}

          <button
            className={`px-4 py-2 border-b-2 cursor-pointer hover:text-green-600 w-1/2 ${accountType === "arena"
              ? "border-green-primary text-green-primary"
              : "border-transparent text-gray-500 hover:text-green-primary"
              }
              ${isFull ? "w-full" : ""}`}
            onClick={() => handleAccountTypeChange("arena")}
            disabled={isFading}
          >
            Arena
          </button>
        </div>

        {accountType === "atleta" && (
          <RegistroAtleta
            className={`w-full transition-opacity duration-400ease-in-out ${isFading ? "opacity-30" : "opacity-100"}`}
          />
        )}

        {accountType === "arena" && (
          <RegistroArena
            className={`w-full transition-opacity duration-400 ease-in-out ${isFading ? "opacity-30" : "opacity-100"}`}
            setIsFull={setIsFull}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;

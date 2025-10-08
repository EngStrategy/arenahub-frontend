'use client';

import { useAuth } from "@/context/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Flex, Spin } from "antd";

export default function DashboardLayout({
    children,
}: {
    readonly children: React.ReactNode;
}) {
    const { user, isLoadingSession } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoadingSession) {
            return;
        }

        const status = user?.statusAssinatura;

        if (status === 'INATIVA' || status === 'CANCELADA' || status === 'ATRASADA') {
            router.replace('/perfil/arena/assinatura');
        }

    }, [user, isLoadingSession, router]);

    if (isLoadingSession || !user) {
        return (
            <Flex align="center" justify="center" className="min-h-screen">
                <Spin size="large" />
            </Flex>
        );
    }

    return <>{children}</>;
}
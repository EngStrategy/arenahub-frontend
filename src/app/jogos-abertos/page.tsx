"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Pagination, Layout, Typography, Row, Col, Flex, Empty, App } from 'antd';
import { JogoAbertoCard } from '@/components/Cards/JogoAbertoCard';
import CitySports from '@/components/CitySports';
import { sportIcons } from '@/data/sportIcons';
import { useTheme } from '@/context/ThemeProvider';
import { getAllJogosAbertos, JogosAbertosQueryParams, type JogosAbertos as JogoAbertoAPI } from '@/app/api/entities/jogosAbertos';
import { mapeamentoEsportes } from '@/context/functions/mapeamentoEsportes';
import { TipoQuadra } from '../api/entities/quadra';
import { useAuth } from '@/context/hooks/use-auth';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AskingPermissionLocation } from '@/components/Alerts/AskingPermissionLocation';
import JsonLd from '@/components/JsonLd';

const { Title, Text } = Typography;
const { Content } = Layout;

type UserLocation = {
    latitude: number;
    longitude: number;
};

type CachedLocation = {
    coords: UserLocation;
    timestamp: number;
};

const CACHE_KEY = 'user_location';
const CACHE_EXPIRATION_MS = 60 * 60 * 12000; // Cache de 12 horas

const saveLocationToCache = (coords: UserLocation) => {
    const data: CachedLocation = { coords, timestamp: new Date().getTime() };
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Erro ao salvar localização no cache:", error);
    }
};

const getLocationFromCache = (): UserLocation | null => {
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (!cachedData) return null;
        const data: CachedLocation = JSON.parse(cachedData);
        const isExpired = new Date().getTime() - data.timestamp > CACHE_EXPIRATION_MS;
        if (isExpired) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
        return data.coords;
    } catch (error) {
        console.error("Erro ao ler localização do cache:", error);
        return null;
    }
};

const JogoAbertoCardSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 animate-pulse">
        <div className="bg-gray-300 h-40 w-full rounded-lg"></div>
        <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded-lg mt-4"></div>
    </div>
);
const JogoAbertoSkeleton = () => (
    <div className="px-4 sm:px-10 lg:px-40 py-8 flex-1">
        <div className="h-7 bg-gray-300 rounded-md w-48 mx-auto mb-8 animate-pulse"></div>
        <div className="w-full">
            <div className="mb-8 flex overflow-x-auto whitespace-nowrap space-x-3 pb-3">
                {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="bg-gray-300 h-10 w-28 rounded-full animate-pulse"></div>
                ))}
            </div>
            <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <JogoAbertoCardSkeleton key={index} />
                ))}
            </div>
        </div>
    </div>
);

const friendlyNameToBackendEnum = Object.entries(mapeamentoEsportes).reduce((acc, [key, value]) => {
    acc[value] = key as TipoQuadra;
    return acc;
}, {} as Record<string, TipoQuadra>);

export default function JogosAbertos() {
    const { statusSession } = useAuth();
    const { isDarkMode } = useTheme();
    const { message } = App.useApp();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [jogos, setJogos] = useState<JogoAbertoAPI[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedSport, setSelectedSport] = useState(searchParams.get('esporte') || '');
    const [committedSearchTerm, setCommittedSearchTerm] = useState(searchParams.get('cidade') || '');
    const [inputValue, setInputValue] = useState(searchParams.get('cidade') || '');
    const [pagination, setPagination] = useState({
        currentPage: Number(searchParams.get('pagina')) || 1,
        pageSize: 16,
        totalElements: 0,
    });

    const [location, setLocation] = useState<UserLocation | null>(null);
    const [isLocationBannerVisible, setIsLocationBannerVisible] = useState(false);
    const [isAskingPermission, setIsAskingPermission] = useState(false);

    const fetchJogosAbertos = useCallback(async (page: number, sport: string, cidade: string, loc: UserLocation | null) => {
        setLoading(true);
        try {
            const backendSport = sport === 'Todos' ? undefined : friendlyNameToBackendEnum[sport];

            const isProximitySearch = loc?.latitude != null && loc?.longitude != null;

            const params = {
                page: page - 1,
                size: pagination.pageSize,
                sort: 'dataAgendamento',
                direction: 'asc',
                cidade: isProximitySearch ? undefined : cidade,
                esporte: backendSport,
                latitude: loc?.latitude,
                longitude: loc?.longitude,
                raioKm: loc ? 50 : undefined,
            };
            const response = await getAllJogosAbertos(params as JogosAbertosQueryParams);

            setJogos(response?.content ?? []);
            setPagination(prev => ({
                ...prev,
                currentPage: (response?.number ?? 0) + 1,
                totalElements: response?.totalElements ?? 0,
            }));
        } catch (error) {
            console.error(
                "Erro ao buscar jogos abertos:",
                error instanceof Error ? error : new Error(String(error))
            );
            message.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar os jogos abertos."
            );
            setJogos([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize, message]);

    useEffect(() => {
        const params = new URLSearchParams();

        if (committedSearchTerm) params.set('cidade', committedSearchTerm);
        if (selectedSport && selectedSport !== 'Todos') params.set('esporte', selectedSport);
        if (pagination.currentPage > 1) params.set('pagina', String(pagination.currentPage));

        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });

    }, [selectedSport, committedSearchTerm, pagination.currentPage, pathname, router]);

    useEffect(() => {
        fetchJogosAbertos(pagination.currentPage, selectedSport, committedSearchTerm, location);
    }, [pagination.currentPage, selectedSport, committedSearchTerm, fetchJogosAbertos, location]);

    useEffect(() => {
        const cachedLocation = getLocationFromCache();
        if (cachedLocation) {
            setLocation(cachedLocation);
            setIsLocationBannerVisible(false);
        } else {
            const timer = setTimeout(() => {
                setIsLocationBannerVisible(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleRequestLocation = () => {
        setIsAskingPermission(true);
        if (!navigator.geolocation) {
            message.error("Geolocalização não é suportada pelo seu navegador.");
            setIsAskingPermission(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                saveLocationToCache(newLocation);
                setLocation(newLocation);
                setIsLocationBannerVisible(false);
                setIsAskingPermission(false);
                setCommittedSearchTerm('');
                setInputValue('');
            },
            (err) => {
                console.warn(`Erro de geolocalização: ${err.message}`);
                setIsLocationBannerVisible(false);
                setIsAskingPermission(false);
                message.warning("Não foi possível obter sua localização. Tente buscar por cidade.");
            }
        );
    };

    const handleSportChange = (sport: string) => {
        setSelectedSport(sport);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleSearchCommit = (term: string) => {
        setLocation(null);
        localStorage.removeItem(CACHE_KEY);
        setCommittedSearchTerm(term);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const allSports = Object.keys(sportIcons);

    if (statusSession === 'loading') {
        return <JogoAbertoSkeleton />;
    }

    let contentToRender;
    if (loading) {
        contentToRender = (
            <div className="w-full mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <JogoAbertoCardSkeleton key={index} />
                ))}
            </div>
        );
    } else if (jogos.length > 0) {
        contentToRender = (
            <>
                <Row gutter={[24, 24]} className="mb-10">
                    {jogos.map((jogo) => (
                        <Col key={jogo.agendamentoId} xs={24} sm={12} lg={8}>
                            <JogoAbertoCard jogoAberto={jogo} />
                        </Col>
                    ))}
                </Row>
                {jogos.length > pagination.pageSize && (
                    <Flex justify='center'>
                        <Pagination
                            current={pagination.currentPage}
                            total={pagination.totalElements}
                            pageSize={pagination.pageSize}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                        />
                    </Flex>
                )}
            </>
        );
    } else {
        contentToRender = (
            <Empty description="Nenhum jogo aberto encontrado." className="mt-10" />
        );
    }

    const jsonLd = jogos.length > 0 ? {
        "@context": "https://schema.org",
        "@graph": jogos.map(jogo => ({
            "@type": "SportsEvent",
            "name": `${jogo.esporte} no ${jogo.nomeArena}`,
            "startDate": `${jogo.data}T${jogo.horarioInicio}`,
            "endDate": `${jogo.data}T${jogo.horarioFim}`,
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "location": {
                "@type": "SportsActivityLocation",
                "name": jogo.nomeArena,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": jogo.cidade,
                    "addressCountry": "BR"
                },
                "image": jogo.urlFotoArena
            },
            "image": [jogo.urlFotoArena],
            "description": `Partida de ${jogo.esporte} no ${jogo.nomeArena} em ${jogo.cidade}.`,
            "offers": {
                "@type": "Offer",
                "availability": jogo.vagasDisponiveis > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
                "price": "0",
                "priceCurrency": "BRL"
            },
            "organizer": {
                "@type": "Organization",
                "name": "ArenaHub",
                "url": "https://arenahub.app"
            }
        }))
    } : null;

    return (
        <Content
            className="px-4 sm:px-10 lg:px-40 py-8 flex-1"
            style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
        >
            {jsonLd && <JsonLd data={jsonLd} />}
            <Title level={3} className="!text-center !mb-8">Jogos abertos</Title>

            {isLocationBannerVisible && (
                <AskingPermissionLocation
                    setIsLocationBannerVisible={setIsLocationBannerVisible}
                    handleRequestLocation={handleRequestLocation}
                    isAskingPermission={isAskingPermission}
                />
            )}

            <CitySports
                loading={loading}
                selectedSport={selectedSport}
                setSelectedSport={handleSportChange}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSearchCommit={handleSearchCommit}
                setCurrentPage={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                allSports={allSports}
                sportIcons={sportIcons}
            />

            {location && !committedSearchTerm && (
                <div className="my-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
                    <Text type="secondary">
                        Jogos abertos próximos a você.
                    </Text>
                </div>
            )}

            {contentToRender}
        </Content>
    );
}
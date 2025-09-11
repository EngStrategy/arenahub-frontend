'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Col, Flex, Pagination, Row, Alert, App, Typography } from 'antd';
import { ArenaCard } from '@/components/Cards/ArenaCard';
import { sportIcons } from '@/data/sportIcons';
import { type Arena, getAllArenas, type ArenaQueryParams } from '@/app/api/entities/arena';
import Link from 'next/link';
import CitySports from '@/components/CitySports';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/hooks/use-auth';
import { GlobalOutlined } from '@ant-design/icons';
import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebounce } from '@/context/hooks/use-debounce';

const { Text } = Typography;

type UserLocation = {
  latitude: number;
  longitude: number;
};

type CachedLocation = {
  coords: UserLocation;
  timestamp: number;
};

const CACHE_KEY = 'user_location';
const CACHE_EXPIRATION_MS = 60 * 60 * 24000; // Cache de 24 horas

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


const ArenaCardSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 flex flex-col animate-pulse">
    <div className="bg-gray-300 h-40 w-full"></div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-300 rounded w-3/5"></div>
      <div className="h-4 bg-gray-300 rounded w-4/5"></div>
    </div>
  </div>
);

const sportNameToBackendEnum: { [key: string]: ArenaQueryParams['esporte'] } = {
  'Futebol Society': 'FUTEBOL_SOCIETY',
  'Futebol 7': 'FUTEBOL_SETE',
  'Futebol 11': 'FUTEBOL_ONZE',
  'Futsal': 'FUTSAL',
  'Vôlei': 'VOLEI',
  'Beach Tennis': 'BEACHTENNIS',
  'Futevôlei': 'FUTEVOLEI',
  'Basquete': 'BASQUETE',
  'Handebol': 'HANDEBOL',
};

export default function HomePage() {
  const { isLoadingSession } = useAuth();
  const { isDarkMode } = useTheme();
  const { message } = App.useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedSport, setSelectedSport] = useState(searchParams.get('esporte') || '');
  const [committedSearchTerm, setCommittedSearchTerm] = useState(searchParams.get('cidade') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('pagina')) || 1);

  const [inputValue, setInputValue] = useState(searchParams.get('cidade') || '');

  const pageSize = 16;
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalArenas, setTotalArenas] = useState(0);

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLocationBannerVisible, setIsLocationBannerVisible] = useState(false);
  const [isAskingPermission, setIsAskingPermission] = useState(false);

  const debouncedSearch = useDebounce(inputValue, 2000);

  useEffect(() => {
    if (debouncedSearch !== committedSearchTerm) {
      setCommittedSearchTerm(debouncedSearch);
      setCurrentPage(1);
    }
  }, [debouncedSearch, committedSearchTerm]);

  useEffect(() => {
    if (isLoadingSession) return;

    const fetchAndSync = async () => {
      setLoading(true);

      const params = new URLSearchParams();
      if (committedSearchTerm) params.set('cidade', committedSearchTerm);
      if (selectedSport && selectedSport !== 'Todos') params.set('esporte', selectedSport);
      if (currentPage > 1) params.set('pagina', String(currentPage));
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });

      try {
        const backendSport = selectedSport === 'Todos' ? undefined : sportNameToBackendEnum[selectedSport];
        const apiParams: ArenaQueryParams = {
          page: currentPage - 1,
          size: pageSize,
          esporte: backendSport,
          cidade: committedSearchTerm || undefined,
          latitude: location?.latitude,
          longitude: location?.longitude,
          raioKm: location ? 50 : undefined,
        };
        const response = await getAllArenas(apiParams);
        setArenas(response?.content || []);
        setTotalArenas(response?.totalElements ?? 0);
      } catch (error) {
        console.error("Erro ao buscar arenas:", error);
        message.error("Não foi possível carregar as arenas.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndSync();
  }, [currentPage, selectedSport, committedSearchTerm, location, isLoadingSession, pageSize, pathname, router, message]);

  useEffect(() => {
    const cachedLocation = getLocationFromCache();
    if (cachedLocation) {
      setLocation(cachedLocation);
    } else {
      const timer = setTimeout(() => setIsLocationBannerVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequestLocation = () => {
    setIsAskingPermission(true);
    if (!navigator.geolocation) {
      message.error("Geolocalização não é suportada pelo seu navegador.");
      setIsAskingPermission(false);
      setIsLocationBannerVisible(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        saveLocationToCache(newLocation);
        setLocation(newLocation);
        setIsLocationBannerVisible(false);
        setIsAskingPermission(false);
        // Limpa a busca por cidade para priorizar a localização
        setCommittedSearchTerm('');
        setInputValue('');
      },
      (err) => {
        console.warn(`Erro de geolocalização: ${err.message}`);
        setIsLocationBannerVisible(false);
        setIsAskingPermission(false);
      }
    );
  };

  const handleSearchCommit = (term: string) => {
    setLocation(null);
    localStorage.removeItem(CACHE_KEY);
    setCommittedSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSportChange = (sport: string) => {
    setSelectedSport(sport);
    setCurrentPage(1);
  };

  const allSports = Object.keys(sportIcons);
  const isPageLoading = loading || isLoadingSession;

  let content: React.ReactNode;
  if (isPageLoading) {
    content = (
      <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ArenaCardSkeleton key={index} />
        ))}
      </div>
    );
  } else if (arenas.length > 0) {
    content = (
      <>
        <Row gutter={[24, 24]} className="mb-10">
          {arenas.map((arena) => (
            <Col key={arena.id} xs={24} sm={24} lg={12}>
              <Link href={`/quadras/${arena.id}`} passHref>
                <ArenaCard
                  arena={arena}
                  showDescription={false}
                />
              </Link>
            </Col>
          ))}
        </Row>
        {totalArenas > pageSize && (
          <Flex justify='center'>
            <Pagination
              current={currentPage}
              total={totalArenas}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </Flex>
        )}
      </>
    );
  } else {
    content = (
      <div className="text-center py-10 text-gray-500">
        Nenhuma arena encontrada.
      </div>
    );
  }

  return (
    <Flex
      vertical
      className={`!px-4 sm:!px-10 lg:!px-40 !py-8 flex-1 ${isDarkMode ? 'bg-dark-mode' : 'bg-light-mode'}`}
    >
      <div className="w-full">
        {isLocationBannerVisible && (
          <Alert
            type="info"
            showIcon
            icon={<GlobalOutlined />}
            closable
            onClose={() => setIsLocationBannerVisible(false)}
            className="!mb-6"
            message={
              <Flex
                className="flex-col sm:flex-row sm:items-center sm:justify-between w-full"
              >
                <div className="flex-grow sm:mr-4">
                  <Typography.Text strong className='!text-lg'>
                    Encontre arenas perto de você
                  </Typography.Text>
                  <Typography.Paragraph type="secondary" className="!mb-1">
                    Permita o acesso à sua localização para descobrirmos as melhores opções na sua área.
                  </Typography.Paragraph>
                </div>

                <ButtonPrimary
                  text='Usar minha localização'
                  onClick={handleRequestLocation}
                  loading={isAskingPermission}
                  className="mt-3 sm:mt-0"
                />
              </Flex>
            }
          />
        )}

        <CitySports
          loading={isPageLoading}
          selectedSport={selectedSport}
          setSelectedSport={handleSportChange}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSearchCommit={handleSearchCommit}
          setCurrentPage={setCurrentPage}
          allSports={allSports}
          sportIcons={sportIcons}
        />

        {location && !committedSearchTerm && (
          <div className="my-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
            <Text type="secondary">
              Arenas próximas a você.
            </Text>
          </div>
        )}

        {content}
      </div>
    </Flex>
  );
}
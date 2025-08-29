'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Spin, Alert } from 'antd';
import { debounce } from 'lodash';

interface MapaProps {
    apiKey: string;
    addressToSearch: string;
    onCoordinatesChange: (lat: number, lng: number) => void;
}

const containerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '8px'
};

// Localização central do Brasil como padrão
const defaultCenter = {
    lat: -14.235004,
    lng: -51.92528
};

export const MapaInterativoBusca: React.FC<MapaProps> = ({ apiKey, addressToSearch, onCoordinatesChange }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey,
    });

    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
    const [geocodingError, setGeocodingError] = useState<string | null>(null);

    // Função para buscar coordenadas (geocodificação)
    const geocodeAddress = useCallback(debounce(async (address: string) => {
        if (!address || !isLoaded) return;
        setGeocodingError(null);

        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=pt-BR`);
            const data = await response.json();

            console.log("Resposta da geocodificação:", data);

            if (data.status === 'OK' && data.results.length > 0) {
                const location = data.results[0].geometry.location; // { lat, lng }
                setMapCenter(location);
                setMarkerPosition(location);
                onCoordinatesChange(location.lat, location.lng);
            } else {
                setGeocodingError('Endereço não encontrado. Verifique os dados ou ajuste o marcador manualmente.');
            }
        } catch (error) {
            console.error("Erro na geocodificação:", error);
            setGeocodingError('Não foi possível buscar as coordenadas.');
        }
    }, 2000), [apiKey, isLoaded, onCoordinatesChange]); // Debounce de 1.5s

    useEffect(() => {
        // Aciona a busca sempre que o endereço completo mudar
        if (addressToSearch) {
            geocodeAddress(addressToSearch);
        }
    }, [addressToSearch, geocodeAddress]);

    // Handler para quando o usuário arrasta o marcador
    const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setMarkerPosition(newPos);
            onCoordinatesChange(newPos.lat, newPos.lng);
        }
    };

    if (loadError) {
        return <Alert message="Erro" description="Não foi possível carregar o mapa." type="error" showIcon />;
    }

    return isLoaded ? (
        <div style={{ position: 'relative' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={markerPosition ? 17 : 4}
            >
                {markerPosition && (
                    <MarkerF
                        position={markerPosition}
                        draggable={true}
                        onDragEnd={handleMarkerDragEnd}
                    />
                )}
            </GoogleMap>
            {geocodingError && <Alert message={geocodingError} type="warning" showIcon style={{ marginTop: '10px' }} />}
        </div>
    ) : <Spin />;
};
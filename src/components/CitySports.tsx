"useClient"

import { AutoComplete, Col, Input, Row, Select } from 'antd';
import React, { useMemo } from 'react'

interface CitySportsProps {
    readonly loading?: boolean;
    readonly selectedSport?: string;
    readonly setSelectedSport?: (sport: string) => void;
    readonly inputValue: string;
    readonly setInputValue: (value: string) => void;
    readonly onSearchCommit?: (term: string) => void;
    readonly setCurrentPage: (page: number) => void;
    readonly allSports: readonly string[];
    readonly sportIcons: Readonly<Record<string, React.ReactNode>>;
}

const LoadingSkeleton = () => (
    <div className="animate-pulse">
        <div className="mb-6 h-12 w-full rounded-full bg-gray-300"></div>
        <div className="mb-8 h-12 w-full rounded-full bg-gray-300"></div>
    </div>
);


export default function CitySports({
    loading,
    selectedSport,
    setSelectedSport,
    inputValue,
    setInputValue,
    setCurrentPage,
    onSearchCommit,
    allSports,
    sportIcons,
}: CitySportsProps) {

    const sportSelectOptions = useMemo(() => allSports.map((sport) => (
        <Select.Option key={sport} value={sport}>
            <div className="flex items-center gap-x-2">
                {sportIcons[sport]}
                <span>{sport}</span>
            </div>
        </Select.Option>
    )), [allSports, sportIcons]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <Row gutter={[16, 16]} className="mb-8">
            {/* Coluna da Cidade */}
            <Col xs={24} md={12}>
                <AutoComplete
                    value={inputValue}
                    onChange={setInputValue}
                    onSelect={(value) => {
                        setInputValue(value);
                        if (onSearchCommit) onSearchCommit(value);
                    }}
                    onSearch={() => {
                        if (onSearchCommit) onSearchCommit(inputValue);
                    }}
                    onBlur={() => {
                        if (onSearchCommit) onSearchCommit(inputValue);
                    }}
                    options={[
                        { value: 'Floriano' },
                        { value: 'Quixadá' },
                        { value: 'Fortaleza' },
                    ]}
                    filterOption={(inputValue, option) =>
                        option!.value.toUpperCase().includes(inputValue.toUpperCase())
                    }
                    className="w-full"
                >
                    <Input.Search
                        size="large"
                        placeholder="Nome da cidade"
                        allowClear
                        style={{ borderRadius: '9999px' }}
                    />
                </AutoComplete>
            </Col>

            {/* Coluna do Esporte */}
            <Col xs={24} md={12}>
                <Select
                    size="large"
                    value={selectedSport || undefined}
                    placeholder="Selecione um esporte"
                    className="w-full"
                    onChange={(sport) => {
                        if (setSelectedSport) setSelectedSport(sport);
                        setCurrentPage(1);
                    }}
                    style={{ borderRadius: '9999px' }}
                    allowClear
                    onClear={() => {
                        if (setSelectedSport) setSelectedSport('');
                        setCurrentPage(1);
                    }}
                >
                    {sportSelectOptions}
                </Select>
            </Col>
        </Row>
    )
}
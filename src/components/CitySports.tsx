"useClient"

import { SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import React from 'react'

interface CitySportsProps {
    readonly selectedSport: string;
    readonly setSelectedSport: (sport: string) => void;
    readonly searchTerm: string;
    readonly setSearchTerm: (term: string) => void;
    readonly setCurrentPage: (page: number) => void;
    readonly allSports: readonly string[];
    readonly sportIcons: Readonly<Record<string, React.ReactNode>>;
}

export default function CitySports({
    selectedSport,
    setSelectedSport,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    allSports,
    sportIcons,
}: CitySportsProps) {

    return (
        <>
            <div className="mb-6">
                <Input
                    size="large"
                    placeholder="Digite o nome da cidade"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    suffix={<SearchOutlined className="!text-gray-400" />}
                    className="w-full !rounded-full"
                />
            </div>

            <div className="mb-8 flex overflow-x-auto whitespace-nowrap space-x-3 pb-3 custom-scrollbar">
                {allSports.map((sport) => (
                    <Button
                        key={sport}
                        type={selectedSport === sport ? 'primary' : 'default'}
                        onClick={() => {
                            setSelectedSport(sport);
                            setCurrentPage(1);
                        }}
                        className={`!rounded-full !px-5 !py-2 !h-auto !text-sm flex items-center shadow-sm ${selectedSport === sport
                            ? 'bg-green-primary text-white hover:!bg-green-500 border-green-primary hover:!border-green-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:text-green-primary hover:!border-green-primary'
                            }`}
                    >
                        {sportIcons[sport]}
                        {sport}
                    </Button>
                ))}
            </div>
        </>
    )
}

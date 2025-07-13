"useClient"

import { SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import React from 'react'

interface CitySportsProps {
    readonly loading?: boolean;
    readonly selectedSport?: string;
    readonly setSelectedSport?: (sport: string) => void;
    readonly inputValue: string;
    readonly setInputValue: (value: string) => void;
    readonly handleSearchCommit?: () => void;
    readonly setCurrentPage: (page: number) => void;
    readonly allSports: readonly string[];
    readonly sportIcons: Readonly<Record<string, React.ReactNode>>;
}

export default function CitySports({
    loading,
    selectedSport,
    setSelectedSport,
    inputValue,
    setInputValue,
    setCurrentPage,
    handleSearchCommit,
    allSports,
    sportIcons,
}: CitySportsProps) {

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="mb-6 h-10 w-full rounded-full bg-gray-300"></div>

                <div className="w-full mb-8 flex space-x-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-10 w-28 rounded-full bg-gray-300"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6">
                <Input
                    size="large"
                    placeholder="Digite o nome da cidade para buscar"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={handleSearchCommit}
                    onBlur={handleSearchCommit}
                    suffix={
                        <SearchOutlined
                            onClick={handleSearchCommit}
                            className="!text-gray-400 cursor-pointer hover:!text-green-primary transition-colors"
                        />
                    }
                    className="w-full !rounded-full"
                />
            </div>

            <div className="mb-8 flex overflow-x-auto whitespace-nowrap space-x-3 pb-3 custom-scrollbar">
                {allSports.map((sport) => (
                    <Button
                        key={sport}
                        type={selectedSport === sport ? 'primary' : 'default'}
                        onClick={() => {
                            if (setSelectedSport) {
                                setSelectedSport(sport);
                            }
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
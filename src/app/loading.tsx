"use client"

import React from 'react'

export default function Loading() {
    return (
        <div className="px-4 sm:px-10 lg:px-40 flex-1 flex items-center justify-center">
            <div className="flex items-center justify-center">
                <div className="soccer-ball w-[50px] h-[50px] mx-2.5 bg-contain bg-no-repeat"></div>
                <div className="soccer-ball w-[50px] h-[50px] mx-2.5 bg-contain bg-no-repeat"></div>
                <div className="soccer-ball w-[50px] h-[50px] mx-2.5 bg-contain bg-no-repeat"></div>
            </div>
        </div>
    )
}
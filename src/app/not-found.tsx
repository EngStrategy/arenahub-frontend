'use client'

import { ButtonPrimary } from '@/components/ButtonPrimary'
import React from 'react'
import localFont from 'next/font/local'
import Link from 'next/link'

const minhaFonteCustomizada = localFont({
  src: '../../public/fonts/jsMath-cmr10.ttf',
})

export default function NotFound() {

  return (
    <main className="px-4 sm:px-10 lg:px-40 py-8 flex-1 flex flex-col items-center justify-center text-center">
      <div className='flex flex-col items-center justify-center gap-4'>
        <h1 className={` text-9xl ${minhaFonteCustomizada.className}`}>404</h1>
        <p className='text-gray-500'>Desculpe, a página que você está procurando não existe.</p>

        <div>
         <Link href="/" className='text-blue-500 hover:underline'>
            <ButtonPrimary
              text="Voltar para a Página Inicial"
              className='!px-6'
            />
          </Link>
        </div>
      </div>
    </main>
  )
}

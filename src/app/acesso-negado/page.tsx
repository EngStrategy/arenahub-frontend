'use client'

import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary'
import React from 'react'
import localFont from 'next/font/local'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeProvider'

const minhaFonteCustomizada = localFont({
  src: '../../../public/fonts/jsMath-cmr10.ttf',
})

export default function AcessoNegado() {
  const { isDarkMode } = useTheme();

  return (
    <main
      className="px-4 sm:px-10 lg:px-40 py-8 flex-1 flex flex-col items-center justify-center text-center"
      style={{ backgroundColor: isDarkMode ? '#0c0c0fff' : 'white', }}
    >
      <div className='flex flex-col items-center justify-center gap-4'>
        <h1 className={`text-6xl ${minhaFonteCustomizada.className}`}>Acesso Negado</h1>
        <p className='text-gray-500'>Você não tem permissão para acessar esta página.</p>

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

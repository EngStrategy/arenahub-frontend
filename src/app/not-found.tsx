'use client'

import { ButtonPrimary } from '@/components/Buttons/ButtonPrimary'
import React from 'react'
import localFont from 'next/font/local'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeProvider'
import { useAuth } from '@/context/hooks/use-auth'

const minhaFonteCustomizada = localFont({
  src: '../../public/fonts/jsMath-cmr10.ttf',
})

export default function NotFound() {
  const { isUserArena } = useAuth()
  const { isDarkMode } = useTheme();

  return (
    <main
      className="px-4 sm:px-10 lg:px-40 py-8 flex-1 flex flex-col items-center justify-center text-center"
      style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}
    >
      <div className='flex flex-col items-center justify-center gap-4'>
        <h1 className={` text-9xl ${minhaFonteCustomizada.className}`}>404</h1>
        <p className='text-gray-500'>Desculpe, a página que você está procurando não existe.</p>

        <div>
          <Link
            href={
              isUserArena ? '/dashboard' : "/arenas"
            }
            className='text-blue-500 hover:underline'>
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

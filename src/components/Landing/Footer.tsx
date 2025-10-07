type Props = {
    year: number,
    isDarkMode: boolean
};

export function Footer({ year, isDarkMode }: Readonly<Props>) {
    return (
        <footer
            id="contato"
            className={`py-12 px-6 ${isDarkMode ? 'bg-zinc-900 text-gray-300' : 'bg-green-200 text-gray-700'}`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 grid gap-8 md:grid-cols-3">
                <div>
                    <img
                        src={`${isDarkMode ? "/icons/logo_arenahub_dark.svg" : "/icons/logo_arenahub_light.svg"}`}
                        alt="ArenaHub Logo"
                        className="h-14"
                    />
                    <p className="mt-4 text-sm">
                        Plataforma online para reservar quadras esportivas de forma simples
                        e rápida.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Links Rápidos</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li>
                            <a href="#benefits" className={`hover:!text-gray-800 ${isDarkMode ? '!text-gray-500' : '!text-green-600'}`}>
                                Benefícios
                            </a>
                        </li>
                        <li>
                            <a href="#features" className={`hover:!text-gray-800 ${isDarkMode ? '!text-gray-500' : '!text-green-600'}`}>
                                Funcionalidades
                            </a>
                        </li>
                        <li>
                            <a href="#faq" className={`hover:!text-gray-800 ${isDarkMode ? '!text-gray-500' : '!text-green-600'}`}>
                                FAQ
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Contato</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li>Email: arenahub.2025@gmail.com</li>
                        <li>Telefone: (89) 99467-3969</li>
                    </ul>
                </div>
            </div>
            <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm">
                © {year} ArenaHub. Todos os direitos reservados.
            </div>
        </footer>
    );
}
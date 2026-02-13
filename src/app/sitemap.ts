import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://arenahub.app';

    return [
        {
            url: baseUrl
        },
        {
            url: `${baseUrl}/acesso-negado`
        },
        {
            url: `${baseUrl}/ajuda-suporte`
        },
        {
            url: `${baseUrl}/arenas`
        },
        {
            url: `${baseUrl}/ativacao-conta`
        },
        {
            url: `${baseUrl}/confirmar-email`
        },
        {
            url: `${baseUrl}/dashboard`
        },
        {
            url: `${baseUrl}/feedback`
        },
        {
            url: `${baseUrl}/forgot-password`
        },
        {
            url: `${baseUrl}/jogos-abertos`
        },
        {
            url: `${baseUrl}/login`
        },
        {
            url: `${baseUrl}/perfil/arena/agendamentos`
        },
        {
            url: `${baseUrl}/perfil/arena/agendamentos/novo`
        },
        {
            url: `${baseUrl}/perfil/arena/alterar-senha`
        },
        {
            url: `${baseUrl}/perfil/arena/assinatura`
        },
        {
            url: `${baseUrl}/perfil/arena/informacoes`
        },
        {
            url: `${baseUrl}/perfil/arena/planos`
        },
        {
            url: `${baseUrl}/perfil/arena/quadras`
        },
        {
            url: `${baseUrl}/perfil/arena/quadras/[quadraId]`
        },
        {
            url: `${baseUrl}/perfil/arena/quadras/editar/[quadraId]`
        },
        {
            url: `${baseUrl}/perfil/arena/quadras/nova`
        },
        {
            url: `${baseUrl}/perfil/atleta/agendamentos`
        },
        {
            url: `${baseUrl}/perfil/atleta/alterar-senha`
        },
        {
            url: `${baseUrl}/perfil/atleta/informacoes`
        },
        {
            url: `${baseUrl}/perfil/planos`
        },
        {
            url: `${baseUrl}/quem-somos`
        },
        {
            url: `${baseUrl}/redefinir-senha`
        },
        {
            url: `${baseUrl}/registro`
        },
        {
            url: `${baseUrl}/sorteio`
        },
        {
            url: `${baseUrl}/subscricao/sucesso`
        },
        {
            url: `${baseUrl}/politica-privacidade`
        },
        {
            url: `${baseUrl}/not-found`
        },
        {
            url: `${baseUrl}/$`
        }
    ];
}

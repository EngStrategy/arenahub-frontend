import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        const imgurFormData = new FormData();
        imgurFormData.append('image', file);

        const IMGUR_CLIENT_ID = process.env.NEXT_PUBLIC_CLIENTID_IMGUR;

        if (!IMGUR_CLIENT_ID) {
            console.error("IMGUR_CLIENT_ID não encontrada no servidor.");
            return NextResponse.json({ error: 'Configuração do servidor de upload ausente.' }, { status: 500 });
        }

        const response = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
            },
            body: imgurFormData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Erro na resposta do Imgur:", data);
            return NextResponse.json({ error: data?.data?.error || 'Falha ao fazer upload para o Imgur.' }, { status: data.status || 500 });
        }

        console.log("Sucesso no upload pelo servidor. Link:", data.data.link);
        return NextResponse.json({ link: data.data.link });

    } catch (error) {
        console.error("Erro na API /api/upload:", error);
        const message = error instanceof Error ? error.message : "Erro desconhecido no servidor.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
    try {
        const { listaRacha, quantidadeTimes } = await request.json();

        const apiKey = process.env.DEEPSEEK_API_KEY;
        const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

        if (!apiKey) {
            return NextResponse.json({ error: 'DEEPSEEK_API_KEY não configurada no servidor.' }, { status: 500 });
        }

        const openai = new OpenAI({
            baseURL: baseURL,
            apiKey: apiKey,
        });

        const prompt = `Você é um organizador de jogos de futebol (racha). 
Divida os seguintes jogadores em ${quantidadeTimes} times.
Tente deixar os times equilibrados (se houver indicação de nível ou posição), embaralhados(misturados entre si), sem repetição de jogadores entre times.
Retorne o resultado estritamente em formato JSON, com a seguinte estrutura:
{
  "times": [
    {
      "nome": "Time 1",
      "jogadores": ["Nome 1", "Nome 2"]
    }
  ]
}

Lista de jogadores:
${listaRacha}`;

        // @ts-ignore
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            model: "deepseek-v4-flash",
            // @ts-ignore
            thinking: { "type": "disabled" },
            stream: false,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;

        try {
            const parsedData = JSON.parse(content || '{}');
            return NextResponse.json(parsedData);
        } catch (e) {
            return NextResponse.json({ error: 'Erro ao parsear resposta da IA.', raw: content }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Erro ao gerar sorteio:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}

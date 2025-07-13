export type Solicitacao = {
    id: number;
    atleta: {
        id: number;
        nome: string;
        urlFotoPerfil?: string;
    };
};

// Função para buscar solicitações de um agendamento específico
export const getSolicitacoesPorAgendamento = async (
    agendamentoId: number
): Promise<Solicitacao[]> => {
    console.log(`Buscando solicitações para o agendamento ID: ${agendamentoId}`);
    // Ex: return httpRequests.getMethod(`${URLS.AGENDAMENTOS}/${agendamentoId}/solicitacoes`);

    // Retornando dados mockados para fins de demonstração
    return new Promise((resolve) =>
        setTimeout(
            () =>
                resolve([
                    {
                        id: 101,
                        atleta: {
                            id: 201,
                            nome: 'Carlos Nogueira',
                            urlFotoPerfil: 'https://i.pravatar.cc/150?img=1',
                        },
                    },
                    {
                        id: 102,
                        atleta: {
                            id: 202,
                            nome: 'Beatriz Lima',
                            urlFotoPerfil: 'https://i.pravatar.cc/150?img=2',
                        },
                    },
                ]),
            1000
        )
    );
};

// Função para aceitar uma solicitação
export const aceitarSolicitacao = async (
    solicitacaoId: number
): Promise<void> => {
    console.log(`Aceitando solicitação ID: ${solicitacaoId}`);
    // Ex: return httpRequests.postMethod(`${URLS.SOLICITACOES}/${solicitacaoId}/aceitar`);
    return new Promise((resolve) => setTimeout(resolve, 500));
};

// Função para recusar uma solicitação
export const recusarSolicitacao = async (
    solicitacaoId: number
): Promise<void> => {
    console.log(`Recusando solicitação ID: ${solicitacaoId}`);
    // Ex: return httpRequests.deleteMethod(`${URLS.SOLICITACOES}/${solicitacaoId}`);
    return new Promise((resolve) => setTimeout(resolve, 500));
};
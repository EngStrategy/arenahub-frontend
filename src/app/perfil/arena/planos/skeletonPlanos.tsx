const PlanCardSkeleton = ({ destaque = false }: { destaque?: boolean }) => (
    <div className={`w-full max-w-sm bg-white p-8 rounded-lg shadow-md ${destaque ? 'border-2 border-gray-200' : ''}`}>
        {destaque && (
            <div className="absolute top-4 right-4 h-6 w-24 bg-gray-200 rounded-md"></div>
        )}
        <div className="flex flex-col items-center">
            {/* Título do Plano */}
            <div className="h-8 bg-gray-300 rounded-md w-1/2 mb-4"></div>
            
            {/* Preço */}
            <div className="h-10 bg-gray-200 rounded-lg w-3/4 my-4"></div>
            
            {/* Economia */}
            <div className="h-5 bg-gray-200 rounded-md w-1/3 mb-6"></div>

            <div className="w-full h-px bg-gray-200 my-4"></div>

            {/* Lista de Features */}
            <div className="w-full space-y-3 mb-6">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>

            {/* Botão */}
            <div className="h-12 bg-gray-300 rounded-lg w-full"></div>
        </div>
    </div>
);


export const PlanosPageSkeleton = () => {
    return (
        <div className="animate-pulse px-4 sm:px-10 lg:px-20 pt-8 pb-20 flex-1">
            {/* Cabeçalho */}
            <div className="text-center mb-12">
                <div className="h-10 bg-gray-300 rounded-lg w-1/2 max-w-md mx-auto"></div>
                <div className="h-5 bg-gray-200 rounded-md w-3/4 max-w-xl mx-auto mt-4"></div>
            </div>

            {/* Cards */}
            <div className="flex justify-center items-center gap-8 flex-wrap">
                <PlanCardSkeleton />
                <PlanCardSkeleton destaque={true} />
                <PlanCardSkeleton />
            </div>
        </div>
    );
};
import { MaterialFornecido } from "@/app/api/entities/quadra";

export const formatarMaterial = (material: MaterialFornecido): string => {
    const materialMap: Record<MaterialFornecido, string> = {
        BOLA: 'Bola',
        COLETE: 'Colete',
        LUVA: 'Luva',
        CONE: 'Cone',
        APITO: 'Apito',
        BOMBA: 'Bomba',
        MARCADOR_PLACAR: 'Marcador de Placar',
        BOTAO_GOL: 'Botão do Gol'
    };
    return materialMap[material] || material.charAt(0).toUpperCase() + material.slice(1).toLowerCase();
}
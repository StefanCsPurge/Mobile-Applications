export interface AssetProps {
    id?: number;
    name: string;
    postBy: string;
    borrowers?: string[];
    status?: string;
}
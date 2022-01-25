export interface MessageProps {
    id?: number;
    text: string;
    read: boolean;
    sender: string;
    created: number;
}
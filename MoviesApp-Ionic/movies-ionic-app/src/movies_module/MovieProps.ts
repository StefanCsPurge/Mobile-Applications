import {Photo} from "../core/usePhotoCamera";


export interface MovieProps {
    _id?: string;
    title: string;
    year: number;
    photo?: Photo;
    location?: {latitude: number | undefined, longitude: number | undefined};
}

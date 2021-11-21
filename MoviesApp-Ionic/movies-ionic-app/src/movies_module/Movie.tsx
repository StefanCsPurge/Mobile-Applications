import React from 'react';
import {IonCol, IonImg, IonItem} from '@ionic/react';
import { MovieProps } from './MovieProps';

interface MoviePropsExt extends MovieProps {
    onEdit: (_id?: string) => void;
}

const Movie: React.FC<MoviePropsExt> = ({ _id, title,year, photo,location, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(_id)} >
                <IonCol><b>{title}</b> ({year})</IonCol>
                <IonCol size="1"  className="ion-margin-end">
                    Movie photo
                    {photo && <IonImg src={photo.data}/>}
                </IonCol>
                <IonCol>
                    <b> Premiere location </b> <br/>
                    Latitude: {location?.latitude} <br/> Longitude: {location?.longitude}
                </IonCol>
        </IonItem>
    );
};

export default Movie;
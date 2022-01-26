import React from 'react';
import {IonButton, IonCol, IonItem} from '@ionic/react';
import { AssetProps } from './AssetProps';

interface AssetPropsExt extends AssetProps {
    compFn: () => void;
    buttonText: string;
}

const AssetComp: React.FC<AssetPropsExt> = ({name, postBy, status, buttonText, compFn }) => {
    return (
        <IonItem>
            <IonCol>{name}</IonCol>
            <IonCol><b>posted by:</b> {postBy}</IonCol>
            <IonCol><b>status:</b> {status}</IonCol>
            <IonButton onClick={() => compFn()}>{buttonText}</IonButton>
        </IonItem>
    );
};

export default AssetComp;
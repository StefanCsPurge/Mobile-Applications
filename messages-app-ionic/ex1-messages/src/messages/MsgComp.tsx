import React, {useState} from 'react';
import {IonCol, IonItem} from '@ionic/react';
import { MessageProps } from './MessageProps';

interface MessagePropsExt extends MessageProps {
    onShow: (id?: number) => void;
}

const MsgComp: React.FC<MessagePropsExt> = ({ id, text, read, sender,created, onShow }) => {
    const [showBolded, setShowBolded] = useState<boolean>(!read);
    setTimeout(() => setShowBolded(false),1000 + id!);
    return (
        <IonItem onLoad={() => onShow(id)}>
            {showBolded && <IonCol><b>{text}</b></IonCol>}
            {!showBolded && <IonCol>{text}</IonCol>}
            <IonCol><small>{new Date(created).toLocaleString()}</small></IonCol>
        </IonItem>
    );
};

export default MsgComp;
import React from 'react';
import {IonCol, IonItem} from '@ionic/react';
import { UserProps } from './UserProps';

interface UserPropsExt extends UserProps {
    onEdit: (name?: string) => void;
}

const UserComp: React.FC<UserPropsExt> = ({ name, unreadCount, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(name)} >
                <IonCol><b>{name}</b> ({unreadCount} unread messages)</IonCol>
        </IonItem>
    );
};

export default UserComp;
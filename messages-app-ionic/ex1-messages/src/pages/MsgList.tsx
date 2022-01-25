import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonButtons, IonButton,} from '@ionic/react';
import { MessageContext } from '../messages/MessageProvider';
import './Home.css';
import React, {useContext, useEffect, useState} from "react";
import MsgComp from "../messages/MsgComp";
import { RouteComponentProps } from 'react-router';
import {MessageProps} from "../messages/MessageProps";

interface MsgListProps extends RouteComponentProps<{
    name?: string;
}> {}

const MsgList: React.FC<MsgListProps> = ({ history, match }) => {
    const { messages, saveMsg, savingError } = useContext(MessageContext);
    const [userMessages, setUserMessages] = useState<MessageProps[]>([]);
    useEffect(() => {
        const routeName = match.params.name || '';
        const theMsg = messages!
            .filter(msg => msg.sender === routeName)
            .sort((one, two) => (one.created < two.created ? -1 : 1));
        setUserMessages(theMsg);
        for(let idx in theMsg)
            if(!theMsg[idx].read) {      // update messages as seen
                saveMsg && saveMsg({...theMsg[idx], read: true});
            }
    }, [match.params.name]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Messages center</IonTitle>
                    <IonButtons slot="end" className="ion-padding-end">
                        <IonButton onClick={() => {history.push("/home");}}>
                            Back
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding">
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Messages center</IonTitle>
                    </IonToolbar>
                </IonHeader>

                {userMessages && (
                    <IonList>
                        {userMessages
                            .map(({ id, text, read, sender, created}) => {
                                return <MsgComp key={id} id={id} text={text} read={read} sender={sender} created={created} onShow={_ => console.log(id)}/>;
                            })
                        }
                        {savingError && (
                            <div>{savingError.message || 'Failed to update message'}</div>
                        )}
                    </IonList>
                )}
            </IonContent>
        </IonPage>
    );
};

export default MsgList;

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLoading,
    IonList, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonCol} from '@ionic/react';
import { AssetContext } from '../assets/AssetProvider';
import './Home.css';
import React, {useContext, useEffect, useState} from "react";
import AssetComp from "../assets/AssetComp";
import { RouteComponentProps } from 'react-router';
import {AssetProps} from "../assets/AssetProps";
import {Storage} from "@capacitor/storage";


const UserAssets: React.FC<RouteComponentProps> = ({ history }) => {
    const { assets, createAss, saving, savingError, setUsername } = useContext(AssetContext);
    const [name, setName] = useState('');
    useEffect(() => {
        // const routeName = match.params.name || '';
        // const theMsg = messages!
        //     .filter(msg => msg.sender === routeName)
        //     .sort((one, two) => (one.created < two.created ? -1 : 1));
        // setUserMessages(theMsg);
        // for(let idx in theMsg)
        //     if(!theMsg[idx].read) {      // update messages as seen
        //         saveMsg && saveMsg({...theMsg[idx], read: true});
        //     }
    }, []);
    const handleAddUserAsset = () => {
        Storage.get({key: 'username'}).then(v => {
            const newAsset: AssetProps = { name, postBy:  v.value! };
            createAss && createAss(newAsset).then(_ => setName(''));
        });
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>User assets</IonTitle>
                    <IonButtons slot="end" className="ion-padding-end">
                        <IonButton onClick={() => { Storage.clear().then(_ => setUsername!('')); history.push("/home");}}>
                            Back
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding">
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">User assets</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonItem>
                    <IonLabel color="danger">Name:</IonLabel>
                    <IonInput placeholder="Enter asset name" value={name} onIonChange={e => setName(e.detail.value || '')} />
                    <IonButton class="ion-margin" onClick={handleAddUserAsset}>Add</IonButton>
                </IonItem>
                {assets && (
                    <IonList>
                        {assets
                            .map(({ id, name, postBy, borrowers, status}) => {
                                return <AssetComp key={id} id={id} name={name} postBy={postBy} borrowers={borrowers} status={status}
                                                  buttonText={'Change status'} compFn={() =>
                                  { let newStatus = (status ==='active') ? 'inactive' : 'active';
                                    createAss!({id, name, postBy, status: newStatus}).then();} }/>
                            })
                        }
                    </IonList>
                )}
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{'Failed to create asset'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default UserAssets;

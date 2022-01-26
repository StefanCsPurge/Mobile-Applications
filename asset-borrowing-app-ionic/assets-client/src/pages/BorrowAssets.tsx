import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLoading,
    IonList, IonButtons, IonButton
} from '@ionic/react';
import { AssetContext } from '../assets/AssetProvider';
import './Home.css';
import React, {useContext} from "react";
import AssetComp from "../assets/AssetComp";
import { RouteComponentProps } from 'react-router';
import {Storage} from "@capacitor/storage";


const BorrowAssets: React.FC<RouteComponentProps> = ({ history }) => {
    const { activeAssets, saving, savingError, setUsername, borrowAss, username, fetching, fetchingError } = useContext(AssetContext);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Borrow assets</IonTitle>
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
                        <IonTitle size="large">Borrow assets</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonLoading isOpen={fetching} message="Fetching assets" />
                {activeAssets && (
                    <IonList>
                        {activeAssets
                            .map(({ id, name, postBy, borrowers, status}) => {
                                let bText = 'Borrow'; let the_borrowers: string[] = borrowers || [];
                                if(the_borrowers.length > 0 && the_borrowers[0] === username) bText = 'Return';
                                return <AssetComp key={id} id={id} name={name} postBy={postBy} borrowers={borrowers} status={status}
                                                  buttonText={bText} compFn={() => {
                                                      if(bText === 'Return') the_borrowers.splice(0,1);
                                                      else {
                                                          if(the_borrowers[the_borrowers.length-1] !== username)
                                                                the_borrowers.push(username);
                                                          if(the_borrowers[0] !== username) console.log(`Asset already borrowed.`);
                                                      }
                                                      borrowAss!({id, name, postBy, borrowers: the_borrowers}).then();
                                }} />
                            })
                        }
                    </IonList>
                )}
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{'Failed to process asset'}</div>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch assets'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default BorrowAssets;

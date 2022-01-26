import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonText
} from '@ionic/react';
import { ItemContext } from '../items/ItemProvider';
import './Home.css';
import React, {useContext, useEffect, useState} from "react";
import ItemComp from "../items/ItemComp";
import { RouteComponentProps } from 'react-router';
import {Storage} from "@capacitor/storage";


const ItemsList: React.FC<RouteComponentProps> = ({ history }) => {
    const { items, setToken } = useContext(ItemContext);
    const [crtQ, setCrtQ] = useState(0);
    const [correctA, setCorrectA] = useState(0);

    useEffect(() => {
        Storage.get({key: 'token'}).then(v => {
            if(!v.value) Storage.clear().then(_ => {
                setToken!('');
                history.push("/authenticate")
            });
            else setToken && setToken(v.value);
        });
        setTimeout(() => items && crtQ<items.length && setCrtQ(crtQ+1), 5000);
    }, []);

    //let time = setTimeout(() => items && crtQ<items.length && setCrtQ(crtQ+1), 5000);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Questions</IonTitle>
                    <IonButtons slot="end" className="ion-padding-end">
                        <IonButton onClick={() => { Storage.clear().then(_ => setToken!('')); history.push("/authenticate");}}>
                            Log out
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding">
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Items</IonTitle>
                    </IonToolbar>
                </IonHeader>
                { items && crtQ>=0 && crtQ<items.length &&
                                    <div>
                                         <IonText className="ion-padding ion-text-center">Question {crtQ+1}/{items.length}</IonText>
                                         <IonText className="ion-padding ion-text-center">Correct answers: {correctA} / {crtQ}</IonText>
                                         <ItemComp key={items[crtQ].id}
                                                          id={items[crtQ].id} text={items[crtQ].text} options={items[crtQ].options}
                                                          indexCorrectOption={items[crtQ].indexCorrectOption}
                                                          buttonText={'Next question'} compFn={(answer) => {
                                                              answer && setCorrectA(correctA+1);
                                                              setCrtQ(crtQ+1);
                                                          }
                                                          }/>
                                    </div>
                }
                { items && crtQ>=items.length &&
                    <div className="ion-align-items-center ion-text-center">
                                <IonText className="ion-padding ion-text-center">The quiz is done.</IonText><p> </p>
                                <IonText className="ion-padding ion-text-center">Correct answers: {correctA} / {items.length}</IonText>
                    </div>
                }
            </IonContent>
        </IonPage>
    );
};

export default ItemsList;

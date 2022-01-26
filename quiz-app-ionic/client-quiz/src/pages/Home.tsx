import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton, IonLoading,
} from '@ionic/react';
import './Home.css';
import React, {useContext, useEffect, useState} from "react";
import {RouteComponentProps} from "react-router";
import {Storage} from "@capacitor/storage";
import {ItemContext} from "../items/ItemProvider";

const Home: React.FC<RouteComponentProps> = ({ history }) => {
    const { authenticateUser, saving, savingError, downloaded, items, questionIds } = useContext(ItemContext);
    const [ userId, setUserId ] = useState('');
    const handleButton = () => {
        Storage.set({key: 'token', value: userId}).then( _ => {
            authenticateUser && authenticateUser(userId);
            }
        );
    };
    useEffect(() => {
        if(downloaded) history.push("/quiz");
    }, [downloaded]);

      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
                <IonTitle>Authenticate</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent fullscreen className="ion-padding ion-text-center">
            <IonHeader collapse="condense">
              <IonToolbar>
                  <IonTitle size="large">Authenticate</IonTitle>
              </IonToolbar>
            </IonHeader>
              <IonItem class="ion-text-center ion-margin-horizontal">
                  <IonLabel position="floating"> ID from the teacher </IonLabel>
                  <IonInput
                      value={userId}
                      onIonChange={e => {
                          setUserId(e.detail.value || '');
                      }}
                  />
              </IonItem>
              {userId &&
                <IonButton class="ion-margin" onClick={handleButton}>Start quiz</IonButton>
              }
              <IonLoading isOpen={saving} message={"Authenticating ..."}/>
              {savingError && (
                  <div className={"ion-padding"}>{savingError || 'Failed to authenticate'}</div>
              )}
              {items && questionIds && questionIds.length>0 &&
                  <IonItem className="ion-margin-bottom ion-text-center">
                      <IonLabel> {`Downloading questions: ${items?.length}/${questionIds?.length}`}</IonLabel>
                  </IonItem>}
          </IonContent>
        </IonPage>
      );
};

export default Home;

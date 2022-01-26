import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton} from '@ionic/react';
import './Home.css';
import React, {useContext, useState} from "react";
import {RouteComponentProps} from "react-router";
import {Storage} from "@capacitor/storage";
import {AssetContext} from "../assets/AssetProvider";

const Home: React.FC<RouteComponentProps> = ({ history }) => {
    const { setUsername } = useContext(AssetContext);
    const [ user, setUser ] = useState('');
    const handleAddAsset = () => {
        setUsername && setUsername(user);
        history.push("/userAssets");
    };
    const handleBorrowAsset = () => {
        setUsername && setUsername(user);
        history.push("/borrowAssets");
    };

      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
                <IonTitle>Home</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent fullscreen className="ion-padding ion-text-center">
            <IonHeader collapse="condense">
              <IonToolbar>
                  <IonTitle size="large">Home</IonTitle>
              </IonToolbar>
            </IonHeader>
              <IonItem class="ion-text-center ion-margin-horizontal">
                  <IonLabel position="floating"> Username </IonLabel>
                  <IonInput
                      value={user}
                      onIonChange={e => {
                          setUser(e.detail.value || '');
                          Storage.set({key: 'username', value: e.detail.value || ''}).then();
                      }}
                  />
              </IonItem>
              {user &&
                <IonButton class="ion-margin" onClick={handleAddAsset}>Add assets</IonButton>
              }
              {user &&
                  <IonButton class="ion-margin" onClick={handleBorrowAsset}>Borrow asset</IonButton>
              }
          </IonContent>
        </IonPage>
      );
};

export default Home;

import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import {
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';
import {useNetwork} from "../core/useNetwork";

const log = getLogger('Login');

interface LoginState {
  username?: string;
  password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const { username, password } = state;
    const { networkStatus } = useNetwork();
    const handleLogin = () => {
        log('handleLogin...');
        login?.(username, password);
    };
    log('render');
    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/' }} />
    }
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Login</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent class="ion-padding ion-text-center">
            <IonInput
              placeholder="Username"
              value={username}
              onIonChange={e => setState({
                ...state,
                username: e.detail.value || ''
              })}/>
            <IonInput
              type="password"
              placeholder="Password"
              value={password}
              onIonChange={e => setState({
                ...state,
                password: e.detail.value || ''
              })}/>
              <IonLoading isOpen={isAuthenticating}/>
              <IonButton class="ion-margin" onClick={handleLogin}>Login</IonButton>

              {authenticationError && (
              <div>{'Invalid credentials' || 'Failed to authenticate'}</div>
              )}
            <p> </p>
            <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '5vh'}}>
                Network status is: {networkStatus.connected ? "online" : "offline"}
                {/* {JSON.stringify(networkStatus)} */}
            </div>
          </IonContent>
        </IonPage>
      );
};

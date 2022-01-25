import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLoading, IonList} from '@ionic/react';
import { MessageContext } from '../messages/MessageProvider';
import './Home.css';
import React, {useContext} from "react";
import UserComp from "../messages/UserComp";
import {RouteComponentProps} from "react-router";

const Home: React.FC<RouteComponentProps> = ({ history }) => {
    const { users, fetching, fetchingError } = useContext(MessageContext);

      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
                <IonTitle>Messages center</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent fullscreen className="ion-padding">
            <IonHeader collapse="condense">
              <IonToolbar>
                  <IonTitle size="large">Messages center</IonTitle>
              </IonToolbar>
            </IonHeader>

              <IonLoading isOpen={fetching} message="Fetching messages" />
              {users && (
                  <IonList>
                      {users
                          .map(({ name, unreadCount, lastUnreadTime}) =>
                              <UserComp key={name} name={name} unreadCount={unreadCount} lastUnreadTime={lastUnreadTime}
                                        onEdit={name => history.push(`/msgList/${name}`)} />)}
                  </IonList>
              )}
              {fetchingError && (
                  <div>{fetchingError.message || 'Failed to fetch messages'}</div>
              )}
          </IonContent>
        </IonPage>
      );
};

export default Home;

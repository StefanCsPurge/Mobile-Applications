import React, {useContext, useState} from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonButton, IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage, IonSearchbar, IonSelect, IonSelectOption,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Movie from './Movie';
import { MyAboutModal } from '../core/MyAboutModal';
import { getLogger } from '../core';
import { MovieContext } from './MovieProvider';
import {useNetwork} from "../core/useNetwork";
import {Storage} from "@capacitor/storage";
import {AuthContext} from "../auth";

const log = getLogger('MovieList');

const MovieList: React.FC<RouteComponentProps> = ({ history }) => {
    const { movies, fetching, fetchingError, startFilter } = useContext(MovieContext);
    const { networkStatus } = useNetwork();
    const { logout } = useContext(AuthContext);
    const [searchTitle, setSearchTitle] = useState<string>('');
    const handleLogOut = () => {
        Storage.clear().then(() => console.log("Storage cleared"));
        logout?.();
        history.push("/login");
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle color="primary">Movies App</IonTitle>
                    <IonButtons slot="end">
                        <MyAboutModal />
                        <IonButton onClick={() => history.push('/gallery')}>
                            Gallery
                        </IonButton>
                        <IonButton onClick={handleLogOut}>
                            Log out
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonToolbar>
                    <IonSelect slot="start" placeholder="Filter by year" onIonChange={e => startFilter?.(e.detail.value)}>
                        <IonSelectOption key={1} value={1}> older than 2010 </IonSelectOption>
                        <IonSelectOption key={2} value={2010}> 2010 or newer </IonSelectOption>
                        <IonSelectOption key={3} value={420}> all </IonSelectOption>
                    </IonSelect>
                    <IonSearchbar
                        value={searchTitle}
                        debounce={200}
                        onIonChange={e => setSearchTitle(e.detail.value!)}
                    >
                    </IonSearchbar>
                </IonToolbar>
                <IonLoading isOpen={fetching} message="Fetching movies" />
                {movies && (
                    <IonList>
                        {movies
                            .filter(movie => movie.title.toLowerCase().indexOf(searchTitle.toLowerCase()) >= 0)
                            .map(({ _id, title, year, photo, location}) =>
                            <Movie key={_id} _id={_id} title={title} year={year} photo={photo} location={location} onEdit={_id => history.push(`/movie/${_id}`)} />)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch movies'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/movie')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
                <p> </p>
                <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '10vh'}}>
                    Network status is: {networkStatus.connected ? "online" : "offline"}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default MovieList;

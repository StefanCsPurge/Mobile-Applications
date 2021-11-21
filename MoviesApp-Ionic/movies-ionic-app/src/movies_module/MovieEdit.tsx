import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonLabel,
    IonItem,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCol, IonImg, IonIcon, IonActionSheet, createAnimation
} from '@ionic/react';
import { getLogger } from '../core';
import { MovieContext } from './MovieProvider';
import { RouteComponentProps } from 'react-router';
import { MovieProps } from './MovieProps';
import { camera, close, trash } from 'ionicons/icons';
import { Photo, usePhotoCamera } from '../core/usePhotoCamera';
import {MyMap} from "../core/MyMap";
import { useMyLocation } from '../core/useMyLocation';

const log = getLogger('MovieEdit');

interface MovieEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const MovieEdit: React.FC<MovieEditProps> = ({ history, match }) => {
    const { movies, saving, savingError, saveMovie, deleting, deletingError, delMovie} = useContext(MovieContext);
    const [title, setTitle] = useState('');
    const [year, setYear] = useState(0);
    const [photo, setPhoto] = useState<Photo|undefined>(undefined);
    const [movie, setMovie] = useState<MovieProps>();
    const [locationSetByUser, setLocationSetByUser] = useState(false);

    const myLocation = useMyLocation();
    const { latitude: lat, longitude: lng } = myLocation.position?.coords || {};
    const [location, setLocation] = useState( {latitude: lat, longitude: lng});
    useEffect(() => {
        if (! locationSetByUser)
            setLocation({ latitude: lat, longitude: lng });
    },[lat,lng]);
    useEffect(buttonAnimation, []);

    function buttonAnimation() {
        const el = document.querySelector('.button-save');
        if (el) {
            const animation = createAnimation()
                .addElement(el)
                .duration(1000)
                .direction('alternate')
                .iterations(Infinity)
                .keyframes([
                    {offset: 0, background: 'green', opacity: '1' },
                    {offset: 1, background: '', opacity: '0.5'}
                ]);
            animation.play().then();
        }
    }
    const { takePhoto, deletePhoto } = usePhotoCamera();
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const movie = movies?.find(m => m._id === routeId);
        setMovie(movie);
        if (movie) {
            setTitle(movie.title);
            setYear(movie.year);
            setPhoto(movie.photo);
            if (movie.location)
            {
                setLocationSetByUser(true);
                setLocation(movie.location);
            }
        }
    }, [match.params.id, movies]);
    const handleSave = () => {
        const editedMovie = movie ? { ...movie, title, year, photo, location } : { title, year, photo, location };
        saveMovie && saveMovie(editedMovie).then(() => history.goBack());
    };
    const handleDelete = () => {
        const editedMovie = movie ? { ...movie, title, year, photo, location } : { title, year, photo, location };
        delMovie && delMovie(editedMovie).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit movie</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave} className="button-save">
                            Save
                        </IonButton>
                        <IonButton onClick={handleDelete} color="danger">
                            Delete
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel color="danger">Title:</IonLabel>
                    <IonInput placeholder="Enter title" value={title} onIonChange={e => setTitle(e.detail.value || '')} />
                </IonItem>
                <IonItem>
                    <IonLabel color="danger">Year:</IonLabel>
                    <IonInput placeholder="Enter year" value={year} onIonChange={e => setYear(Number(e.detail.value) || 0)} />
                </IonItem>
                <IonItem>
                    <IonLabel color="danger">Movie photo:</IonLabel>
                    {photo &&<IonCol size="2">
                         <IonImg onClick={() => setPhotoToDelete(photo)}
                                src={photo.data}/>
                    </IonCol>}
                    <IonCol>
                        <IonButton onClick={() => takePhoto().then(res => setPhoto(res)) }>
                            <IonIcon icon={camera}/>
                        </IonButton>
                    </IonCol>

                    <IonActionSheet
                        isOpen={!!photoToDelete}
                        buttons={[{
                            text: 'Delete',
                            role: 'destructive',
                            icon: trash,
                            handler: () => {
                                if (photoToDelete) {
                                    deletePhoto(photoToDelete).then(_ => {
                                        setPhoto(undefined);
                                        setPhotoToDelete(undefined);
                                    });
                                }
                            }
                        }, {
                            text: 'Cancel',
                            icon: close,
                            role: 'cancel'
                        }]}
                        onDidDismiss={() => setPhotoToDelete(undefined)}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel color="danger">Premiere location:</IonLabel>
                    <IonCol>
                        Latitude: {location.latitude}
                    </IonCol>
                    <IonCol>
                        Longitude: {location.longitude}
                    </IonCol>
                </IonItem>

                {location.latitude && location.longitude &&
                <MyMap
                    lat={location.latitude}
                    lng={location.longitude}
                    onMapClick={(e: google.maps.MapMouseEvent) => {
                            log('onMap');
                            setLocation({latitude: e.latLng!.toJSON().lat, longitude: e.latLng!.toJSON().lng});
                            setLocationSetByUser(true);
                        }
                    }
                    onMarkerClick={log('onMarker')}
                /> }
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save movie'}</div>
                )}
                <IonLoading isOpen={deleting} />
                {deletingError && (
                    <div>{deletingError.message || 'Failed to delete movie'}</div>
                )}

            </IonContent>
        </IonPage>
    );
};

export default MovieEdit;
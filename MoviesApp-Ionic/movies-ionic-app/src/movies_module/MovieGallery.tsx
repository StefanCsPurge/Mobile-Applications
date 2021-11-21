import React, { useState } from 'react';
import {
    IonCard,
    IonContent,
    IonHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonPage,
    IonTitle,
    IonToolbar, useIonViewDidEnter,
    useIonViewWillEnter
} from '@ionic/react';

const MovieGallery: React.FC = () => {
    const [items, setItems] = useState<string[]>([]);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

    async function fetchData() {
        const url: string = 'https://source.unsplash.com/featured/?film,acting';
        const url2: string = 'https://source.unsplash.com/featured/?art';
        const url3: string = 'https://source.unsplash.com/featured/?movie';
        let images: string[] = []
        let res1: Response = await fetch(url);
        while(items.includes(res1.url) || images.includes(res1.url)) res1 = await fetch(url);
        images.push(res1.url);

        let res2: Response = await fetch(url2);
        while(items.includes(res2.url) || images.includes(res2.url)) res2 = await fetch(url2);
        images.push(res2.url);

        let res3: Response = await fetch(url3);
        while(items.includes(res3.url) || images.includes(res3.url)) res3 = await fetch(url3);
        images.push(res3.url);

        if (images.length > 0){
            setItems([...items, ...images]);
            setDisableInfiniteScroll(images.length < 3);
        }
        else
            setDisableInfiniteScroll(true);
    }

    useIonViewDidEnter(async () => {
        await fetchData();
    });

    async function searchNext($event: CustomEvent<void>) {
        await fetchData();
        await ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle className="ion-text-center ion-padding">Art gallery</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-text-center">
                {items.map((item: string, i: number) => {
                    return <IonCard key={`${i}`}><img src={item}/></IonCard>
                })}
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                                   onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more images...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
            </IonContent>
        </IonPage>
    );
};

export default MovieGallery;
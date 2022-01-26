import React, {useState} from 'react';
import {IonButton, IonItem, IonList, IonLabel, IonGrid, IonRadioGroup, IonListHeader, IonRadio} from '@ionic/react';
import { ItemProps } from './ItemProps';
import './question.css';

interface AssetPropsExt extends ItemProps {
    compFn: (answer: boolean) => void;
    buttonText: string;
}

const ItemComp: React.FC<AssetPropsExt> = ({text, options, indexCorrectOption, buttonText, compFn }) => {
    const [selected, setSelected] = useState();
    return (
        <IonGrid className='ion-align-items-center ion-text-center ion-padding'>
                {options && (
                    <IonList>
                        <IonRadioGroup value={selected} onIonChange={e => setSelected(e.detail.value)}>
                            <IonListHeader>
                                <IonLabel>{text}</IonLabel>
                            </IonListHeader>
                            {options.map(( opt, i) => (
                                <IonItem key={i} className={ i===selected ? 'selectedGood' : ''}>
                                    <IonLabel className='ion-color-success'>{opt}</IonLabel>
                                    <IonRadio slot="start" value={i}/>
                                </IonItem>
                            ))}
                        </IonRadioGroup>
                    </IonList>)
                }

                <IonButton className="ion-margin" onClick={() => compFn(selected === indexCorrectOption)}>{buttonText}</IonButton>

        </IonGrid>
    );
};

export default ItemComp;
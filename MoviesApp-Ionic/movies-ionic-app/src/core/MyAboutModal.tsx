import React, { useState } from 'react';
import {createAnimation, IonModal, IonButton, IonContent, IonTitle, IonCol, IonImg} from '@ionic/react';

export const MyAboutModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const enterAnimation = (baseEl: any) => {
    const backdropAnimation = createAnimation()
      .addElement(baseEl.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' }
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  const leaveAnimation = (baseEl: any) => {
    setShowModal(false);
    return enterAnimation(baseEl).direction('reverse');
  }

  return (
    <>
      <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
        <IonContent className="ion-padding ion-margin ion-text-center">
            <p>This web application is all about the best movies in the world.</p><br/>
            <IonCol>
                <img src="https://gearmoose.com/wp-content/uploads/2017/04/best-movies-for-men.jpg" alt="Best movies"/>
            </IonCol> <br/> <br/>
            <span className="imdbRatingPlugin" data-user="ur84967216" data-title="tt6723592" data-style="p1"><a
                href="https://www.imdb.com/title/tt6723592/?ref_=plg_rt_1"><img
                src="https://ia.media-imdb.com/images/G/01/imdb/plugins/rating/images/imdb_46x22.png" alt=" Tenet(2020) on IMDb"/>
            </a></span>
        </IonContent>
        <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
      </IonModal>
      <IonButton onClick={() => setShowModal(true)}>About</IonButton>
    </>
  );
};

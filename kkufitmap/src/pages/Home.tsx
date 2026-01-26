import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Home: React.FC = () => {
  return (
    <IonPage >
      <IonContent fullscreen>
        <IonTitle className='ion-tab-bar'>
        Home Page
        </IonTitle>
      </IonContent>
    </IonPage>
  );
};

export default Home;




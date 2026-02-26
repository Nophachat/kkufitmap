/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */

import {
  IonApp,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';

import {
  homeOutline,
  mapOutline,
  bookmarkOutline,
  pulseOutline,
  personOutline
} from 'ionicons/icons';

import Home from './pages/Home';
import Map from './pages/Map';
import Saved from './pages/Saved';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import "./theme/variables.css";
setupIonicReact();
const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>

        {/* หน้าจอ */}
        <IonRouterOutlet>
          <Route exact path="/home" component={Home} />
          <Route exact path="/map" component={Map} />
          <Route exact path="/saved" component={Saved} />
          <Route exact path="/activity" component={Activity} />
          <Route exact path="/profile" component={Profile} />
          <Redirect exact from="/" to="/home" />
        </IonRouterOutlet>

        {/* แท็บล่าง */}
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={homeOutline} />
            <IonLabel>HOME</IonLabel>
          </IonTabButton>

          <IonTabButton tab="map" href="/map">
            <IonIcon icon={mapOutline} />
            <IonLabel>MAP</IonLabel>
          </IonTabButton>

          <IonTabButton tab="saved" href="/saved">
            <IonIcon icon={bookmarkOutline} />
            <IonLabel>SAVED</IonLabel>
          </IonTabButton>

          <IonTabButton tab="activity" href="/activity">
            <IonIcon icon={pulseOutline} />
            <IonLabel>Activity</IonLabel>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>PROFILE</IonLabel>
          </IonTabButton>
        </IonTabBar>

      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;








setupIonicReact();





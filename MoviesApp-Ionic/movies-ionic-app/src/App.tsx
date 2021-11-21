import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
// import Home from './pages/Home';
import { MovieEdit, MovieList, MovieGallery} from "./movies_module";
import { MovieProvider } from "./movies_module/MovieProvider";
import { AuthProvider, Login, PrivateRoute } from './auth';

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

/* Theme variables */
import './theme/variables.css';

// https://source.unsplash.com/featured/?movie,film

const App: React.FC = () => {

    return (
        <IonApp>
            <IonReactRouter>
                <IonRouterOutlet>
                    <AuthProvider>
                        <Route path="/login" component={Login} exact={true}/>
                        <MovieProvider>
                            <PrivateRoute path="/movies" component={MovieList} exact={true}/>
                            <PrivateRoute path="/movie" component={MovieEdit} exact={true}/>
                            <PrivateRoute path="/movie/:id" component={MovieEdit} exact={true}/>
                            <PrivateRoute path="/gallery" component={MovieGallery} exact={true}/>
                        </MovieProvider>
                        <Route exact path="/" render={() => <Redirect to="/movies"/>}/>
                    </AuthProvider>
                </IonRouterOutlet>
            </IonReactRouter>
        </IonApp>
    );
};

export default App;

import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { cambiarThema } from '../Core/helper';
import { Theme } from '../Components/Theme';
import { Simulation as SimulationPage } from '../Pages/Simulation';

import { store } from './store';
import { Provider } from "react-redux";
import { useStates } from '../Hooks/useStates';

import { GeneralNotification } from '../Components/Modals/general/GeneralNotification'; 

function AppUI() {
    const { ls, s, f } = useStates();

    useEffect(() => {
        cambiarThema(ls?.theme);
    }, [ls?.theme]);

    useEffect(() => {
        if(f.app && f.app.getModes){
            f.app.getModes();
        }
    }, []);

    return (
        <div className={`text-[var(--my-minor)] bg-my-${ls?.theme || 'dark'}`}>
            <Routes>
                <Route path="*" element={ <SimulationPage /> } />
            </Routes>

            {!!s.modals?.general?.notification &&
            <GeneralNotification />}
        </div>
    );
}

function App(props) {
    return (
        <Provider store={store}>
            <AppUI />
        </Provider>
    );
}

export default App;

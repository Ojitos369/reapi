import { useEffect } from 'react';
import { cambiarThema } from '../Core/helper';
import { Theme } from '../Components/Theme';

import { Main as MainPage } from '../Pages/Main';
import { Index as IndexPage } from '../Pages/Index';
import { Test as TestPage } from '../Pages/Test';
import { Chat as ChatPage } from '../Pages/Chat';
import { Route, Routes, Navigate } from 'react-router-dom';

import { P404 } from '../Pages/P404';

import { store } from './store';
import { Provider } from "react-redux";
import { useStates } from '../Hooks/useStates';

import { GeneralNotification } from '../Components/Modals/general/GeneralNotification'; 

const BgTheme = () => {
    const { ls } = useStates();
    return (
        <>
            <div className={`wipeInDown full-page-container bg-my-${ls.theme}`}></div>
            <Theme />
        </>
    )
}

function AppUI() {
    const { ls, s } = useStates();

    useEffect(() => {
        cambiarThema(ls?.theme);
    }, [ls?.theme]);

    return (
        <div className={`text-[var(--my-minor)]`}>
            <BgTheme />
            <Routes>
                <Route path="" element={ <MainPage /> } >
                    <Route path="" element={ <IndexPage /> } />
                    <Route path="chat" element={ <ChatPage /> } />
                    <Route path="test" element={ <TestPage /> } />
                    <Route path="*" element={ <P404 /> } />
                    {/* -----------   /404   ----------- */}
                </Route>
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
